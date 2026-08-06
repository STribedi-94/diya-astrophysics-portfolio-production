import * as THREE from "three";

import { ASTRA_SUN_DIRECTION } from "./earth-system";

export type AstraSunSystemOptions = {
  scene: THREE.Scene;
  camera: THREE.Camera;
  reducedMotion: boolean;
};

export type AstraSunSystem = {
  root: THREE.Group;
  light: THREE.DirectionalLight;
  direction: THREE.Vector3;

  update(options?: {
    elapsedSeconds?: number;
    reducedMotion?: boolean;
  }): void;

  dispose(): void;
};

const SUN_DISTANCE = 32;
const SUN_DISK_RADIUS = 1.05;

function createSunDiskMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,

    uniforms: {
      time: {
        value: 0,
      },

      opacity: {
        value: 1,
      },
    },

    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(
            position,
            1.0
          );
      }
    `,

    fragmentShader: `
      uniform float time;
      uniform float opacity;

      varying vec2 vUv;

      float hash21(vec2 point) {
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
            point + 45.32
          );

        return
          fract(
            point.x *
            point.y
          );
      }

      float valueNoise(vec2 point) {
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
          hash21(cell);

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

      float fbm(vec2 point) {
        float total =
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
          total +=
            amplitude *
            valueNoise(point);

          point =
            rotation *
            point *
            2.03 +
            vec2(
              13.7,
              8.4
            );

          amplitude *=
            0.50;
        }

        return total;
      }

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float radius =
          length(centered) *
          2.0;

        if (
          radius >
          1.0
        ) {
          discard;
        }

        float limb =
          sqrt(
            max(
              0.0,
              1.0 -
              radius *
              radius
            )
          );

        vec2 animatedUv =
          centered *
          19.0;

        float granulation =
          valueNoise(
            animatedUv +
            vec2(
              time * 0.022,
              -time * 0.014
            )
          );

        granulation +=
          0.58 *
          valueNoise(
            animatedUv *
            2.45 +
            vec2(
              -time * 0.034,
              time * 0.021
            )
          );

        granulation +=
          0.30 *
          valueNoise(
            animatedUv *
            5.10 +
            vec2(
              time * 0.064,
              -time * 0.046
            )
          );

        granulation /=
          1.88;

        float largeCells =
          fbm(
            centered *
            10.5 +
            vec2(
              time * 0.012,
              -time * 0.009
            )
          );

        float brightActiveRegions =
          smoothstep(
            0.62,
            0.84,
            largeCells
          );

        float darkConvection =
          1.0 -
          smoothstep(
            0.38,
            0.66,
            granulation
          );

        vec3 edgeColor =
          vec3(
            1.0,
            0.20,
            0.015
          );

        vec3 middleColor =
          vec3(
            1.0,
            0.58,
            0.065
          );

        vec3 centerColor =
          vec3(
            1.0,
            0.96,
            0.66
          );

        vec3 color =
          mix(
            edgeColor,
            middleColor,
            pow(
              limb,
              0.34
            )
          );

        color =
          mix(
            color,
            centerColor,
            pow(
              limb,
              1.45
            )
          );

        color *=
          0.68 +
          granulation *
          0.72;

        color -=
          vec3(
            0.18,
            0.055,
            0.012
          ) *
          darkConvection *
          0.38;

        color +=
          vec3(
            1.0,
            0.62,
            0.12
          ) *
          brightActiveRegions *
          0.60;

        float limbFire =
          pow(
            1.0 -
            limb,
            2.8
          );

        color +=
          vec3(
            1.0,
            0.20,
            0.012
          ) *
          limbFire *
          0.68;

        float pulse =
          0.975 +
          0.025 *
          sin(
            time *
            0.82
          );

        color *=
          pulse;

        float edgeSoftness =
          smoothstep(
            1.0,
            0.925,
            radius
          );

        gl_FragColor =
          vec4(
            color *
            3.45,
            edgeSoftness *
            opacity
          );
      }
    `,
  });
}

type CoronaMaterialOptions = {
  color: THREE.ColorRepresentation;
  intensity: number;
  diskRatio: number;
  layer: number;
};

function createCoronaMaterial({
  color,
  intensity,
  diskRatio,
  layer,
}: CoronaMaterialOptions) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,

    uniforms: {
      color: {
        value:
          new THREE.Color(color),
      },

      intensity: {
        value:
          intensity,
      },

      diskRatio: {
        value:
          diskRatio,
      },

      layer: {
        value:
          layer,
      },

      time: {
        value: 0,
      },
    },

    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(
            position,
            1.0
          );
      }
    `,

    fragmentShader: `
      uniform vec3 color;
      uniform float intensity;
      uniform float diskRatio;
      uniform float layer;
      uniform float time;

      varying vec2 vUv;

      float hash21(vec2 point) {
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
            point + 45.32
          );

        return
          fract(
            point.x *
            point.y
          );
      }

      float valueNoise(vec2 point) {
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
          hash21(cell);

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

      float fbm(vec2 point) {
        float total =
          0.0;

        float amplitude =
          0.52;

        mat2 rotation =
          mat2(
            0.80,
            -0.60,
            0.60,
            0.80
          );

        for (
          int octave = 0;
          octave < 6;
          octave += 1
        ) {
          total +=
            amplitude *
            valueNoise(point);

          point =
            rotation *
            point *
            2.03 +
            vec2(
              17.2,
              9.1
            );

          amplitude *=
            0.50;
        }

        return total;
      }

      float ridgeNoise(vec2 point) {
        float value =
          fbm(point);

        return
          1.0 -
          abs(
            value *
            2.0 -
            1.0
          );
      }

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float planeRadius =
          length(centered) *
          2.0;

        if (
          planeRadius >
          1.0
        ) {
          discard;
        }

        float angle =
          atan(
            centered.y,
            centered.x
          );

        /*
         * Convert the plane radius into distance measured
         * outward from the visible solar limb.
         */
        float limbDistance =
          max(
            0.0,
            (
              planeRadius -
              diskRatio
            ) /
            max(
              0.001,
              1.0 -
              diskRatio
            )
          );

        float insideDisk =
          1.0 -
          smoothstep(
            diskRatio *
            0.72,
            diskRatio,
            planeRadius
          );

        float outsideDisk =
          smoothstep(
            diskRatio *
            0.82,
            diskRatio *
            1.03,
            planeRadius
          );

        float drift =
          time *
          (
            0.020 +
            layer *
            0.008
          );

        vec2 polarCoordinates =
          vec2(
            angle *
            (
              2.8 +
              layer *
              0.7
            ),

            limbDistance *
            (
              8.0 +
              layer *
              2.0
            )
          );

        float broadNoise =
          fbm(
            polarCoordinates +
            vec2(
              drift,
              -drift *
              0.44
            )
          );

        float mediumNoise =
          fbm(
            polarCoordinates *
            2.20 +
            vec2(
              -drift *
              1.30,
              drift *
              0.70
            )
          );

        float filamentNoise =
          ridgeNoise(
            polarCoordinates *
            4.50 +
            vec2(
              drift *
              2.10,
              -drift *
              0.86
            )
          );

        float broadStreamers =
          0.5 +
          0.5 *
          sin(
            angle *
            6.0 +
            broadNoise *
            6.5 +
            limbDistance *
            5.0 +
            drift
          );

        broadStreamers =
          pow(
            broadStreamers,
            3.0
          );

        float mediumStreamers =
          0.5 +
          0.5 *
          sin(
            angle *
            13.0 -
            limbDistance *
            11.0 +
            mediumNoise *
            6.0 -
            drift *
            1.45
          );

        mediumStreamers =
          pow(
            mediumStreamers,
            5.2
          );

        float fineStreamers =
          0.5 +
          0.5 *
          sin(
            angle *
            31.0 +
            limbDistance *
            18.0 +
            filamentNoise *
            6.8 +
            drift *
            1.80
          );

        fineStreamers =
          pow(
            fineStreamers,
            9.0
          );

        float streamerField =
          0.20 +
          broadStreamers *
          0.88 +
          mediumStreamers *
          0.48 +
          fineStreamers *
          0.24;

        streamerField *=
          0.68 +
          broadNoise *
          0.56;

        /*
         * Long radial spikes.
         */
        float raySelection =
          smoothstep(
            0.48,
            0.78,
            broadNoise *
            0.64 +
            mediumNoise *
            0.36
          );

        float longRays =
          raySelection *
          pow(
            1.0 -
            limbDistance,
            0.44 +
            layer *
            0.18
          );

        /*
         * Prominence loops concentrated close to the solar limb.
         */
        float prominenceWaveA =
          abs(
            sin(
              angle *
              4.0 +
              limbDistance *
              24.0 -
              drift *
              1.45 +
              broadNoise *
              3.8
            )
          );

        prominenceWaveA =
          1.0 -
          smoothstep(
            0.020,
            0.105,
            prominenceWaveA
          );

        float prominenceWaveB =
          abs(
            sin(
              angle *
              7.0 -
              limbDistance *
              31.0 +
              drift *
              1.10 +
              mediumNoise *
              4.2
            )
          );

        prominenceWaveB =
          1.0 -
          smoothstep(
            0.018,
            0.090,
            prominenceWaveB
          );

        float prominenceRadial =
          smoothstep(
            0.0,
            0.025,
            limbDistance
          ) *
          (
            1.0 -
            smoothstep(
              0.16,
              0.34,
              limbDistance
            )
          );

        float prominenceMask =
          (
            prominenceWaveA *
            0.78 +
            prominenceWaveB *
            0.48
          ) *
          prominenceRadial *
          smoothstep(
            0.46,
            0.76,
            mediumNoise
          );

        /*
         * Bright chromospheric ring directly outside the disk.
         */
        float chromosphereRing =
          exp(
            -limbDistance *
            (
              18.0 -
              layer *
              4.0
            )
          );

        /*
         * Wide atmospheric corona.
         */
        float diffuseCorona =
          pow(
            1.0 -
            limbDistance,
            1.25 +
            layer *
            0.55
          );

        float outerFade =
          1.0 -
          smoothstep(
            0.72,
            1.0,
            limbDistance
          );

        float directionalAsymmetry =
          0.76 +
          0.15 *
          cos(
            angle -
            0.58
          ) +
          0.09 *
          sin(
            angle *
            2.0 +
            1.15
          );

        float alpha =
          (
            chromosphereRing *
            (
              0.92 -
              layer *
              0.28
            ) +
            diffuseCorona *
            streamerField *
            (
              0.56 +
              layer *
              0.34
            ) +
            longRays *
            (
              0.72 +
              layer *
              0.62
            ) +
            prominenceMask *
            (
              1.10 -
              layer *
              0.32
            )
          ) *
          outsideDisk *
          outerFade *
          directionalAsymmetry *
          intensity;

        /*
         * Faint central bloom remains behind the solar disk.
         */
        alpha +=
          insideDisk *
          (
            0.10 +
            layer *
            0.04
          ) *
          intensity;

        if (
          alpha <
          0.001
        ) {
          discard;
        }

        vec3 hotColor =
          vec3(
            1.35,
            1.05,
            0.52
          );

        vec3 orangeColor =
          color *
          vec3(
            1.20,
            0.77,
            0.42
          );

        vec3 redOuterColor =
          color *
          vec3(
            1.18,
            0.38,
            0.16
          );

        vec3 finalColor =
          mix(
            hotColor,
            orangeColor,
            smoothstep(
              0.0,
              0.22,
              limbDistance
            )
          );

        finalColor =
          mix(
            finalColor,
            redOuterColor,
            smoothstep(
              0.20,
              0.92,
              limbDistance
            ) *
            (
              0.44 +
              layer *
              0.28
            )
          );

        finalColor +=
          vec3(
            1.28,
            0.34,
            0.025
          ) *
          prominenceMask *
          0.82;

        gl_FragColor =
          vec4(
            finalColor *
            alpha,
            alpha
          );
      }
    `,
  });
}

function createBloomMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,

    uniforms: {
      time: {
        value: 0,
      },
    },

    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(
            position,
            1.0
          );
      }
    `,

    fragmentShader: `
      uniform float time;

      varying vec2 vUv;

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float radius =
          length(centered) *
          2.0;

        if (
          radius >
          1.0
        ) {
          discard;
        }

        float pulse =
          0.96 +
          0.04 *
          sin(
            time *
            0.62
          );

        float innerBloom =
          pow(
            max(
              0.0,
              1.0 -
              radius
            ),
            3.2
          );

        float wideBloom =
          pow(
            max(
              0.0,
              1.0 -
              radius
            ),
            1.15
          );

        float alpha =
          (
            innerBloom *
            0.52 +
            wideBloom *
            0.18
          ) *
          pulse;

        vec3 bloomColor =
          mix(
            vec3(
              1.0,
              0.30,
              0.025
            ),

            vec3(
              1.0,
              0.80,
              0.32
            ),

            innerBloom
          );

        gl_FragColor =
          vec4(
            bloomColor *
            alpha,
            alpha
          );
      }
    `,
  });
}

export function createAstraSunSystem({
  scene,
  camera,
  reducedMotion,
}: AstraSunSystemOptions): AstraSunSystem {
  const direction =
    ASTRA_SUN_DIRECTION
      .clone()
      .normalize();

  const root =
    new THREE.Group();

  root.position.copy(
    direction
      .clone()
      .multiplyScalar(
        SUN_DISTANCE,
      ),
  );

  scene.add(root);

  /*
   * Wide cinematic bloom behind every other solar layer.
   */
  const bloomGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS * 9.4,
      SUN_DISK_RADIUS * 9.4,
      1,
      1,
    );

  const bloomMaterial =
    createBloomMaterial();

  const bloom =
    new THREE.Mesh(
      bloomGeometry,
      bloomMaterial,
    );

  bloom.position.z =
    -0.09;

  bloom.renderOrder =
    0;

  root.add(bloom);

  /*
   * Outer corona with long irregular streamers.
   */
  const outerCoronaSize =
    SUN_DISK_RADIUS *
    12.5;

  const outerCoronaGeometry =
    new THREE.PlaneGeometry(
      outerCoronaSize,
      outerCoronaSize,
      1,
      1,
    );

  const outerCoronaMaterial =
    createCoronaMaterial({
      color: 0xff5b12,
      intensity: 0.72,
      diskRatio:
        (
          SUN_DISK_RADIUS *
          2.0
        ) /
        outerCoronaSize,
      layer: 1,
    });

  const outerCorona =
    new THREE.Mesh(
      outerCoronaGeometry,
      outerCoronaMaterial,
    );

  outerCorona.position.z =
    -0.065;

  outerCorona.renderOrder =
    1;

  root.add(outerCorona);

  /*
   * Inner corona and visible prominence loops.
   */
  const innerCoronaSize =
    SUN_DISK_RADIUS *
    7.2;

  const innerCoronaGeometry =
    new THREE.PlaneGeometry(
      innerCoronaSize,
      innerCoronaSize,
      1,
      1,
    );

  const innerCoronaMaterial =
    createCoronaMaterial({
      color: 0xffa126,
      intensity: 1.22,
      diskRatio:
        (
          SUN_DISK_RADIUS *
          2.0
        ) /
        innerCoronaSize,
      layer: 0,
    });

  const innerCorona =
    new THREE.Mesh(
      innerCoronaGeometry,
      innerCoronaMaterial,
    );

  innerCorona.position.z =
    -0.035;

  innerCorona.renderOrder =
    2;

  root.add(innerCorona);

  /*
   * Detailed solar photosphere.
   */
  const diskGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS * 2,
      SUN_DISK_RADIUS * 2,
      1,
      1,
    );

  const diskMaterial =
    createSunDiskMaterial();

  const disk =
    new THREE.Mesh(
      diskGeometry,
      diskMaterial,
    );

  disk.renderOrder =
    4;

  root.add(disk);

  /*
   * Shared directional light.
   */
  const light =
    new THREE.DirectionalLight(
      0xfff4d2,
      4.6,
    );

  light.position.copy(
    direction
      .clone()
      .multiplyScalar(12),
  );

  light.target.position.set(
    0,
    0,
    0,
  );

  scene.add(
    light,
    light.target,
  );

  const solarFill =
    new THREE.AmbientLight(
      0x314062,
      0.075,
    );

  scene.add(
    solarFill,
  );

  let currentReducedMotion =
    reducedMotion;

  return {
    root,
    light,
    direction,

    update(options = {}) {
      const elapsedSeconds =
        options.elapsedSeconds ??
        performance.now() /
        1000;

      currentReducedMotion =
        options.reducedMotion ??
        currentReducedMotion;

      root.quaternion.copy(
        camera.quaternion,
      );

      if (
        !currentReducedMotion
      ) {
        diskMaterial
          .uniforms
          .time
          .value =
          elapsedSeconds;

        innerCoronaMaterial
          .uniforms
          .time
          .value =
          elapsedSeconds;

        outerCoronaMaterial
          .uniforms
          .time
          .value =
          elapsedSeconds;

        bloomMaterial
          .uniforms
          .time
          .value =
          elapsedSeconds;
      }
    },

    dispose() {
      scene.remove(root);

      scene.remove(light);

      scene.remove(
        light.target,
      );

      scene.remove(
        solarFill,
      );

      bloomGeometry.dispose();

      bloomMaterial.dispose();

      outerCoronaGeometry.dispose();

      outerCoronaMaterial.dispose();

      innerCoronaGeometry.dispose();

      innerCoronaMaterial.dispose();

      diskGeometry.dispose();

      diskMaterial.dispose();

      root.clear();
    },
  };
}