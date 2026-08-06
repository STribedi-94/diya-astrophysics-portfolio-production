import * as THREE from "three";

import {
  CORONA_VERTEX_SHADER,
  CORONA_FRAGMENT_SHADER,
} from "./shaders/corona.glsl";

/*
 * Project Astra
 * Corona rendering module.
 *
 * Phase 4.3A
 * Public API established.
 * Runtime implementation will be migrated
 * during Phase 4.3B.
 */

export interface CoronaOptions {
  color: THREE.ColorRepresentation;
  intensity: number;
  falloff: number;
  streamerScale: number;
  polarBias: number;
}

export function createCoronaMaterial(
  options: CoronaOptions,
) {
  const {
    color,
    intensity,
    falloff,
    streamerScale,
    polarBias,
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

      streamerScale: {
        value: streamerScale,
      },

      polarBias: {
        value: polarBias,
      },

      time: {
        value: 0,
      },
    },

    vertexShader:
      CORONA_VERTEX_SHADER,

    fragmentShader:
      CORONA_FRAGMENT_SHADER,
  });
}