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
           sunlight * 1.05
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
              0.16,
              0.48,
              1.0
            );

          vec3 sunsetAtmosphere =
            vec3(
              1.0,
              0.23,
              0.04
            );

          vec3 atmosphereColor =
            daylightAtmosphere *
            (
              0.12 +
              dayAmount *
              1.20
            );

          atmosphereColor +=
            sunsetAtmosphere *
            terminator *
            0.64;

          float nightSuppression =
            mix(
              0.08,
              1.0,
              dayAmount
            );

          float alpha =
            rim *
            nightSuppression *
            reveal *
            0.82;

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

    dispose() {
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