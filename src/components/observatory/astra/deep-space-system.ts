import * as THREE from "three";
import { ASTRA_OVERVIEW_CAMERA } from "./composition";

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
 * - premium galactic, nebular and distant-galaxy structure without downloaded sky imagery;
 * - line-free constellation-like stellar groupings;
 * - independent lifecycle and disposal;
 * - reduced-motion-aware runtime update hook.
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

/**
 * Converts Astra's canonical spherical overview-camera definition into the
 * actual world-space camera position used by the opening composition.
 *
 * Deep-space calibration therefore follows the same source used by Restore
 * Overview instead of duplicating camera angles.
 */
function createCanonicalOverviewCameraPosition() {
  const {
    distance,
    azimuth,
    polar,
  } = ASTRA_OVERVIEW_CAMERA;

  const sinPolar =
    Math.sin(polar);

  return new THREE.Vector3(
    distance *
      sinPolar *
      Math.sin(azimuth),
    distance *
      Math.cos(polar),
    distance *
      sinPolar *
      Math.cos(azimuth),
  );
}


/**
 * Builds an orthonormal celestial basis whose central great-circle plane
 * contains Astra's canonical opening sightline.
 */
function createOpeningViewGalacticBasis() {
  const cameraPosition =
    createCanonicalOverviewCameraPosition();

  const forward =
    cameraPosition
      .clone()
      .multiplyScalar(-1)
      .normalize();

  const worldUp =
    new THREE.Vector3(
      0,
      1,
      0,
    );

  let screenUp =
    worldUp
      .clone()
      .sub(
        forward
          .clone()
          .multiplyScalar(
            worldUp.dot(forward),
          ),
      );

  if (
    screenUp.lengthSq() <
    1e-6
  ) {
    screenUp =
      new THREE.Vector3(
        1,
        0,
        0,
      );
  }

  screenUp.normalize();

  const screenRight =
    new THREE.Vector3()
      .crossVectors(
        forward,
        screenUp,
      )
      .normalize();

  /*
   * Position angle of the Milky-Way-like structure in the opening view.
   * Keeping this tied to the sightline means the band remains visible while
   * still being a genuine world-space 360-degree celestial structure.
   */
  const diagonalAngle =
    THREE.MathUtils.degToRad(
      32,
    );

  const tangent =
    screenRight
      .clone()
      .multiplyScalar(
        Math.cos(
          diagonalAngle,
        ),
      )
      .add(
        screenUp
          .clone()
          .multiplyScalar(
            Math.sin(
              diagonalAngle,
            ),
          ),
      )
      .normalize();

  const normal =
    new THREE.Vector3()
      .crossVectors(
        forward,
        tangent,
      )
      .normalize();

  return {
    forward,
    tangent,
    normal,
    screenUp,
    screenRight,
  };
}


/**
 * Camera-derived 360-degree Milky-Way-like stellar concentration.
 *
 * This is the granular stellar component of the galactic environment. Diffuse
 * interstellar luminosity is handled independently by createNebulaDustLayer().
 */
function createGalacticBandLayer(options: {
  compact: boolean;
}) {
  const { compact } = options;

  const count =
    compact ? 1800 : 3800;

  const random =
    createSeededRandom(20260808);

  const positions =
    new Float32Array(count * 3);

  const colours =
    new Float32Array(count * 3);

  const {
    forward,
    tangent,
    normal,
  } =
    createOpeningViewGalacticBasis();

  const direction =
    new THREE.Vector3();

  for (
    let index = 0;
    index < count;
    index++
  ) {
    const longitude =
      random() *
      Math.PI *
      2;

    const gaussian =
      (
        random() +
        random() +
        random() +
        random() +
        random() +
        random()
      ) - 3;

    const broadPopulation =
      random() < 0.34;

    const width =
      broadPopulation
        ? 0.19
        : 0.075;

    const latitude =
      gaussian * width +
      0.016 *
        Math.sin(
          longitude * 3.0 +
            0.7,
        ) +
      0.010 *
        Math.sin(
          longitude * 7.0 +
            1.8,
        );

    const cosLatitude =
      Math.cos(latitude);

    direction
      .copy(forward)
      .multiplyScalar(
        Math.cos(longitude) *
          cosLatitude,
      )
      .addScaledVector(
        tangent,
        Math.sin(longitude) *
          cosLatitude,
      )
      .addScaledVector(
        normal,
        Math.sin(latitude),
      )
      .normalize();

    const radius =
      50 +
      random() * 16;

    const offset =
      index * 3;

    positions[offset] =
      direction.x * radius;

    positions[offset + 1] =
      direction.y * radius;

    positions[offset + 2] =
      direction.z * radius;

    const temperature =
      random();

    const luminosityChance =
      random();

    const brightness =
      luminosityChance > 0.965
        ? 0.96 +
          random() * 0.04
        : luminosityChance > 0.84
          ? 0.66 +
            random() * 0.28
          : 0.34 +
            random() * 0.34;

    let red = 0.96;
    let green = 0.98;
    let blue = 1.0;

    if (temperature < 0.13) {
      red = 1.0;

      green =
        0.82 +
        random() * 0.12;

      blue =
        0.66 +
        random() * 0.16;
    } else if (
      temperature > 0.80
    ) {
      red =
        0.70 +
        random() * 0.16;

      green =
        0.84 +
        random() * 0.12;

      blue = 1.0;
    }

    colours[offset] =
      red * brightness;

    colours[offset + 1] =
      green * brightness;

    colours[offset + 2] =
      blue * brightness;
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
      size: compact
        ? 0.23
        : 0.32,

      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,

      opacity: compact
        ? 0.62
        : 0.82,

      blending:
        THREE.AdditiveBlending,

      depthWrite: false,
      depthTest: true,
      fog: false,
    });

  const points =
    new THREE.Points(
      geometry,
      material,
    );

  points.name =
    "AstraGalacticBand";

  points.frustumCulled =
    false;

  points.raycast =
    () => {};

  return {
    points,
    geometry,
    material,
  };
}


/**
 * Diffuse procedural interstellar dust / nebular luminosity.
 *
 * A transparent inward-facing sphere surrounds the Astra composition. The
 * shader evaluates a camera-derived galactic latitude plus deterministic
 * directional noise, creating a broad Milky-Way-like haze without downloading
 * a photographic sky texture or adding post-processing.
 */
function createNebulaDustLayer(options: {
  compact: boolean;
}) {
  const { compact } = options;

  const {
    normal,
    forward,
    tangent,
  } =
    createOpeningViewGalacticBasis();

  const geometry =
    new THREE.SphereGeometry(
      45,
      compact ? 36 : 56,
      compact ? 22 : 34,
    );

  const material =
    new THREE.ShaderMaterial({
      uniforms: {
        uGalacticNormal: {
          value: normal,
        },

        uGalacticForward: {
          value: forward,
        },

        uGalacticTangent: {
          value: tangent,
        },

        uCompact: {
          value: compact ? 1 : 0,
        },
      },

      vertexShader: `
        varying vec3 vDirection;

        void main() {
          vDirection =
            normalize(position);

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        precision highp float;

        varying vec3 vDirection;

        uniform vec3 uGalacticNormal;
        uniform vec3 uGalacticForward;
        uniform vec3 uGalacticTangent;
        uniform float uCompact;

        float hash31(vec3 p) {
          p =
            fract(
              p * 0.1031
            );

          p +=
            dot(
              p,
              p.yzx + 33.33
            );

          return
            fract(
              (
                p.x +
                p.y
              ) *
              p.z
            );
        }

        float valueNoise(vec3 p) {
          vec3 i =
            floor(p);

          vec3 f =
            fract(p);

          f =
            f *
            f *
            (
              3.0 -
              2.0 * f
            );

          float n000 =
            hash31(i + vec3(0.0, 0.0, 0.0));

          float n100 =
            hash31(i + vec3(1.0, 0.0, 0.0));

          float n010 =
            hash31(i + vec3(0.0, 1.0, 0.0));

          float n110 =
            hash31(i + vec3(1.0, 1.0, 0.0));

          float n001 =
            hash31(i + vec3(0.0, 0.0, 1.0));

          float n101 =
            hash31(i + vec3(1.0, 0.0, 1.0));

          float n011 =
            hash31(i + vec3(0.0, 1.0, 1.0));

          float n111 =
            hash31(i + vec3(1.0, 1.0, 1.0));

          float nx00 =
            mix(
              n000,
              n100,
              f.x
            );

          float nx10 =
            mix(
              n010,
              n110,
              f.x
            );

          float nx01 =
            mix(
              n001,
              n101,
              f.x
            );

          float nx11 =
            mix(
              n011,
              n111,
              f.x
            );

          float nxy0 =
            mix(
              nx00,
              nx10,
              f.y
            );

          float nxy1 =
            mix(
              nx01,
              nx11,
              f.y
            );

          return
            mix(
              nxy0,
              nxy1,
              f.z
            );
        }

        float fbm(vec3 p) {
          float total = 0.0;
          float amplitude = 0.52;

          total +=
            valueNoise(p) *
            amplitude;

          p =
            p * 2.03 +
            vec3(
              1.7,
              2.9,
              4.1
            );

          amplitude *= 0.52;

          total +=
            valueNoise(p) *
            amplitude;

          p =
            p * 2.01 +
            vec3(
              3.2,
              1.4,
              2.6
            );

          amplitude *= 0.52;

          total +=
            valueNoise(p) *
            amplitude;

          p =
            p * 2.07 +
            vec3(
              2.1,
              4.0,
              1.3
            );

          amplitude *= 0.52;

          total +=
            valueNoise(p) *
            amplitude;

          return total;
        }

        void main() {
          vec3 dir =
            normalize(vDirection);

          float latitude =
            abs(
              dot(
                dir,
                normalize(
                  uGalacticNormal
                )
              )
            );

          /*
           * Broad galactic luminosity plus a narrower central lane.
           */
          float broadBand =
            exp(
              -latitude *
              5.5
            );

          float coreBand =
            exp(
              -latitude *
              14.0
            );

          float longitude =
            atan(
              dot(
                dir,
                normalize(
                  uGalacticTangent
                )
              ),
              dot(
                dir,
                normalize(
                  uGalacticForward
                )
              )
            );

          vec3 noisePosition =
            dir * 5.3 +
            vec3(
              longitude * 0.40,
              longitude * 0.17,
              -longitude * 0.26
            );

          float coarse =
            fbm(
              noisePosition
            );

          float detail =
            fbm(
              noisePosition *
              1.85 +
              vec3(
                4.7,
                1.2,
                3.5
              )
            );

          float clouds =
            smoothstep(
              0.36,
              0.78,
              coarse * 0.72 +
              detail * 0.28
            );

          /*
           * Dark dust lanes break the diffuse band into irregular structure.
           */
          float dustNoise =
            fbm(
              noisePosition *
              2.45 +
              vec3(
                8.1,
                2.6,
                5.4
              )
            );

          float dustLane =
            smoothstep(
              0.50,
              0.76,
              dustNoise
            ) *
            coreBand;

          float longitudinalGlow =
            0.82 +
            0.18 *
              sin(
                longitude * 2.0 +
                0.9
              ) *
              sin(
                longitude * 0.73 -
                0.4
              );

          float density =
            (
              broadBand * 0.46 +
              coreBand * 0.56
            ) *
            (
              0.34 +
              clouds * 0.94
            ) *
            longitudinalGlow;

          density *=
            1.0 -
            dustLane * 0.62;

          /*
           * Restrained astronomical colour: predominantly neutral/cool with
           * small warmer patches. No saturated fantasy-nebula palette.
           */
          float warmPatch =
            smoothstep(
              0.56,
              0.82,
              fbm(
                noisePosition *
                1.34 +
                vec3(
                  0.4,
                  7.8,
                  2.1
                )
              )
            );

          vec3 coolColour =
            vec3(
              0.36,
              0.50,
              0.84
            );

          vec3 neutralColour =
            vec3(
              0.58,
              0.55,
              0.70
            );

          vec3 warmColour =
            vec3(
              0.72,
              0.39,
              0.30
            );

          vec3 colour =
            mix(
              coolColour,
              neutralColour,
              clouds * 0.52
            );

          colour =
            mix(
              colour,
              warmColour,
              warmPatch * 0.31
            );

          float compactScale =
            mix(
              1.0,
              0.76,
              uCompact
            );

          /*
           * Premium visibility calibration for the real Observatory canvas.
           * The haze remains a background layer, but it must read clearly
           * behind Earth instead of disappearing into the black scene.
           */
          float alpha =
            density *
            0.56 *
            compactScale;

          if (
            alpha <
            0.008
          ) {
            discard;
          }

          gl_FragColor =
            vec4(
              colour *
              (
                0.88 +
                clouds * 0.72
              ),
              alpha
            );
        }
      `,

      transparent: true,
      blending:
        THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.BackSide,
      fog: false,
      toneMapped: false,
    });

  const mesh =
    new THREE.Mesh(
      geometry,
      material,
    );

  mesh.name =
    "AstraNebulaDust";

  mesh.frustumCulled =
    false;

  mesh.raycast =
    () => {};

  return {
    mesh,
    geometry,
    material,
  };
}


/**
 * Creates one lightweight procedural spiral-galaxy sprite texture.
 */
function createGalaxyTexture(options: {
  compact: boolean;
  seed: number;
}) {
  const {
    compact,
    seed,
  } = options;

  const size =
    compact ? 192 : 256;

  const canvas =
    document.createElement(
      "canvas",
    );

  canvas.width = size;
  canvas.height = size;

  const context =
    canvas.getContext(
      "2d",
    );

  if (!context) {
    return null;
  }

  const random =
    createSeededRandom(seed);

  context.clearRect(
    0,
    0,
    size,
    size,
  );

  const centre =
    size * 0.5;

  /*
   * Diffuse stellar body.
   */
  const halo =
    context.createRadialGradient(
      centre,
      centre,
      0,
      centre,
      centre,
      size * 0.46,
    );

  halo.addColorStop(
    0,
    "rgba(255,252,244,1)",
  );

  halo.addColorStop(
    0.08,
    "rgba(224,231,255,0.82)",
  );

  halo.addColorStop(
    0.30,
    "rgba(142,166,232,0.34)",
  );

  halo.addColorStop(
    1,
    "rgba(35,49,88,0)",
  );

  context.fillStyle =
    halo;

  context.beginPath();

  context.ellipse(
    centre,
    centre,
    size * 0.44,
    size * 0.19,
    0,
    0,
    Math.PI * 2,
  );

  context.fill();

  /*
   * Granular spiral-arm stars.
   */
  context.globalCompositeOperation =
    "lighter";

  const starCount =
    compact ? 180 : 290;

  for (
    let index = 0;
    index < starCount;
    index++
  ) {
    const arm =
      index % 2;

    const radius =
      Math.pow(
        random(),
        0.68,
      );

    const angle =
      radius * 8.6 +
      arm * Math.PI +
      (
        random() -
        0.5
      ) *
        0.82;

    const x =
      centre +
      Math.cos(angle) *
        radius *
        size *
        0.39;

    const y =
      centre +
      Math.sin(angle) *
        radius *
        size *
        0.13;

    const pointRadius =
      0.42 +
      random() * 1.22;

    const opacity =
      0.18 +
      random() * 0.58;

    context.fillStyle =
      random() < 0.18
        ? `rgba(190,211,255,${opacity})`
        : `rgba(235,238,255,${opacity})`;

    context.beginPath();

    context.arc(
      x,
      y,
      pointRadius,
      0,
      Math.PI * 2,
    );

    context.fill();
  }

  context.globalCompositeOperation =
    "source-over";

  const texture =
    new THREE.CanvasTexture(
      canvas,
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.generateMipmaps =
    false;

  return texture;
}


/**
 * Rare, remote galaxy structures.
 *
 * The first is deliberately visible in the canonical overview's negative
 * space; the second sits elsewhere on the celestial shell and appears during
 * Orbit Scene. Both remain far weaker than Earth, Sun, Moon and TESS.
 */
function createDistantGalaxyLayer(options: {
  compact: boolean;
}) {
  const { compact } = options;

  const {
    forward,
    tangent,
    normal,
  } =
    createOpeningViewGalacticBasis();

  const group =
    new THREE.Group();

  group.name =
    "AstraDistantGalaxies";

  const textures:
    THREE.CanvasTexture[] =
    [];

  const materials:
    THREE.SpriteMaterial[] =
    [];

  const directions = [
    {
      horizontal: 13.5,
      vertical: -8.0,
      radius: 39,
      scale: compact
        ? 1.46
        : 1.96,
      rotation: -0.34,
      opacity: compact
        ? 0.48
        : 0.68,
      seed: 20260811,
    },
    {
      horizontal: 128,
      vertical: 14,
      radius: 41,
      scale: compact
        ? 1.10
        : 1.48,
      rotation: 0.47,
      opacity: compact
        ? 0.34
        : 0.48,
      seed: 20260812,
    },
  ];

  directions.forEach(
    (definition, index) => {
      const texture =
        createGalaxyTexture({
          compact,
          seed:
            definition.seed,
        });

      if (!texture) {
        return;
      }

      textures.push(
        texture,
      );

      const horizontal =
        THREE.MathUtils.degToRad(
          definition.horizontal,
        );

      const vertical =
        THREE.MathUtils.degToRad(
          definition.vertical,
        );

      const direction =
        forward
          .clone()
          .multiplyScalar(
            Math.cos(
              horizontal,
            ) *
              Math.cos(
                vertical,
              ),
          )
          .addScaledVector(
            tangent,
            Math.sin(
              horizontal,
            ) *
              Math.cos(
                vertical,
              ),
          )
          .addScaledVector(
            normal,
            Math.sin(
              vertical,
            ),
          )
          .normalize();

      const material =
        new THREE.SpriteMaterial({
          map: texture,
          color: 0xffffff,
          transparent: true,
          opacity:
            definition.opacity,
          blending:
            THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true,
          toneMapped: false,
          rotation:
            definition.rotation,
        });

      materials.push(
        material,
      );

      const sprite =
        new THREE.Sprite(
          material,
        );

      sprite.name =
        `AstraDistantGalaxy${index + 1}`;

      sprite.position.copy(
        direction.multiplyScalar(
          definition.radius,
        ),
      );

      sprite.scale.set(
        definition.scale * 1.70,
        definition.scale,
        1,
      );

      sprite.raycast =
        () => {};

      group.add(
        sprite,
      );
    },
  );

  return {
    group,
    textures,
    materials,
  };
}


/**
 * Premium bright-star hierarchy plus restrained constellation-like asterisms.
 *
 * There are deliberately no connecting lines and no names. The patterns are
 * simply recognizable stellar groupings embedded in the real world-space sky.
 */
function createBrightStarLayer(options: {
  compact: boolean;
}) {
  const { compact } = options;

  /*
   * Three subtle asterism patterns in angular coordinates around the opening
   * celestial basis. These are visual constellational groupings rather than
   * labelled sky-chart overlays.
   */
  const asterismOffsets = [
    // Belt-like pattern with surrounding corner stars.
    [-12.0, 7.0],
    [-7.5, 2.5],
    [-3.0, -2.0],
    [1.5, -6.2],
    [-11.2, -7.5],
    [0.2, 7.5],

    // Compact zig-zag pattern.
    [7.0, 9.0],
    [10.2, 6.4],
    [13.0, 8.0],
    [16.0, 4.8],
    [19.0, 7.0],

    // Smaller cross-like stellar grouping, no lines.
    [11.2, -7.5],
    [14.0, -10.0],
    [16.8, -7.0],
    [14.0, -4.2],
  ] as const;

  const asterismCount =
    asterismOffsets.length;

  const randomCount =
    compact ? 34 : 68;

  const count =
    asterismCount +
    randomCount;

  const random =
    createSeededRandom(20260809);

  const positions =
    new Float32Array(count * 3);

  const colours =
    new Float32Array(count * 3);

  const magnitudes =
    new Float32Array(count);

  const phases =
    new Float32Array(count);

  const sparkleStrengths =
    new Float32Array(count);

  const {
    forward,
    tangent,
    normal,
  } =
    createOpeningViewGalacticBasis();

  const direction =
    new THREE.Vector3();

  for (
    let index = 0;
    index < count;
    index++
  ) {
    const radius =
      32 +
      random() * 22;

    const isAsterism =
      index <
      asterismCount;

    if (isAsterism) {
      const [
        horizontalDegrees,
        verticalDegrees,
      ] =
        asterismOffsets[
          index
        ];

      const horizontalAngle =
        THREE.MathUtils.degToRad(
          horizontalDegrees,
        );

      const verticalAngle =
        THREE.MathUtils.degToRad(
          verticalDegrees,
        );

      direction
        .copy(forward)
        .addScaledVector(
          tangent,
          Math.tan(
            horizontalAngle,
          ),
        )
        .addScaledVector(
          normal,
          Math.tan(
            verticalAngle,
          ),
        )
        .normalize();
    } else if (
      random() < 0.80
    ) {
      const longitude =
        random() *
        Math.PI *
        2;

      const latitudeNoise =
        (
          random() +
          random() +
          random() +
          random()
        ) - 2;

      const latitude =
        latitudeNoise * 0.13;

      const cosLatitude =
        Math.cos(latitude);

      direction
        .copy(forward)
        .multiplyScalar(
          Math.cos(longitude) *
            cosLatitude,
        )
        .addScaledVector(
          tangent,
          Math.sin(longitude) *
            cosLatitude,
        )
        .addScaledVector(
          normal,
          Math.sin(latitude),
        )
        .normalize();
    } else {
      const y =
        random() * 2 - 1;

      const theta =
        random() *
        Math.PI *
        2;

      const horizontal =
        Math.sqrt(
          Math.max(
            0,
            1 - y * y,
          ),
        );

      direction.set(
        horizontal *
          Math.cos(theta),
        y,
        horizontal *
          Math.sin(theta),
      );
    }

    const offset =
      index * 3;

    positions[offset] =
      direction.x * radius;

    positions[offset + 1] =
      direction.y * radius;

    positions[offset + 2] =
      direction.z * radius;

    const temperature =
      random();

    let red = 1;
    let green = 0.97;
    let blue = 0.94;

    if (temperature < 0.18) {
      red = 1;

      green =
        0.74 +
        random() * 0.14;

      blue =
        0.54 +
        random() * 0.16;
    } else if (
      temperature > 0.68
    ) {
      red =
        0.70 +
        random() * 0.16;

      green =
        0.85 +
        random() * 0.11;

      blue = 1;
    } else {
      red =
        0.94 +
        random() * 0.06;

      green =
        0.95 +
        random() * 0.05;

      blue =
        0.94 +
        random() * 0.06;
    }

    colours[offset] = red;
    colours[offset + 1] = green;
    colours[offset + 2] = blue;

    const magnitudeChance =
      random();

    magnitudes[index] =
      isAsterism
        ? 1.28 +
          random() * 0.42
        : magnitudeChance > 0.90
          ? 1.75 +
            random() * 0.35
          : magnitudeChance > 0.58
            ? 1.25 +
              random() * 0.28
            : 0.88 +
              random() * 0.20;

    phases[index] =
      random() *
      Math.PI *
      2;

    sparkleStrengths[index] =
      isAsterism
        ? 0.48 +
          random() * 0.32
        : random() > 0.68
          ? 0.62 +
            random() * 0.38
          : 0.18 +
            random() * 0.24;
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

  geometry.setAttribute(
    "aMagnitude",
    new THREE.BufferAttribute(
      magnitudes,
      1,
    ),
  );

  geometry.setAttribute(
    "aPhase",
    new THREE.BufferAttribute(
      phases,
      1,
    ),
  );

  geometry.setAttribute(
    "aSparkleStrength",
    new THREE.BufferAttribute(
      sparkleStrengths,
      1,
    ),
  );

  const material =
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: {
          value: 0,
        },

        uMotionEnabled: {
          value: 1,
        },

        uPixelRatio: {
          value: Math.min(
            window.devicePixelRatio || 1,
            2,
          ),
        },

        uCompact: {
          value: compact ? 1 : 0,
        },
      },

      vertexShader: `
        attribute float aMagnitude;
        attribute float aPhase;
        attribute float aSparkleStrength;

        varying vec3 vColor;
        varying float vMagnitude;
        varying float vPhase;
        varying float vSparkleStrength;

        uniform float uPixelRatio;
        uniform float uCompact;

        void main() {
          vColor = color;
          vMagnitude = aMagnitude;
          vPhase = aPhase;
          vSparkleStrength = aSparkleStrength;

          vec4 mvPosition =
            modelViewMatrix *
            vec4(position, 1.0);

          float perspectiveSize =
            (100.0 * aMagnitude) /
            max(5.0, -mvPosition.z);

          float compactScale =
            mix(
              1.0,
              0.84,
              uCompact
            );

          gl_PointSize =
            clamp(
              perspectiveSize *
              uPixelRatio *
              compactScale,
              9.0,
              28.0
            );

          gl_Position =
            projectionMatrix *
            mvPosition;
        }
      `,

      fragmentShader: `
        precision highp float;

        varying vec3 vColor;
        varying float vMagnitude;
        varying float vPhase;
        varying float vSparkleStrength;

        uniform float uTime;
        uniform float uMotionEnabled;

        void main() {
          vec2 p =
            gl_PointCoord -
            vec2(0.5);

          float radius =
            length(p);

          if (radius > 0.5) {
            discard;
          }

          float twinkleA =
            sin(
              uTime * 1.25 +
              vPhase
            );

          float twinkleB =
            sin(
              uTime * 2.05 +
              vPhase * 1.71
            );

          float twinkle =
            1.0 +
            uMotionEnabled *
            (
              twinkleA * 0.10 +
              twinkleB * 0.045
            );

          float core =
            1.0 -
            smoothstep(
              0.0,
              0.105,
              radius
            );

          core =
            pow(
              core,
              1.25
            );

          float halo =
            1.0 -
            smoothstep(
              0.055,
              0.47,
              radius
            );

          halo *= 0.62;

          float horizontalRay =
            exp(
              -abs(p.y) * 64.0
            ) *
            (
              1.0 -
              smoothstep(
                0.075,
                0.48,
                abs(p.x)
              )
            );

          float verticalRay =
            exp(
              -abs(p.x) * 64.0
            ) *
            (
              1.0 -
              smoothstep(
                0.075,
                0.48,
                abs(p.y)
              )
            );

          float diffraction =
            (
              horizontalRay +
              verticalRay
            ) *
            0.46 *
            vSparkleStrength;

          diffraction *=
            smoothstep(
              0.05,
              0.15,
              radius
            );

          float intensity =
            (
              core * 1.34 +
              halo +
              diffraction
            ) *
            twinkle;

          vec3 coreColour =
            mix(
              vColor,
              vec3(1.0),
              core * 0.68
            );

          float alpha =
            clamp(
              intensity *
              (
                0.75 +
                vMagnitude * 0.18
              ),
              0.0,
              1.0
            );

          if (alpha < 0.012) {
            discard;
          }

          gl_FragColor =
            vec4(
              coreColour *
              intensity,
              alpha
            );
        }
      `,

      vertexColors: true,
      transparent: true,

      blending:
        THREE.AdditiveBlending,

      depthWrite: false,
      depthTest: true,
      fog: false,
      toneMapped: false,
    });

  const points =
    new THREE.Points(
      geometry,
      material,
    );

  points.name =
    "AstraBrightStars";

  points.frustumCulled =
    false;

  points.raycast =
    () => {};

  return {
    points,
    geometry,
    material,

    update(options: {
      elapsedSeconds: number;
      reducedMotion: boolean;
    }) {
      const {
        elapsedSeconds,
        reducedMotion,
      } = options;

      material.uniforms.uMotionEnabled.value =
        reducedMotion
          ? 0
          : 1;

      if (!reducedMotion) {
        material.uniforms.uTime.value =
          elapsedSeconds;
      }
    },
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
   * ------------------------------------------------------------
   * Foundation Stellar Populations
   * ------------------------------------------------------------
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
   * ------------------------------------------------------------
   * Premium Deep-Space Phase 2
   * ------------------------------------------------------------
   *
   * Layer hierarchy:
   * - procedural diffuse interstellar dust / nebular luminosity;
   * - granular Milky-Way-like stellar concentration;
   * - rare remote galaxy sprites;
   * - original spherical background stars;
   * - premium bright stars and line-free asterism patterns.
   */

  const nebulaDust =
    createNebulaDustLayer({
      compact,
    });

  const galacticBand =
    createGalacticBandLayer({
      compact,
    });

  const distantGalaxies =
    createDistantGalaxyLayer({
      compact,
    });

  const brightStars =
    createBrightStarLayer({
      compact,
    });


  /*
   * ------------------------------------------------------------
   * Render Ordering
   * ------------------------------------------------------------
   */

  nebulaDust.mesh.renderOrder =
    -30;

  galacticBand.points.renderOrder =
    -24;

  distantGalaxies.group.renderOrder =
    -22;

  distant.points.renderOrder =
    -20;

  foreground.points.renderOrder =
    -19;

  brightStars.points.renderOrder =
    -18;


  /*
   * ------------------------------------------------------------
   * Deep-Space Scene Graph
   * ------------------------------------------------------------
   */

  group.add(
    nebulaDust.mesh,
    galacticBand.points,
    distantGalaxies.group,
    distant.points,
    foreground.points,
    brightStars.points,
  );

  scene.add(group);


  /*
   * ------------------------------------------------------------
   * Runtime Motion
   * ------------------------------------------------------------
   *
   * Only the complete celestial group receives extremely slow decorative
   * drift. Premium-star scintillation is managed independently and freezes
   * when reduced motion is active.
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

      brightStars.update({
        elapsedSeconds,
        reducedMotion:
          effectiveReducedMotion,
      });

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


    /*
     * ------------------------------------------------------------
     * Lifecycle Cleanup
     * ------------------------------------------------------------
     */

    dispose() {
      scene.remove(group);

      nebulaDust.geometry.dispose();
      nebulaDust.material.dispose();

      galacticBand.geometry.dispose();
      galacticBand.material.dispose();

      distantGalaxies.materials.forEach(
        (material) =>
          material.dispose(),
      );

      distantGalaxies.textures.forEach(
        (texture) =>
          texture.dispose(),
      );

      distant.geometry.dispose();
      distant.material.dispose();

      foreground.geometry.dispose();
      foreground.material.dispose();

      brightStars.geometry.dispose();
      brightStars.material.dispose();

      group.clear();
    },
  };
}