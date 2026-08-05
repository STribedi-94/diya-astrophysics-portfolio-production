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
          vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform float time;
      uniform float opacity;

      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(
          p *
          vec2(
            123.34,
            456.21
          )
        );

        p += dot(
          p,
          p + 45.32
        );

        return fract(
          p.x * p.y
        );
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        f =
          f *
          f *
          (
            3.0 -
            2.0 *
            f
          );

        return mix(
          mix(
            hash(i),
            hash(i + vec2(1.0, 0.0)),
            f.x
          ),

          mix(
            hash(i + vec2(0.0, 1.0)),
            hash(i + vec2(1.0, 1.0)),
            f.x
          ),

          f.y
        );
      }

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float radius =
          length(centered) *
          2.0;

        if (radius > 1.0) {
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

        vec2 surfaceUv =
          centered *
          7.0;

        float granulation =
          noise(
            surfaceUv +
            vec2(
              time * 0.012,
              -time * 0.008
            )
          );

        granulation +=
          0.5 *
          noise(
            surfaceUv *
            2.2 -
            vec2(
              time * 0.018,
              time * 0.011
            )
          );

        granulation /= 1.5;

        vec3 centerColor =
          vec3(
            1.0,
            0.98,
            0.82
          );

        vec3 edgeColor =
          vec3(
            1.0,
            0.56,
            0.12
          );

        vec3 color =
          mix(
            edgeColor,
            centerColor,
            pow(
              limb,
              0.55
            )
          );

        color *=
          0.88 +
          granulation *
          0.22;

        float edgeSoftness =
          smoothstep(
            1.0,
            0.94,
            radius
          );

        gl_FragColor =
          vec4(
            color *
            2.35,
            edgeSoftness *
            opacity
          );
      }
    `,
  });
}

function createCoronaMaterial(options: {
  color: THREE.ColorRepresentation;
  intensity: number;
  falloff: number;
}) {
  const {
    color,
    intensity,
    falloff,
  } = options;

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,

    uniforms: {
      color: {
        value: new THREE.Color(color),
      },

      intensity: {
        value: intensity,
      },

      falloff: {
        value: falloff,
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
          vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform vec3 color;
      uniform float intensity;
      uniform float falloff;
      uniform float time;

      varying vec2 vUv;

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float radius =
          length(centered) *
          2.0;

        if (radius > 1.0) {
          discard;
        }

        float radial =
          pow(
            max(
              0.0,
              1.0 -
              radius
            ),
            falloff
          );

        float angle =
          atan(
            centered.y,
            centered.x
          );

        float variation =
          0.88 +
          0.12 *
          sin(
            angle *
            9.0 +
            time *
            0.08
          );

        float alpha =
          radial *
          variation *
          intensity;

        gl_FragColor =
          vec4(
            color *
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
    ASTRA_SUN_DIRECTION.clone().normalize();

  const root =
    new THREE.Group();

  root.position.copy(
    direction.clone().multiplyScalar(
      SUN_DISTANCE,
    ),
  );

  scene.add(root);

  /*
   * The solar disk and corona are billboarded toward
   * the camera so they remain visually circular while
   * still occupying a fixed astronomical direction.
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

  root.add(disk);

  const innerCoronaGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS * 4.8,
      SUN_DISK_RADIUS * 4.8,
      1,
      1,
    );

  const innerCoronaMaterial =
    createCoronaMaterial({
      color: 0xffb347,
      intensity: 0.5,
      falloff: 3.2,
    });

  const innerCorona =
    new THREE.Mesh(
      innerCoronaGeometry,
      innerCoronaMaterial,
    );

  innerCorona.position.z = -0.02;
  root.add(innerCorona);

  const outerCoronaGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS * 8.4,
      SUN_DISK_RADIUS * 8.4,
      1,
      1,
    );

  const outerCoronaMaterial =
    createCoronaMaterial({
      color: 0xff7a24,
      intensity: 0.17,
      falloff: 4.8,
    });

  const outerCorona =
    new THREE.Mesh(
      outerCoronaGeometry,
      outerCoronaMaterial,
    );

  outerCorona.position.z = -0.04;
  root.add(outerCorona);

  /*
   * Directional sunlight.
   *
   * The light originates from the same shared direction
   * used by the Earth day/night shader. Its target remains
   * at the Earth origin.
   */

  const light =
    new THREE.DirectionalLight(
      0xfff4d2,
      4.6,
    );

  light.position.copy(
    direction.clone().multiplyScalar(12),
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

  /*
   * Very faint solar fill prevents metallic materials from
   * losing all form without flattening the day/night contrast.
   */

  const solarFill =
    new THREE.AmbientLight(
      0x314062,
      0.075,
    );

  scene.add(solarFill);

  let currentReducedMotion =
    reducedMotion;

  return {
    root,
    light,
    direction,

    update(options = {}) {
      const elapsedSeconds =
        options.elapsedSeconds ??
        performance.now() / 1000;

      currentReducedMotion =
        options.reducedMotion ??
        currentReducedMotion;

      root.quaternion.copy(
        camera.quaternion,
      );

      if (!currentReducedMotion) {
        diskMaterial.uniforms.time.value =
          elapsedSeconds;

        innerCoronaMaterial.uniforms.time.value =
          elapsedSeconds;

        outerCoronaMaterial.uniforms.time.value =
          elapsedSeconds;
      }
    },

    dispose() {
      scene.remove(root);
      scene.remove(light);
      scene.remove(light.target);
      scene.remove(solarFill);

      diskGeometry.dispose();
      diskMaterial.dispose();

      innerCoronaGeometry.dispose();
      innerCoronaMaterial.dispose();

      outerCoronaGeometry.dispose();
      outerCoronaMaterial.dispose();

      root.clear();
    },
  };
}