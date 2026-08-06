import * as THREE from "three";

import {
  INNER_CORONA_SCALE,
  OUTER_CORONA_SCALE,
  SUN_DISK_RADIUS,
  SUN_DISTANCE,
} from "./sun-constants";

import {
  ASTRA_SUN_DIRECTION,
} from "../earth-system";

import {
  createSunDiskMaterial,
} from "./sun-disk";

import {
  createChromosphereMaterial,
} from "./chromosphere";

import {
  createCoronaMaterial,
} from "./corona";

import {
  createSolarLightSystem,
} from "./solar-light";

import {
  updateSolarAnimation,
} from "./solar-animation";

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
    direction
      .clone()
      .multiplyScalar(
        SUN_DISTANCE,
      ),
  );

  scene.add(root);

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

  disk.renderOrder = 10;
  disk.frustumCulled = false;

  root.add(disk);

  const chromosphereGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS * 2.34,
      SUN_DISK_RADIUS * 2.34,
      1,
      1,
    );

  const chromosphereMaterial =
    createChromosphereMaterial();

  const chromosphere =
    new THREE.Mesh(
      chromosphereGeometry,
      chromosphereMaterial,
    );

  chromosphere.renderOrder = 11;
  chromosphere.frustumCulled = false;
  chromosphere.position.z =
    -0.015;

  root.add(
    chromosphere,
  );

  const innerCoronaGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS *
        INNER_CORONA_SCALE *
        2,
      SUN_DISK_RADIUS *
        INNER_CORONA_SCALE *
        2,
      1,
      1,
    );

  const innerCoronaMaterial =
    createCoronaMaterial({
      color: 0xffb347,
      intensity: 0.42,
      falloff: 2.55,
      streamerScale: 0.44,
      polarBias: 0.28,
    });

  const innerCorona =
    new THREE.Mesh(
      innerCoronaGeometry,
      innerCoronaMaterial,
    );
  innerCorona.renderOrder = 12;
  innerCorona.frustumCulled = false;
  innerCorona.position.z =
    -0.02;

  root.add(
    innerCorona,
  );

  const outerCoronaGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS *
        OUTER_CORONA_SCALE *
        2,
      SUN_DISK_RADIUS *
        OUTER_CORONA_SCALE *
        2,
      1,
      1,
    );

  const outerCoronaMaterial =
    createCoronaMaterial({
      color: 0xff7a24,
      intensity: 0.115,
      falloff: 3.45,
      streamerScale: 0.62,
      polarBias: 0.58,
    });

  const outerCorona =
    new THREE.Mesh(
      outerCoronaGeometry,
      outerCoronaMaterial,
    );

  outerCorona.renderOrder = 13;
  outerCorona.frustumCulled = false;
  outerCorona.position.z =
    -0.04;

  root.add(
    outerCorona,
  );

  const solarLightSystem =
    createSolarLightSystem({
      scene,
    });

  let currentReducedMotion =
    reducedMotion;

  return {
    root,

    light:
      solarLightSystem.directional,

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
        updateSolarAnimation(
          elapsedSeconds,
          {
            disk: diskMaterial,
            chromosphere:
              chromosphereMaterial,
            innerCorona:
              innerCoronaMaterial,
            outerCorona:
              outerCoronaMaterial,
          },
        );
      }
    },

    dispose() {
      scene.remove(root);

      solarLightSystem.dispose();

      diskGeometry.dispose();
      diskMaterial.dispose();

      chromosphereGeometry.dispose();
      chromosphereMaterial.dispose();

      innerCoronaGeometry.dispose();
      innerCoronaMaterial.dispose();

      outerCoronaGeometry.dispose();
      outerCoronaMaterial.dispose();

      root.clear();
    },
  };
}