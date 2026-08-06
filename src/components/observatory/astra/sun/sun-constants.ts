import * as THREE from "three";

/*
 * Project Astra
 * Shared Sun constants.
 * This file contains immutable configuration only.
 */

export const SUN_DISTANCE = 32;

export const SUN_DISK_RADIUS = 1.05;

export const SUN_DIRECTION =
  new THREE.Vector3(
    1,
    0.28,
    0.16,
  ).normalize();

export const SUN_POSITION =
  SUN_DIRECTION
    .clone()
    .multiplyScalar(
      SUN_DISTANCE,
    );

export const INNER_CORONA_SCALE =
  2.55;

export const OUTER_CORONA_SCALE =
  3.9;