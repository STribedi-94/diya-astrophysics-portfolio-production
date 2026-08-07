import * as THREE from "three";

/**
 * Project Diya Astra deep-space environment.
 *
 * This subsystem owns the navigable Three.js stellar background used by
 * the Observatory scene. It is intentionally separate from the website's
 * decorative DOM/CSS CosmicBackground.
 *
 * Design goals:
 * - deterministic stellar distribution;
 * - layered apparent depth;
 * - restrained stellar colour-temperature variation;
 * - performance-aware density;
 * - no nebula/grid decoration;
 * - independent lifecycle and disposal;
 * - future-ready runtime update hook.
 */

export type DeepSpaceSystem = {
  group: THREE.Group;
  update(options: {
    elapsedSeconds: number;
    reducedMotion: boolean;
  }): void;
  dispose(): void;
};

type StellarLayerOptions = {
  count: number;
  radiusMin: number;
  radiusMax: number;
  size: number;
  opacity: number;
  seed: number;
};

function createSeededRandom(initialSeed: number) {
  let seed = initialSeed >>> 0;

  return () => {
    seed =
      (seed * 1664525 + 1013904223) >>> 0;

    return seed / 4294967296;
  };
}

/**
 * Produces restrained stellar colours rather than arbitrary RGB noise.
 *
 * Most stars remain visually near-white. A minority receive subtle warm
 * or cool biases to suggest different stellar effective temperatures
 * without turning the background into a decorative coloured starfield.
 */
function writeStellarColour(
  target: Float32Array,
  offset: number,
  random: () => number,
) {
  const brightness =
    0.58 + random() * 0.42;

  const temperatureClass = random();

  let red = 1;
  let green = 1;
  let blue = 1;

  if (temperatureClass < 0.14) {
    // Restrained warm population.
    red = 1;
    green = 0.88 + random() * 0.07;
    blue = 0.72 + random() * 0.12;
  } else if (temperatureClass > 0.84) {
    // Restrained cool-blue population.
    red = 0.78 + random() * 0.12;
    green = 0.88 + random() * 0.08;
    blue = 1;
  } else {
    // Dominant near-white population.
    red = 0.94 + random() * 0.06;
    green = 0.95 + random() * 0.05;
    blue = 0.96 + random() * 0.04;
  }

  target[offset] =
    red * brightness;

  target[offset + 1] =
    green * brightness;

  target[offset + 2] =
    blue * brightness;
}

function createStellarLayer(
  options: StellarLayerOptions,
) {
  const {
    count,
    radiusMin,
    radiusMax,
    size,
    opacity,
    seed,
  } = options;

  const random =
    createSeededRandom(seed);

  const positions =
    new Float32Array(count * 3);

  const colours =
    new Float32Array(count * 3);

  for (
    let index = 0;
    index < count;
    index++
  ) {
    /*
     * Uniform spherical distribution.
     *
     * Sampling y directly in [-1, 1] avoids clustering stars around
     * the poles, while theta provides the azimuthal coordinate.
     */
    const y =
      random() * 2 - 1;

    const theta =
      random() * Math.PI * 2;

    const horizontal =
      Math.sqrt(
        Math.max(
          0,
          1 - y * y,
        ),
      );

    const radius =
      radiusMin +
      random() *
        (radiusMax - radiusMin);

    const offset = index * 3;

    positions[offset] =
      radius *
      horizontal *
      Math.cos(theta);

    positions[offset + 1] =
      radius * y;

    positions[offset + 2] =
      radius *
      horizontal *
      Math.sin(theta);

    writeStellarColour(
      colours,
      offset,
      random,
    );
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3,
    ),
  );

  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
      colours,
      3,
    ),
  );

  const material =
    new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      fog: false,
    });

  const points =
    new THREE.Points(
      geometry,
      material,
    );

  /*
   * The stellar environment is background scenery rather than an
   * interactive object. Raycasting should never consider it.
   */
  points.raycast = () => {};

  return {
    points,
    geometry,
    material,
  };
}

export function createDeepSpaceSystem(options: {
  scene: THREE.Scene;
  compact: boolean;
  reducedMotion: boolean;
}): DeepSpaceSystem {
  const {
    scene,
    compact,
    reducedMotion,
  } = options;

  const group =
    new THREE.Group();

  group.name =
    "AstraDeepSpace";

  /*
   * Two stellar populations provide apparent depth without textures,
   * sprites, post-processing or additional draw-call-heavy decoration.
   *
   * The distant layer carries most of the stellar density.
   * The foreground layer is deliberately sparse and slightly larger.
   */
  const distant =
    createStellarLayer({
      count: compact ? 520 : 900,
      radiusMin: 48,
      radiusMax: 68,
      size: compact ? 0.17 : 0.19,
      opacity: 0.72,
      seed: 20260729,
    });

  const foreground =
    createStellarLayer({
      count: compact ? 90 : 170,
      radiusMin: 32,
      radiusMax: 46,
      size: compact ? 0.22 : 0.26,
      opacity: 0.88,
      seed: 20260807,
    });

  /*
   * Render the far population first. Both materials disable depth writes,
   * preventing the stellar shell from interfering with Earth, TESS,
   * observatory markers or future Moon geometry.
   */
  distant.points.renderOrder = -20;
  foreground.points.renderOrder = -19;

  group.add(
    distant.points,
    foreground.points,
  );

  scene.add(group);

  /*
   * Keep any decorative stellar motion extremely restrained.
   *
   * This is not intended to represent measurable stellar proper motion.
   * It merely prevents the background from feeling like a screen-fixed
   * texture during long Observatory viewing sessions.
   */
  let lastElapsedSeconds = 0;

  return {
    group,

    update({
      elapsedSeconds,
      reducedMotion:
        runtimeReducedMotion,
    }) {
      const effectiveReducedMotion =
        reducedMotion ||
        runtimeReducedMotion;

      if (effectiveReducedMotion) {
        lastElapsedSeconds =
          elapsedSeconds;
        return;
      }

      const delta =
        THREE.MathUtils.clamp(
          elapsedSeconds -
            lastElapsedSeconds,
          0,
          0.05,
        );

      lastElapsedSeconds =
        elapsedSeconds;

      group.rotation.y +=
        delta * 0.00045;

      group.rotation.x +=
        delta * 0.00008;
    },

    dispose() {
      scene.remove(group);

      distant.geometry.dispose();
      distant.material.dispose();

      foreground.geometry.dispose();
      foreground.material.dispose();

      group.clear();
    },
  };
}