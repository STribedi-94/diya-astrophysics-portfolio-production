import * as THREE from "three";

/*
 * Project Astra
 * Solar animation controller.
 *
 * Phase 4.3A
 * Centralises all Sun animation updates.
 * The implementation is intentionally simple until
 * the rendering migration in Phase 4.3B.
 */

export interface SolarAnimationTargets {
  disk?: THREE.ShaderMaterial;
  chromosphere?: THREE.ShaderMaterial;
  innerCorona?: THREE.ShaderMaterial;
  outerCorona?: THREE.ShaderMaterial;
}

export function updateSolarAnimation(
  elapsedSeconds: number,
  targets: SolarAnimationTargets,
) {
  targets.disk?.uniforms.time &&
    (targets.disk.uniforms.time.value =
      elapsedSeconds);

  targets.chromosphere?.uniforms.time &&
    (targets.chromosphere.uniforms.time.value =
      elapsedSeconds);

  targets.innerCorona?.uniforms.time &&
    (targets.innerCorona.uniforms.time.value =
      elapsedSeconds);

  targets.outerCorona?.uniforms.time &&
    (targets.outerCorona.uniforms.time.value =
      elapsedSeconds);
}