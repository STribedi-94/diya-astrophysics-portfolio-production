import * as THREE from "three";

import {
  SUN_DISK_VERTEX_SHADER,
  SUN_DISK_FRAGMENT_SHADER,
} from "./shaders/disk.glsl";

/*
 * Project Astra
 * Sun photosphere module.
 *
 * Phase 4.3A:
 * This preserves the existing public interface while
 * preparing the renderer for the Premium Sun upgrade.
 */

export function createSunDiskMaterial() {
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

    vertexShader:
      SUN_DISK_VERTEX_SHADER,

    fragmentShader:
      SUN_DISK_FRAGMENT_SHADER,
  });
}