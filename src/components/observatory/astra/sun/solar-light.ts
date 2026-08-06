import * as THREE from "three";

import {
  SUN_DIRECTION,
} from "./sun-constants";

/*
 * Project Astra
 * Shared solar-lighting subsystem.
 *
 * Owns creation, scene registration and disposal of all
 * illumination produced by the Sun.
 */

export type SolarLightSystem = {
  directional: THREE.DirectionalLight;
  ambient: THREE.AmbientLight;
  target: THREE.Object3D;
  dispose(): void;
};

export type SolarLightSystemOptions = {
  scene: THREE.Scene;
};

export function createSolarLightSystem({
  scene,
}: SolarLightSystemOptions): SolarLightSystem {
  const directional =
    new THREE.DirectionalLight(
      0xfff4d2,
      4.6,
    );

  directional.position.copy(
    SUN_DIRECTION
      .clone()
      .multiplyScalar(12),
  );

  directional.target.position.set(
    0,
    0,
    0,
  );

  const target =
    directional.target;

  const ambient =
    new THREE.AmbientLight(
      0x314062,
      0.075,
    );

  scene.add(
    directional,
    target,
    ambient,
  );

  return {
    directional,
    ambient,
    target,

    dispose() {
      scene.remove(
        directional,
        target,
        ambient,
      );

      directional.dispose();
    },
  };
}