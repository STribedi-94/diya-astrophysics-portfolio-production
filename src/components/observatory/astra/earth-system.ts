import * as THREE from "three";

import { imageService } from "@/services/images";

export const EARTH_RADIUS = 1;

/**
 * Shared world-space Sun direction for Project Diya Astra.
 *
 * Earth illumination, visible Sun position, spacecraft lighting,
 * solar-panel response and future Moon lighting must use this same
 * normalized world-space direction.
 */
export const ASTRA_SUN_DIRECTION =
  new THREE.Vector3(
    0.35,
    0.3,
    1,
  ).normalize();

export type EarthSystemOptions = {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  onReady: () => void;
  isDisposed: () => boolean;
};

export type EarthSystem = {
  group: THREE.Group;

  uniforms: {
    dayMap: {
      value: THREE.Texture | null;
    };

    nightMap: {
      value: THREE.Texture | null;
    };

    sunDir: {
      value: THREE.Vector3;
    };

    reveal: {
      value: number;
    };
  };

  atmosphereMaterial:
    THREE.ShaderMaterial;

  cloudMaterial:
    THREE.ShaderMaterial;

  dispose: () => void;
};

function createFallbackTexture(
  key: "dayMap" | "nightMap",
) {
  const canvas =
    document.createElement("canvas");

  canvas.width = 4;
  canvas.height = 4;

  const context =
    canvas.getContext("2d");

  if (context) {
    context.fillStyle =
      key === "dayMap"
        ? "#1b3a5c"
        : "#000010";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.NoColorSpace;

  return texture;
}

export function createEarthSystem({
  scene,
  renderer,
  onReady,
  isDisposed,
}: EarthSystemOptions): EarthSystem {
  const disposables: Array<{
    dispose: () => void;
  }> = [];

  const sunDirection =
    ASTRA_SUN_DIRECTION
      .clone()
      .normalize();

  const group =
    new THREE.Group();

  scene.add(group);

  const earthGeometry =
    new THREE.SphereGeometry(
      EARTH_RADIUS,
      96,
      64,
    );

  const uniforms = {
    dayMap: {
      value:
        null as THREE.Texture | null,
    },

    nightMap: {
      value:
        null as THREE.Texture | null,
    },

    sunDir: {
      value:
        sunDirection.clone(),
    },

    reveal: {
      value: 0,
    },
  };

  const earthMaterial =
    new THREE.ShaderMaterial({
      uniforms,

      transparent: true,

      /*
       * The shader already performs its own
       * final colour/exposure treatment.
       */
      toneMapped: false,

      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;

          vec4 worldPosition =
            modelMatrix *
            vec4(
              position,
              1.0
            );

          vWorldPosition =
            worldPosition.xyz;

          vWorldNormal =
            normalize(
              mat3(modelMatrix) *
              normal
            );

          gl_Position =
            projectionMatrix *
            viewMatrix *
            worldPosition;
        }
      `,

      fragmentShader: `
        uniform sampler2D dayMap;
        uniform sampler2D nightMap;

        uniform vec3 sunDir;
        uniform float reveal;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dayTexture =
            texture2D(
              dayMap,
              vUv
            ).rgb;

          vec3 nightTexture =
            texture2D(
              nightMap,
              vUv
            ).rgb;

          vec3 normal =
            normalize(
              vWorldNormal
            );

          vec3 lightDirection =
            normalize(
              sunDir
            );

          vec3 viewDirection =
            normalize(
              cameraPosition -
              vWorldPosition
            );

          float solarDot =
            dot(
              normal,
              lightDirection
            );

          float viewDot =
            max(
              dot(
                normal,
                viewDirection
              ),
              0.0
            );

          /*
           * Physically coherent day/night mask.
           *
           * Negative solarDot values are night.
           * Positive solarDot values are day.
           */
          float dayMask =
            smoothstep(
              -0.18,
              0.24,
              solarDot
            );

          /*
           * Stronger sunlight toward the centre
           * of the illuminated hemisphere.
           */
          float sunlight =
            smoothstep(
              -0.02,
              0.82,
              solarDot
            );

          /*
           * Narrow atmospheric twilight region.
           */
          float twilightBand =
            smoothstep(
              -0.24,
              -0.015,
              solarDot
            ) *
            (
              1.0 -
              smoothstep(
                0.02,
                0.24,
                solarDot
              )
            );

          /*
           * DAY SIDE
           *
           * The NoColorSpace texture setting
           * preserves the visible brightness that
           * was verified during diagnostic QA.
           */
          vec3 dayColor =
            dayTexture *
            (
              1.20 +
              sunlight *
              1.05
            );

          /*
           * Slightly warm direct sunlight.
           */
          dayColor *=
            mix(
              vec3(
                1.02,
                1.03,
                1.05
              ),

              vec3(
                1.22,
                1.14,
                1.02
              ),

              sunlight
            );

          /*
           * Preserve spherical form without
           * crushing the daylight texture.
           */
          float daylightShape =
            0.90 +
            pow(
              viewDot,
              1.25
            ) *
            0.16;

          dayColor *=
            daylightShape;

          /*
           * NIGHT SIDE
           *
           * Preserve Black Marble city lights
           * without making oceans artificially bright.
           */
          float cityBrightness =
            max(
              max(
                nightTexture.r,
                nightTexture.g
              ),
              nightTexture.b
            );

          vec3 cityLights =
            nightTexture *
            (
              0.88 +
              cityBrightness *
              1.25
            );

          vec3 nightSurface =
            dayTexture *
            0.008;

          vec3 nightColor =
            nightSurface +
            cityLights;

          /*
           * Twilight colour.
           */
          vec3 twilightColor =
            mix(
              nightColor,
              dayColor,
              0.46
            );

          twilightColor +=
            vec3(
              0.28,
              0.085,
              0.018
            ) *
            twilightBand *
            0.50;

          /*
           * Final day/night composition.
           */
          vec3 color =
            mix(
              nightColor,
              dayColor,
              dayMask
            );

          color =
            mix(
              color,
              twilightColor,
              twilightBand *
              0.64
            );

                    /*
           * Premium ocean specular response.
           *
           * The ocean mask is derived from the existing Blue Marble
           * texture, so no additional texture asset is required.
           */
          float dominantLandChannel =
            max(
              dayTexture.r,
              dayTexture.g
            );

          float oceanBlueDominance =
            dayTexture.b -
            dominantLandChannel *
            0.72;

          float oceanDarkness =
            1.0 -
            smoothstep(
              0.30,
              0.72,
              dot(
                dayTexture,
                vec3(
                  0.299,
                  0.587,
                  0.114
                )
              )
            );

          float oceanMask =
            smoothstep(
              0.015,
              0.19,
              oceanBlueDominance
            ) *
            oceanDarkness;

          vec3 reflectedLight =
            reflect(
              -lightDirection,
              normal
            );

          float reflectionAlignment =
            max(
              dot(
                reflectedLight,
                viewDirection
              ),
              0.0
            );

          float broadOceanSheen =
            pow(
              reflectionAlignment,
              18.0
            );

          float focusedSunGlint =
            pow(
              reflectionAlignment,
              72.0
            );

          float horizonFresnel =
            pow(
              1.0 -
              viewDot,
              3.2
            );

          float specularVisibility =
            oceanMask *
            sunlight *
            dayMask;

          vec3 oceanSpecularColor =
            mix(
              vec3(
                0.18,
                0.38,
                0.72
              ),

              vec3(
                1.0,
                0.88,
                0.68
              ),

              focusedSunGlint
            );

          color +=
            oceanSpecularColor *
            specularVisibility *
            (
              broadOceanSheen *
              0.24 +
              focusedSunGlint *
              0.82
            );

          color +=
            vec3(
              0.08,
              0.24,
              0.52
            ) *
            oceanMask *
            horizonFresnel *
            dayMask *
            0.12;

          /*
           * Restrained limb darkening.
           */
          float limbVisibility =
            smoothstep(
              0.0,
              0.30,
              viewDot
            );

          color *=
            mix(
              0.80,
              1.0,
              limbVisibility
            );

          gl_FragColor =
            vec4(
              color,
              reveal
            );
        }
      `,
    });

  const earthMesh =
    new THREE.Mesh(
      earthGeometry,
      earthMaterial,
    );

  group.add(earthMesh);

  disposables.push(
    earthGeometry,
    earthMaterial,
  );

  /*
   * Premium procedural cloud layer.
   *
   * This is intentionally independent from the stable Earth shader.
   * It uses the same Sun direction and reveal uniform, but it does not
   * require a new imageService asset or a third readiness dependency.
   */
  const cloudGeometry =
    new THREE.SphereGeometry(
      EARTH_RADIUS * 1.016,
      96,
      64,
    );

  const cloudMaterial =
    new THREE.ShaderMaterial({
      transparent: true,

      depthWrite: false,

      depthTest: true,

      toneMapped: false,

      side:
        THREE.FrontSide,

      uniforms: {
        reveal:
          uniforms.reveal,

        sunDir:
          uniforms.sunDir,

        time: {
          value: 0,
        },
      },

      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;

          vec4 worldPosition =
            modelMatrix *
            vec4(
              position,
              1.0
            );

          vWorldPosition =
            worldPosition.xyz;

          vWorldNormal =
            normalize(
              mat3(modelMatrix) *
              normal
            );

          gl_Position =
            projectionMatrix *
            viewMatrix *
            worldPosition;
        }
      `,

      fragmentShader: `
        uniform vec3 sunDir;
        uniform float reveal;
        uniform float time;

        varying vec2 vUv;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        float hash21(
          vec2 point
        ) {
          point =
            fract(
              point *
              vec2(
                123.34,
                456.21
              )
            );

          point +=
            dot(
              point,
              point +
              45.32
            );

          return
            fract(
              point.x *
              point.y
            );
        }

        float valueNoise(
          vec2 point
        ) {
          vec2 cell =
            floor(point);

          vec2 local =
            fract(point);

          local =
            local *
            local *
            (
              3.0 -
              2.0 *
              local
            );

          float a =
            hash21(
              cell
            );

          float b =
            hash21(
              cell +
              vec2(
                1.0,
                0.0
              )
            );

          float c =
            hash21(
              cell +
              vec2(
                0.0,
                1.0
              )
            );

          float d =
            hash21(
              cell +
              vec2(
                1.0,
                1.0
              )
            );

          return
            mix(
              mix(
                a,
                b,
                local.x
              ),

              mix(
                c,
                d,
                local.x
              ),

              local.y
            );
        }

        float fbm(
          vec2 point
        ) {
          float value =
            0.0;

          float amplitude =
            0.52;

          mat2 rotation =
            mat2(
              0.82,
              -0.57,
              0.57,
              0.82
            );

          for (
            int octave = 0;
            octave < 6;
            octave += 1
          ) {
            value +=
              amplitude *
              valueNoise(
                point
              );

            point =
              rotation *
              point *
              2.03 +
              vec2(
                17.1,
                9.2
              );

            amplitude *=
              0.50;
          }

          return value;
        }

        void main() {
          vec3 normal =
            normalize(
              vWorldNormal
            );

          vec3 lightDirection =
            normalize(
              sunDir
            );

          vec3 viewDirection =
            normalize(
              cameraPosition -
              vWorldPosition
            );

          float solarDot =
            dot(
              normal,
              lightDirection
            );

          float viewDot =
            max(
              dot(
                normal,
                viewDirection
              ),
              0.0
            );

          /*
           * UV-space weather motion.
           *
           * Mesh rotation provides the large-scale drift while the
           * animated offsets provide subtle internal cloud evolution.
           */
          vec2 cloudUv =
            vec2(
              vUv.x *
              6.2 +
              time *
              0.0026,

              vUv.y *
              3.1
            );

          float broadWeather =
            fbm(
              cloudUv
            );

          float detailWeather =
            fbm(
              cloudUv *
              2.35 +
              vec2(
                -time *
                0.0042,

                time *
                0.0014
              )
            );

          float cloudField =
            broadWeather *
            0.72 +
            detailWeather *
            0.28;

          /*
           * Higher threshold keeps large procedural weather systems
           * transparent instead of creating a dense white shell.
           */
          float cloudMask =
            smoothstep(
              0.600,
              0.765,
              cloudField
            );

          /*
           * Fine erosion breaks large opaque weather masses into layered,
           * semi-transparent cloud systems with visible gaps.
           */
          float cloudErosion =
            fbm(
              cloudUv *
              4.60 +
              vec2(
                time *
                0.0012,
                -time *
                0.0007
              )
            );

          cloudMask *=
            smoothstep(
              0.34,
              0.70,
              cloudErosion
            );

          cloudMask *=
            smoothstep(
              0.02,
              0.12,
              vUv.y
            ) *
            (
              1.0 -
              smoothstep(
                0.88,
                0.98,
                vUv.y
              )
            );

          float dayAmount =
            smoothstep(
              -0.20,
              0.34,
              solarDot
            );

          float directLight =
            smoothstep(
              -0.04,
              0.86,
              solarDot
            );

          float twilight =
            smoothstep(
              -0.24,
              -0.01,
              solarDot
            ) *
            (
              1.0 -
              smoothstep(
                0.02,
                0.24,
                solarDot
              )
            );

          float rim =
            pow(
              1.0 -
              viewDot,
              2.1
            );

          vec3 nightCloudColor =
            vec3(
              0.045,
              0.075,
              0.13
            );

          vec3 dayCloudColor =
            mix(
              vec3(
                0.58,
                0.66,
                0.76
              ),

              vec3(
                0.96,
                0.98,
                1.0
              ),

              directLight
            );

          vec3 cloudColor =
            mix(
              nightCloudColor,
              dayCloudColor,
              dayAmount
            );

          cloudColor +=
            vec3(
              0.88,
              0.30,
              0.08
            ) *
            twilight *
            0.22;

          cloudColor +=
            vec3(
              0.10,
              0.22,
              0.46
            ) *
            rim *
            dayAmount *
            0.14;

          float nightVisibility =
            mix(
              0.055,
              1.0,
              dayAmount
            );

          /*
           * Restrained opacity prevents the procedural clouds from
           * obscuring the Earth surface and city-light system.
           */
          float alpha =
            cloudMask *
            nightVisibility *
            (
              0.12 +
              directLight *
              0.24
            ) *
            reveal;

          alpha *=
            smoothstep(
              0.0,
              0.22,
              viewDot
            );

          if (
            alpha <
            0.006
          ) {
            discard;
          }

          gl_FragColor =
            vec4(
              cloudColor,
              alpha
            );
        }
      `,
    });

  const cloudMesh =
    new THREE.Mesh(
      cloudGeometry,
      cloudMaterial,
    );

  cloudMesh.renderOrder =
    1;

  group.add(cloudMesh);

  const cloudAnimationStart =
    performance.now() *
    0.001;

  cloudMesh.onBeforeRender =
    () => {
      const elapsed =
        performance.now() *
        0.001 -
        cloudAnimationStart;

      cloudMaterial
        .uniforms
        .time
        .value =
        elapsed;

      /*
       * Independent atmospheric circulation.
       * This remains intentionally slower than the visible Earth rotation.
       */
      cloudMesh.rotation.y =
        elapsed *
        0.0105;
    };

  disposables.push(
    cloudGeometry,
    cloudMaterial,
  );

  /*
   * Sun-aware atmosphere.
   */
  const atmosphereGeometry =
    new THREE.SphereGeometry(
      EARTH_RADIUS * 1.055,
      72,
      48,
    );

  const atmosphereMaterial =
    new THREE.ShaderMaterial({
      transparent: true,

      side:
        THREE.BackSide,

      depthWrite: false,

      blending:
        THREE.AdditiveBlending,

      toneMapped: false,

      uniforms: {
        reveal: {
          value: 0,
        },

        sunDir: {
          value:
            sunDirection.clone(),
        },
      },

      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPosition =
            modelMatrix *
            vec4(
              position,
              1.0
            );

          vWorldPosition =
            worldPosition.xyz;

          vWorldNormal =
            normalize(
              mat3(modelMatrix) *
              normal
            );

          gl_Position =
            projectionMatrix *
            viewMatrix *
            worldPosition;
        }
      `,

      fragmentShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        uniform float reveal;
        uniform vec3 sunDir;

        void main() {
          vec3 normal =
            normalize(
              vWorldNormal
            );

          vec3 viewDirection =
            normalize(
              cameraPosition -
              vWorldPosition
            );

          vec3 lightDirection =
            normalize(
              sunDir
            );

          float viewDot =
            abs(
              dot(
                viewDirection,
                normal
              )
            );

          float rim =
            pow(
              1.0 -
              viewDot,
              3.15
            );

          float solarDot =
            dot(
              normal,
              lightDirection
            );

          float dayAmount =
            smoothstep(
              -0.18,
              0.32,
              solarDot
            );

          float terminator =
            smoothstep(
              -0.22,
              -0.015,
              solarDot
            ) *
            (
              1.0 -
              smoothstep(
                0.02,
                0.22,
                solarDot
              )
            );

          vec3 daylightAtmosphere =
  vec3(
    0.20,
    0.56,
    1.18
  );

vec3 sunsetAtmosphere =
  vec3(
    1.18,
    0.36,
    0.08
  );

float upperScattering =
  pow(
    dayAmount,
    1.35
  );

vec3 atmosphereColor =
  daylightAtmosphere *
  (
    0.10 +
    upperScattering *
    1.42
  );

atmosphereColor +=
  sunsetAtmosphere *
  terminator *
  0.78;

atmosphereColor +=
  vec3(
    0.12,
    0.26,
    0.52
  ) *
  rim *
  upperScattering *
  0.18;

float nightSuppression =
  mix(
    0.05,
    1.0,
    dayAmount
  );

float alpha =
  rim *
  nightSuppression *
  reveal *
  0.96;

          gl_FragColor =
            vec4(
              atmosphereColor *
              alpha,
              alpha
            );
        }
      `,
    });

  const atmosphereMesh =
    new THREE.Mesh(
      atmosphereGeometry,
      atmosphereMaterial,
    );

  atmosphereMesh.renderOrder =
    2;

  scene.add(atmosphereMesh);

  disposables.push(
    atmosphereGeometry,
    atmosphereMaterial,
  );

  const textureLoader =
    new THREE.TextureLoader();

  let loadedTextureCount = 0;

  function finishTexture() {
    loadedTextureCount += 1;

    if (
      loadedTextureCount === 2 &&
      !isDisposed()
    ) {
      onReady();
    }
  }

  function loadTexture(
    url: string,
    key: "dayMap" | "nightMap",
  ) {
    textureLoader.load(
      url,

      (texture) => {
        if (isDisposed()) {
          texture.dispose();
          return;
        }

        /*
         * Verified during Visual QA:
         * SRGBColorSpace caused the custom shader
         * output to appear severely underexposed.
         */
        texture.colorSpace =
          THREE.NoColorSpace;

        texture.anisotropy =
          Math.min(
            8,
            renderer.capabilities
              .getMaxAnisotropy(),
          );

        texture.wrapS =
          THREE.RepeatWrapping;

        texture.wrapT =
          THREE.ClampToEdgeWrapping;

        texture.minFilter =
          THREE.LinearMipmapLinearFilter;

        texture.magFilter =
          THREE.LinearFilter;

        texture.generateMipmaps =
          true;

        uniforms[key].value =
          texture;

        disposables.push(texture);

        finishTexture();
      },

      undefined,

      () => {
        if (isDisposed()) {
          return;
        }

        const fallbackTexture =
          createFallbackTexture(key);

        uniforms[key].value =
          fallbackTexture;

        disposables.push(
          fallbackTexture,
        );

        finishTexture();
      },
    );
  }

  loadTexture(
    imageService
      .getRequiredImage(
        "earth-day-texture",
      )
      .imageUrl,

    "dayMap",
  );

  loadTexture(
    imageService
      .getRequiredImage(
        "earth-night-texture",
      )
      .imageUrl,

    "nightMap",
  );

  return {
    group,
    uniforms,
    atmosphereMaterial,
    cloudMaterial,

    dispose() {
      cloudMesh.onBeforeRender =
        () => {};

      group.remove(cloudMesh);

      group.remove(earthMesh);

      scene.remove(group);

      scene.remove(
        atmosphereMesh,
      );

      for (
        const disposable
        of disposables
      ) {
        disposable.dispose();
      }
    },
  };
}