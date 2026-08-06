import * as THREE from "three";

import {
  CHROMOSPHERE_VERTEX_SHADER,
  CHROMOSPHERE_FRAGMENT_SHADER,
} from "./shaders/chromosphere.glsl";

/*
 * Project Astra
 * Chromosphere rendering module.
 *
 * Phase 4.3A
 * Public API established.
 * Runtime implementation will be migrated in Phase 4.3B.
 */

export function createChromosphereMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,

    uniforms: {
      time: {
        value: 0,
      },
    },

    vertexShader:
      CHROMOSPHERE_VERTEX_SHADER,

    fragmentShader:
      CHROMOSPHERE_FRAGMENT_SHADER,
  });
}