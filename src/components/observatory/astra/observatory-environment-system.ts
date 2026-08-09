import * as THREE from "three";

import {
  type ObservatoryLightingPhase,
} from "./observatory-destinations";

import type {
  GroundObservatoryId,
} from "./observatory-registry";

export type ObservatoryEnvironmentSystemOptions = {
  scene: THREE.Scene;
  observatoryId: GroundObservatoryId;
};

export type ObservatoryEnvironmentSystem = {
  observatoryId: GroundObservatoryId;
  group: THREE.Group;
  facilityAnchor: THREE.Object3D;
  setVisible(visible: boolean): void;
  setLightingPhase(phase: ObservatoryLightingPhase): void;
  dispose(): void;
};

type Disposable = THREE.BufferGeometry | THREE.Material | THREE.Texture;

type BuildResult = {
  facilityAnchor: THREE.Object3D;
  materials: THREE.MeshStandardMaterial[];
};

const WORLD_SIZE = 72;
const TERRAIN_SEGMENTS = 128;

function hash(x: number, z: number, seed: number) {
  const n = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function fbm(x: number, z: number, seed: number) {
  let total = 0;
  let amplitude = 0.55;
  let frequency = 0.11;

  for (let octave = 0; octave < 5; octave += 1) {
    total += (
      Math.sin(x * frequency + seed * 1.7) *
        Math.cos(z * frequency * 0.91 - seed * 1.13) *
        0.72 +
      (hash(Math.floor(x * frequency * 2), Math.floor(z * frequency * 2), seed + octave) - 0.5) * 0.34
    ) * amplitude;

    amplitude *= 0.52;
    frequency *= 2.02;
  }

  return total;
}

function makeMaterial(
  color: THREE.ColorRepresentation,
  materials: THREE.MeshStandardMaterial[],
  roughness = 0.9,
  metalness = 0.01,
) {
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  materials.push(material);
  return material;
}

function makeTerrain(
  options: {
    size?: number;
    segments?: number;
    height: (x: number, z: number) => number;
    color: THREE.ColorRepresentation;
  },
  disposables: Disposable[],
  materials: THREE.MeshStandardMaterial[],
) {
  const geometry = new THREE.PlaneGeometry(
    options.size ?? WORLD_SIZE,
    options.size ?? WORLD_SIZE,
    options.segments ?? TERRAIN_SEGMENTS,
    options.segments ?? TERRAIN_SEGMENTS,
  );

  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position as THREE.BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    positions.setY(index, options.height(x, z));
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();

  const material = makeMaterial(options.color, materials, 0.96, 0.005);
  const mesh = new THREE.Mesh(geometry, material);
  disposables.push(geometry, material);
  return mesh;
}

function makeSkyDome(
  top: THREE.ColorRepresentation,
  horizon: THREE.ColorRepresentation,
  disposables: Disposable[],
) {
  const geometry = new THREE.SphereGeometry(55, 40, 24);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(top) },
      horizonColor: { value: new THREE.Color(horizon) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        float t = smoothstep(-0.08, 0.82, h);
        vec3 color = mix(horizonColor, topColor, t);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });

  const sky = new THREE.Mesh(geometry, material);
  disposables.push(geometry, material);
  return sky;
}

function makeRidge(
  options: {
    seed: number;
    width: number;
    depth: number;
    height: number;
    baseY: number;
    z: number;
    color: THREE.ColorRepresentation;
  },
  disposables: Disposable[],
  materials: THREE.MeshStandardMaterial[],
) {
  const geometry = new THREE.PlaneGeometry(options.width, options.depth, 64, 20);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position as THREE.BufferAttribute;

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    const lateral = Math.max(0, 1 - Math.pow(Math.abs(x) / (options.width * 0.52), 1.8));
    const depthProfile = Math.sin(
      THREE.MathUtils.clamp((z / options.depth + 0.5) * Math.PI, 0, Math.PI),
    );
    const ridgeNoise = fbm(x * 1.25, z * 1.35, options.seed);

    positions.setY(
      index,
      options.baseY +
        options.height * lateral * Math.max(0, depthProfile) +
        ridgeNoise * options.height * 0.22,
    );
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  const material = makeMaterial(options.color, materials, 0.98);
  const ridge = new THREE.Mesh(geometry, material);
  ridge.position.z = options.z;
  disposables.push(geometry, material);
  return ridge;
}

function makeRoad(
  points: THREE.Vector3[],
  disposables: Disposable[],
  materials: THREE.MeshStandardMaterial[],
  width = 0.28,
) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.45);
  const geometry = new THREE.TubeGeometry(curve, 80, width, 8, false);
  const material = makeMaterial(0x242628, materials, 0.93);
  const mesh = new THREE.Mesh(geometry, material);
  disposables.push(geometry, material);
  return mesh;
}


function dotTerrainHeight(
  x: number,
  z: number,
) {
  const distance =
    Math.hypot(
      x,
      z,
    );

  const centralFlatten =
    1 -
    THREE.MathUtils
      .smoothstep(
        distance,
        5.2,
        10.5,
      );

  const localRelief =
    fbm(
      x * 0.82,
      z * 0.82,
      2.8,
    ) *
    1.08;

  /*
   * The supplied Devasthal photographs show a developed mountain site that
   * falls away from the Observatory rather than a symmetric bowl.
   */
  const longitudinalSlope =
    THREE.MathUtils
      .smoothstep(
        -12,
        26,
        z,
      ) *
    0.46;

  const crossSlope =
    THREE.MathUtils
      .smoothstep(
        -24,
        22,
        x,
      ) *
    0.16;

  const outerRise =
    Math.max(
      0,
      (
        distance -
        22
      ) *
        0.025,
    );

  return (
    localRelief *
      (
        1 -
        centralFlatten *
          0.93
      ) +
    longitudinalSlope *
      (
        1 -
        centralFlatten *
          0.96
      ) +
    crossSlope *
      (
        1 -
        centralFlatten *
          0.9
      ) +
    outerRise
  );
}


function makeDotRoadRibbon(
  points: THREE.Vector3[],
  disposables: Disposable[],
  materials: THREE.MeshStandardMaterial[],
  width = 1.0,
) {
  const curve =
    new THREE.CatmullRomCurve3(
      points,
      false,
      "catmullrom",
      0.45,
    );

  const segments =
    90;

  const positions:
    number[] =
    [];

  const indices:
    number[] =
    [];

  const tangent =
    new THREE.Vector3();

  const side =
    new THREE.Vector3();

  const point =
    new THREE.Vector3();

  for (
    let index = 0;
    index <= segments;
    index += 1
  ) {
    const t =
      index /
      segments;

    curve.getPoint(
      t,
      point,
    );

    curve.getTangent(
      t,
      tangent,
    );

    tangent.y =
      0;

    tangent.normalize();

    side.set(
      -tangent.z,
      0,
      tangent.x,
    );

    const halfWidth =
      width *
      (
        0.47 +
        Math.sin(
          t *
            Math.PI,
        ) *
          0.035
      );

    const leftX =
      point.x +
      side.x *
        halfWidth;

    const leftZ =
      point.z +
      side.z *
        halfWidth;

    const rightX =
      point.x -
      side.x *
        halfWidth;

    const rightZ =
      point.z -
      side.z *
        halfWidth;

    positions.push(
      leftX,
      dotTerrainHeight(
        leftX,
        leftZ,
      ) +
        0.075,
      leftZ,

      rightX,
      dotTerrainHeight(
        rightX,
        rightZ,
      ) +
        0.075,
      rightZ,
    );

    if (
      index <
      segments
    ) {
      const base =
        index *
        2;

      indices.push(
        base,
        base + 2,
        base + 1,

        base + 1,
        base + 2,
        base + 3,
      );
    }
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      positions,
      3,
    ),
  );

  geometry.setIndex(
    indices,
  );

  geometry.computeVertexNormals();

  const material =
    makeMaterial(
      0xb9b8ae,
      materials,
      0.96,
      0.006,
    );

  const road =
    new THREE.Mesh(
      geometry,
      material,
    );

  disposables.push(
    geometry,
    material,
  );

  return road;
}


function makeDotTerrace(
  disposables: Disposable[],
  materials: THREE.MeshStandardMaterial[],
) {
  const shape =
    new THREE.Shape();

  shape.moveTo(
    -5.4,
    -2.75,
  );

  shape.lineTo(
    -3.7,
    -4.15,
  );

  shape.lineTo(
    0.2,
    -4.5,
  );

  shape.lineTo(
    4.55,
    -3.15,
  );

  shape.lineTo(
    5.25,
    -0.15,
  );

  shape.lineTo(
    4.3,
    3.5,
  );

  shape.lineTo(
    1.15,
    4.55,
  );

  shape.lineTo(
    -3.2,
    4.05,
  );

  shape.lineTo(
    -5.65,
    1.75,
  );

  shape.closePath();

  const geometry =
    new THREE.ShapeGeometry(
      shape,
      24,
    );

  geometry.rotateX(
    -Math.PI /
      2,
  );

  const material =
    makeMaterial(
      0x77766d,
      materials,
      0.985,
      0.004,
    );

  const terrace =
    new THREE.Mesh(
      geometry,
      material,
    );

  terrace.position.y =
    0.115;

  disposables.push(
    geometry,
    material,
  );

  return terrace;
}


function addDotBroadleafForest(
  group: THREE.Group,
  disposables: Disposable[],
  materials: THREE.MeshStandardMaterial[],
  seed: number,
  count: number,
) {
  /*
   * Devasthal is a mixed Himalayan broadleaf site. The supplied photographs
   * show crooked trunks and layered crowns, not repeated conifer cones.
   *
   * Keep the system instanced for fullscreen performance, but build every tree
   * from one trunk plus three offset crown masses. Random non-uniform scaling
   * and lateral offsets remove the previous "green-ball-on-a-stick" pattern.
   */
  const trunkGeometry =
    new THREE.CylinderGeometry(
      0.04,
      0.075,
      0.78,
      7,
    );

  const branchGeometry =
    new THREE.CylinderGeometry(
      0.018,
      0.028,
      0.42,
      5,
    );

  const crownGeometry =
    new THREE.IcosahedronGeometry(
      0.34,
      2,
    );

  const trunkMaterial =
    makeMaterial(
      0x4b382a,
      materials,
      0.99,
    );

  const crownMaterials = [
    makeMaterial(
      0x29492e,
      materials,
      0.995,
    ),
    makeMaterial(
      0x36583a,
      materials,
      0.995,
    ),
    makeMaterial(
      0x456946,
      materials,
      0.995,
    ),
    makeMaterial(
      0x536f47,
      materials,
      0.995,
    ),
  ];

  const trunks =
    new THREE.InstancedMesh(
      trunkGeometry,
      trunkMaterial,
      count,
    );

  const branches =
    new THREE.InstancedMesh(
      branchGeometry,
      trunkMaterial,
      count,
    );

  const crownLayers =
    [
      0,
      1,
      2,
    ].map(
      () =>
        crownMaterials.map(
          (
            material,
          ) =>
            new THREE.InstancedMesh(
              crownGeometry,
              material,
              count,
            ),
        ),
    );

  const matrix =
    new THREE.Matrix4();

  const position =
    new THREE.Vector3();

  const scale =
    new THREE.Vector3();

  const rotation =
    new THREE.Quaternion();

  const euler =
    new THREE.Euler();

  const hiddenPosition =
    new THREE.Vector3(
      0,
      -100,
      0,
    );

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const angle =
      hash(
        index,
        3,
        seed,
      ) *
      Math.PI *
      2;

    const radius =
      6.6 +
      Math.pow(
        hash(
          index,
          7,
          seed + 9,
        ),
        0.72,
      ) *
        29;

    const x =
      Math.cos(
        angle,
      ) *
      radius;

    const z =
      Math.sin(
        angle,
      ) *
        radius +
      3.8;

    /*
     * Preserve a developed Observatory-campus opening around the building and
     * approach road. This is intentionally not a circular forest hole.
     */
    const nearCampus =
      Math.abs(
        x,
      ) <
        7.2 &&
      z >
        -5.4 &&
      z <
        8.6;

    if (
      nearCampus &&
      hash(
        index,
        61,
        seed,
      ) >
        0.23
    ) {
      position.copy(
        hiddenPosition,
      );

      scale.setScalar(
        0.001,
      );

      matrix.compose(
        position,
        rotation,
        scale,
      );

      trunks.setMatrixAt(
        index,
        matrix,
      );

      branches.setMatrixAt(
        index,
        matrix,
      );

      for (
        const layer of
        crownLayers
      ) {
        for (
          const crown of
          layer
        ) {
          crown.setMatrixAt(
            index,
            matrix,
          );
        }
      }

      continue;
    }

    const groundY =
      dotTerrainHeight(
        x,
        z,
      );

    const size =
      0.82 +
      hash(
        index,
        11,
        seed + 2,
      ) *
        1.55;

    const leanX =
      (
        hash(
          index,
          13,
          seed + 4,
        ) -
        0.5
      ) *
      0.16;

    const leanZ =
      (
        hash(
          index,
          17,
          seed + 6,
        ) -
        0.5
      ) *
      0.16;

    euler.set(
      leanX,
      hash(
        index,
        19,
        seed + 8,
      ) *
        Math.PI *
        2,
      leanZ,
    );

    rotation.setFromEuler(
      euler,
    );

    position.set(
      x,
      groundY +
        0.39 *
          size,
      z,
    );

    scale.set(
      size *
        0.72,
      size,
      size *
        0.72,
    );

    matrix.compose(
      position,
      rotation,
      scale,
    );

    trunks.setMatrixAt(
      index,
      matrix,
    );

    /*
     * One visible crooked branch per tree gives close-range silhouettes more
     * structure without creating thousands of unique meshes.
     */
    const branchAngle =
      hash(
        index,
        23,
        seed + 12,
      ) *
      Math.PI *
      2;

    euler.set(
      0.65,
      branchAngle,
      0.18,
    );

    rotation.setFromEuler(
      euler,
    );

    position.set(
      x +
        Math.cos(
          branchAngle,
        ) *
          0.11 *
          size,
      groundY +
        0.68 *
          size,
      z +
        Math.sin(
          branchAngle,
        ) *
          0.11 *
          size,
    );

    scale.set(
      size *
        0.62,
      size *
        0.86,
      size *
        0.62,
    );

    matrix.compose(
      position,
      rotation,
      scale,
    );

    branches.setMatrixAt(
      index,
      matrix,
    );

    const colorIndex =
      index %
      crownMaterials.length;

    for (
      let layerIndex = 0;
      layerIndex < 3;
      layerIndex += 1
    ) {
      const lateralAngle =
        hash(
          index,
          31 +
            layerIndex *
              7,
          seed + 20,
        ) *
        Math.PI *
        2;

      const lateralRadius =
        (
          layerIndex ===
          0
            ? 0.09
            : 0.22 +
              layerIndex *
                0.03
        ) *
        size;

      const crownX =
        x +
        Math.cos(
          lateralAngle,
        ) *
          lateralRadius;

      const crownZ =
        z +
        Math.sin(
          lateralAngle,
        ) *
          lateralRadius;

      const crownY =
        groundY +
        (
          0.91 +
          layerIndex *
            0.14
        ) *
          size;

      position.set(
        crownX,
        crownY,
        crownZ,
      );

      const widthScale =
        size *
        (
          0.88 +
          hash(
            index,
            43 +
              layerIndex,
            seed,
          ) *
            0.3
        );

      scale.set(
        widthScale,
        size *
          (
            0.48 +
            layerIndex *
              0.03
          ),
        widthScale *
          (
            0.78 +
            hash(
              index,
              47 +
                layerIndex,
              seed,
            ) *
              0.28
          ),
      );

      euler.set(
        0,
        lateralAngle,
        (
          hash(
            index,
            53 +
              layerIndex,
            seed,
          ) -
          0.5
        ) *
          0.24,
      );

      rotation.setFromEuler(
        euler,
      );

      matrix.compose(
        position,
        rotation,
        scale,
      );

      for (
        let materialIndex = 0;
        materialIndex <
        crownMaterials.length;
        materialIndex += 1
      ) {
        if (
          materialIndex ===
          colorIndex
        ) {
          crownLayers[
            layerIndex
          ][
            materialIndex
          ].setMatrixAt(
            index,
            matrix,
          );
        } else {
          position.copy(
            hiddenPosition,
          );

          scale.setScalar(
            0.001,
          );

          matrix.compose(
            position,
            rotation,
            scale,
          );

          crownLayers[
            layerIndex
          ][
            materialIndex
          ].setMatrixAt(
            index,
            matrix,
          );
        }
      }
    }
  }

  trunks.instanceMatrix.needsUpdate =
    true;

  branches.instanceMatrix.needsUpdate =
    true;

  group.add(
    trunks,
    branches,
  );

  for (
    const layer of
    crownLayers
  ) {
    for (
      const crown of
      layer
    ) {
      crown.instanceMatrix.needsUpdate =
        true;

      group.add(
        crown,
      );
    }
  }

  /*
   * Understory variation visible in the supplied site / forest photographs.
   */
  const shrubGeometry =
    new THREE.IcosahedronGeometry(
      0.16,
      1,
    );

  const shrubMaterial =
    makeMaterial(
      0x4b653a,
      materials,
      0.995,
    );

  const shrubs =
    new THREE.InstancedMesh(
      shrubGeometry,
      shrubMaterial,
      320,
    );

  for (
    let index = 0;
    index < 320;
    index += 1
  ) {
    const x =
      (
        hash(
          index,
          71,
          seed,
        ) -
        0.5
      ) *
      62;

    const z =
      (
        hash(
          index,
          73,
          seed + 2,
        ) -
        0.5
      ) *
        58 +
      2;

    const campus =
      Math.abs(
        x,
      ) <
        7 &&
      z >
        -5 &&
      z <
        8;

    if (
      campus
    ) {
      position.copy(
        hiddenPosition,
      );

      scale.setScalar(
        0.001,
      );
    } else {
      const shrubSize =
        0.42 +
        hash(
          index,
          79,
          seed,
        ) *
          0.95;

      position.set(
        x,
        dotTerrainHeight(
          x,
          z,
        ) +
          0.12 *
            shrubSize,
        z,
      );

      scale.set(
        shrubSize *
          1.4,
        shrubSize *
          0.72,
        shrubSize,
      );
    }

    rotation.identity();

    matrix.compose(
      position,
      rotation,
      scale,
    );

    shrubs.setMatrixAt(
      index,
      matrix,
    );
  }

  shrubs.instanceMatrix.needsUpdate =
    true;

  group.add(
    shrubs,
  );

  disposables.push(
    trunkGeometry,
    branchGeometry,
    crownGeometry,
    trunkMaterial,
    ...crownMaterials,
    shrubGeometry,
    shrubMaterial,
  );
}


function buildDotEnvironment(
  group: THREE.Group,
  disposables: Disposable[],
): BuildResult {
  const materials:
    THREE.MeshStandardMaterial[] =
    [];

  /*
   * Devasthal daylight:
   * bright Himalayan sky, pale horizon and strong atmospheric separation.
   */
  group.add(
    makeSkyDome(
      0x77a9de,
      0xd9e4df,
      disposables,
    ),
  );


  const ground =
    makeTerrain(
      {
        color:
          0x586348,

        height:
          dotTerrainHeight,
      },

      disposables,
      materials,
    );

  group.add(
    ground,
  );


  /*
   * The photographs show many comparatively gentle ridge layers. Near ridges
   * retain green/brown structure; distant layers lose contrast and move toward
   * blue-grey atmospheric perspective.
   */
  const ridgeSpecs = [
    {
      seed: 11,
      width: 96,
      depth: 18,
      height: 3.1,
      baseY: -1.15,
      z: -28,
      color: 0x415944,
    },
    {
      seed: 19,
      width: 114,
      depth: 20,
      height: 3.8,
      baseY: -1.55,
      z: -39,
      color: 0x53685a,
    },
    {
      seed: 31,
      width: 132,
      depth: 22,
      height: 4.5,
      baseY: -1.95,
      z: -51,
      color: 0x66776d,
    },
    {
      seed: 47,
      width: 152,
      depth: 24,
      height: 4.9,
      baseY: -2.45,
      z: -64,
      color: 0x7a8783,
    },
    {
      seed: 59,
      width: 174,
      depth: 27,
      height: 5.1,
      baseY: -3.05,
      z: -78,
      color: 0x909b9c,
    },
  ];

  ridgeSpecs.forEach(
    (
      spec,
    ) =>
      group.add(
        makeRidge(
          spec,
          disposables,
          materials,
        ),
      ),
  );


  addDotBroadleafForest(
    group,
    disposables,
    materials,
    41,
    680,
  );


  /*
   * Real Devasthal reads as a developed sloping scientific campus. Replace the
   * old ellipse with an irregular cut terrace and pale concrete circulation.
   */
  const terrace =
    makeDotTerrace(
      disposables,
      materials,
    );

  group.add(
    terrace,
  );


  const concreteMaterial =
    makeMaterial(
      0xc3c1b5,
      materials,
      0.97,
      0.004,
    );

  const upperApronGeometry =
    new THREE.PlaneGeometry(
      6.5,
      4.5,
    );

  upperApronGeometry.rotateX(
    -Math.PI /
      2,
  );

  const upperApron =
    new THREE.Mesh(
      upperApronGeometry,
      concreteMaterial,
    );

  upperApron.position.set(
    -0.45,
    0.145,
    1.2,
  );

  upperApron.rotation.y =
    -0.08;

  group.add(
    upperApron,
  );


  const approachRoad =
    makeDotRoadRibbon(
      [
        new THREE.Vector3(
          15.5,
          0,
          23.5,
        ),
        new THREE.Vector3(
          12.8,
          0,
          19.8,
        ),
        new THREE.Vector3(
          10.7,
          0,
          16.1,
        ),
        new THREE.Vector3(
          8.1,
          0,
          13.0,
        ),
        new THREE.Vector3(
          6.9,
          0,
          9.4,
        ),
        new THREE.Vector3(
          4.6,
          0,
          7.0,
        ),
        new THREE.Vector3(
          3.4,
          0,
          4.6,
        ),
        new THREE.Vector3(
          2.0,
          0,
          3.0,
        ),
      ],
      disposables,
      materials,
      0.82,
    );

  group.add(
    approachRoad,
  );


  /*
   * Stone retaining walls inspired by the painted masonry visible around the
   * real site. They also visually explain the cut terrace in 360-degree mode.
   */
  const retainingMaterial =
    makeMaterial(
      0x737871,
      materials,
      0.95,
      0.015,
    );

  const retainingGeometry =
    new THREE.BoxGeometry(
      7.8,
      0.52,
      0.24,
    );

  const retainingFront =
    new THREE.Mesh(
      retainingGeometry,
      retainingMaterial,
    );

  retainingFront.position.set(
    -0.5,
    -0.02,
    4.0,
  );

  retainingFront.rotation.y =
    -0.08;

  group.add(
    retainingFront,
  );


  const retainingSideGeometry =
    new THREE.BoxGeometry(
      4.3,
      0.44,
      0.22,
    );

  const retainingSide =
    new THREE.Mesh(
      retainingSideGeometry,
      retainingMaterial,
    );

  retainingSide.position.set(
    -4.55,
    -0.04,
    1.35,
  );

  retainingSide.rotation.y =
    Math.PI /
      2 -
    0.08;

  group.add(
    retainingSide,
  );


  /*
   * ==================================================================
   * 3.6-m DOT FACILITY — PHOTO-REFERENCE RECONSTRUCTION
   * ==================================================================
   *
   * The real facility is a substantial corrugated service building carrying
   * a large cylindrical rotating enclosure. Keep the model optimized, but
   * preserve the dominant proportions and recognizable exterior details.
   */
  const facilityAnchor =
    new THREE.Group();

  facilityAnchor.name =
    "astra-dot-facility";

  facilityAnchor.position.set(
    0,
    0.15,
    0,
  );

  facilityAnchor.rotation.y =
    -0.08;

  group.add(
    facilityAnchor,
  );


  const wallMaterial =
    makeMaterial(
      0xc9cecf,
      materials,
      0.67,
      0.045,
    );

  const wallShadowMaterial =
    makeMaterial(
      0xaeb5b6,
      materials,
      0.78,
      0.035,
    );

  const roofMaterial =
    makeMaterial(
      0x8f9697,
      materials,
      0.78,
      0.08,
    );

  const openingMaterial =
    makeMaterial(
      0x273237,
      materials,
      0.64,
      0.09,
    );

  const redRoofMaterial =
    makeMaterial(
      0x6f3d37,
      materials,
      0.84,
      0.04,
    );


  /*
   * Main multi-storey service block.
   */
  const mainGeometry =
    new THREE.BoxGeometry(
      4.9,
      1.55,
      2.65,
    );

  const mainBuilding =
    new THREE.Mesh(
      mainGeometry,
      wallMaterial,
    );

  mainBuilding.position.set(
    -0.85,
    0.88,
    0,
  );

  facilityAnchor.add(
    mainBuilding,
  );


  const leftWingGeometry =
    new THREE.BoxGeometry(
      2.55,
      1.22,
      2.3,
    );

  const leftWing =
    new THREE.Mesh(
      leftWingGeometry,
      wallMaterial,
    );

  leftWing.position.set(
    -4.0,
    0.7,
    -0.05,
  );

  facilityAnchor.add(
    leftWing,
  );


  const serviceWingGeometry =
    new THREE.BoxGeometry(
      2.0,
      0.88,
      1.85,
    );

  const serviceWing =
    new THREE.Mesh(
      serviceWingGeometry,
      wallShadowMaterial,
    );

  serviceWing.position.set(
    2.0,
    0.52,
    -0.25,
  );

  facilityAnchor.add(
    serviceWing,
  );


  const mainRoofGeometry =
    new THREE.BoxGeometry(
      5.08,
      0.09,
      2.82,
    );

  const mainRoof =
    new THREE.Mesh(
      mainRoofGeometry,
      roofMaterial,
    );

  mainRoof.position.set(
    -0.85,
    1.69,
    0,
  );

  facilityAnchor.add(
    mainRoof,
  );


  const leftRoofGeometry =
    new THREE.BoxGeometry(
      2.7,
      0.08,
      2.48,
    );

  const leftRoof =
    new THREE.Mesh(
      leftRoofGeometry,
      redRoofMaterial,
    );

  leftRoof.position.set(
    -4.0,
    1.34,
    -0.05,
  );

  facilityAnchor.add(
    leftRoof,
  );


  /*
   * Corrugated façade hint. A single thin-rib geometry is reused, avoiding
   * expensive unique meshes while giving close Explore views a metal-building
   * identity.
   */
  const ribGeometry =
    new THREE.BoxGeometry(
      0.022,
      1.42,
      0.035,
    );

  const ribMaterial =
    makeMaterial(
      0xb9c0c1,
      materials,
      0.8,
      0.055,
    );

  for (
    let index = 0;
    index < 34;
    index += 1
  ) {
    const rib =
      new THREE.Mesh(
        ribGeometry,
        ribMaterial,
      );

    rib.position.set(
      -3.15 +
        index *
          0.14,
      0.9,
      1.343,
    );

    facilityAnchor.add(
      rib,
    );
  }


  /*
   * Lower windows, industrial door and service openings.
   */
  const windowGeometry =
    new THREE.BoxGeometry(
      0.42,
      0.28,
      0.045,
    );

  [
    -2.55,
    -1.55,
    -0.55,
    0.45,
  ].forEach(
    (
      x,
      index,
    ) => {
      const window =
        new THREE.Mesh(
          windowGeometry,
          openingMaterial,
        );

      window.position.set(
        x,
        0.82 +
          (
            index %
            2
          ) *
            0.05,
        1.35,
      );

      facilityAnchor.add(
        window,
      );
    },
  );


  const doorGeometry =
    new THREE.BoxGeometry(
      0.7,
      0.92,
      0.05,
    );

  const door =
    new THREE.Mesh(
      doorGeometry,
      openingMaterial,
    );

  door.position.set(
    0.9,
    0.56,
    1.35,
  );

  facilityAnchor.add(
    door,
  );


  const shutterGeometry =
    new THREE.BoxGeometry(
      1.0,
      0.92,
      0.055,
    );

  const shutter =
    new THREE.Mesh(
      shutterGeometry,
      wallShadowMaterial,
    );

  shutter.position.set(
    -3.95,
    0.62,
    1.18,
  );

  facilityAnchor.add(
    shutter,
  );


  /*
   * Circular ventilated drum below the moving enclosure.
   */
  const drumMaterial =
    makeMaterial(
      0xd9dddc,
      materials,
      0.56,
      0.055,
    );

  const drumGeometry =
    new THREE.CylinderGeometry(
      1.48,
      1.55,
      0.82,
      72,
    );

  const drum =
    new THREE.Mesh(
      drumGeometry,
      drumMaterial,
    );

  drum.position.set(
    0.5,
    2.12,
    0.02,
  );

  facilityAnchor.add(
    drum,
  );


  const ventMaterial =
    makeMaterial(
      0x343b3e,
      materials,
      0.74,
      0.11,
    );

  const ventGeometry =
    new THREE.BoxGeometry(
      0.30,
      0.38,
      0.28,
    );

  for (
    let index = 0;
    index < 11;
    index += 1
  ) {
    const angle =
      -1.25 +
      index *
        0.25;

    const vent =
      new THREE.Mesh(
        ventGeometry,
        ventMaterial,
      );

    vent.position.set(
      0.5 +
        Math.sin(
          angle,
        ) *
          1.49,
      2.05,
      Math.cos(
        angle,
      ) *
        1.49,
    );

    vent.rotation.y =
      angle;

    facilityAnchor.add(
      vent,
    );
  }


  /*
   * Tall rotating enclosure. The real shell is much taller and more cylindrical
   * than the early hemispherical model.
   */
  const enclosureMaterial =
    makeMaterial(
      0xe1e5e4,
      materials,
      0.39,
      0.085,
    );

  const enclosureGeometry =
    new THREE.CylinderGeometry(
      1.42,
      1.42,
      2.22,
      72,
    );

  const enclosure =
    new THREE.Mesh(
      enclosureGeometry,
      enclosureMaterial,
    );

  enclosure.position.set(
    0.5,
    3.62,
    0.02,
  );

  facilityAnchor.add(
    enclosure,
  );


  const crownGeometry =
    new THREE.SphereGeometry(
      1.42,
      72,
      24,
      0,
      Math.PI *
        2,
      0,
      Math.PI /
        2.7,
    );

  const crown =
    new THREE.Mesh(
      crownGeometry,
      enclosureMaterial,
    );

  crown.scale.y =
    0.36;

  crown.position.set(
    0.5,
    4.73,
    0.02,
  );

  facilityAnchor.add(
    crown,
  );


  const slitMaterial =
    makeMaterial(
      0x20272b,
      materials,
      0.67,
      0.055,
    );

  const slitGeometry =
    new THREE.BoxGeometry(
      0.22,
      2.48,
      0.10,
    );

  const slit =
    new THREE.Mesh(
      slitGeometry,
      slitMaterial,
    );

  slit.position.set(
    0.5,
    3.75,
    1.425,
  );

  facilityAnchor.add(
    slit,
  );


  /*
   * Rear slit/service tower visible in the dusk facility photograph.
   */
  const towerGeometry =
    new THREE.BoxGeometry(
      0.40,
      2.55,
      0.42,
    );

  const serviceTower =
    new THREE.Mesh(
      towerGeometry,
      wallShadowMaterial,
    );

  serviceTower.position.set(
    1.72,
    3.45,
    -0.3,
  );

  facilityAnchor.add(
    serviceTower,
  );


  /*
   * Simplified balcony / guard rails around the drum.
   */
  const railMaterial =
    makeMaterial(
      0x596164,
      materials,
      0.62,
      0.16,
    );

  const railRingGeometry =
    new THREE.TorusGeometry(
      1.62,
      0.025,
      6,
      72,
    );

  const railRing =
    new THREE.Mesh(
      railRingGeometry,
      railMaterial,
    );

  railRing.rotation.x =
    Math.PI /
    2;

  railRing.position.set(
    0.5,
    2.54,
    0.02,
  );

  facilityAnchor.add(
    railRing,
  );


  const railPostGeometry =
    new THREE.CylinderGeometry(
      0.018,
      0.018,
      0.32,
      6,
    );

  for (
    let index = 0;
    index < 16;
    index += 1
  ) {
    const angle =
      (
        index /
        16
      ) *
      Math.PI *
      2;

    const post =
      new THREE.Mesh(
        railPostGeometry,
        railMaterial,
      );

    post.position.set(
      0.5 +
        Math.cos(
          angle,
        ) *
          1.62,
      2.40,
      0.02 +
        Math.sin(
          angle,
        ) *
          1.62,
    );

    facilityAnchor.add(
      post,
    );
  }


  /*
   * Small neighbouring campus/service building from the approach photographs.
   * It makes the site read as an Observatory campus instead of an isolated dome.
   */
  const campusBuildingGeometry =
    new THREE.BoxGeometry(
      2.6,
      1.15,
      1.9,
    );

  const campusBuilding =
    new THREE.Mesh(
      campusBuildingGeometry,
      wallMaterial,
    );

  campusBuilding.position.set(
    -4.9,
    0.68,
    -3.2,
  );

  facilityAnchor.add(
    campusBuilding,
  );


  const campusRoofGeometry =
    new THREE.BoxGeometry(
      2.82,
      0.12,
      2.08,
    );

  const campusRoof =
    new THREE.Mesh(
      campusRoofGeometry,
      roofMaterial,
    );

  campusRoof.position.set(
    -4.9,
    1.32,
    -3.2,
  );

  facilityAnchor.add(
    campusRoof,
  );


  /*
   * Site rocks and exposed ground around the terrace.
   */
  const rockGeometry =
    new THREE.IcosahedronGeometry(
      0.13,
      1,
    );

  const rockMaterial =
    makeMaterial(
      0x69685d,
      materials,
      0.99,
    );

  const rocks =
    new THREE.InstancedMesh(
      rockGeometry,
      rockMaterial,
      72,
    );

  const matrix =
    new THREE.Matrix4();

  const position =
    new THREE.Vector3();

  const scale =
    new THREE.Vector3();

  const rotation =
    new THREE.Quaternion();

  for (
    let index = 0;
    index < 72;
    index += 1
  ) {
    const angle =
      hash(
        index,
        19,
        211,
      ) *
      Math.PI *
      2;

    const radius =
      6.3 +
      hash(
        index,
        23,
        223,
      ) *
        5.6;

    const x =
      Math.cos(
        angle,
      ) *
      radius;

    const z =
      Math.sin(
        angle,
      ) *
        radius +
      0.6;

    const y =
      dotTerrainHeight(
        x,
        z,
      ) +
      0.09;

    const size =
      0.5 +
      hash(
        index,
        29,
        227,
      ) *
        1.35;

    position.set(
      x,
      y,
      z,
    );

    scale.set(
      size,
      0.5 *
        size,
      0.82 *
        size,
    );

    rotation.setFromEuler(
      new THREE.Euler(
        hash(
          index,
          31,
          229,
        ) *
          0.28,
        hash(
          index,
          37,
          233,
        ) *
          Math.PI *
          2,
        hash(
          index,
          41,
          239,
        ) *
          0.22,
      ),
    );

    matrix.compose(
      position,
      rotation,
      scale,
    );

    rocks.setMatrixAt(
      index,
      matrix,
    );
  }

  rocks.instanceMatrix.needsUpdate =
    true;

  group.add(
    rocks,
  );


  disposables.push(
    concreteMaterial,

    retainingGeometry,
    retainingSideGeometry,
    retainingMaterial,

    mainGeometry,
    leftWingGeometry,
    serviceWingGeometry,
    wallMaterial,
    wallShadowMaterial,

    mainRoofGeometry,
    leftRoofGeometry,
    roofMaterial,
    redRoofMaterial,

    ribGeometry,
    ribMaterial,

    windowGeometry,
    doorGeometry,
    shutterGeometry,
    openingMaterial,

    drumGeometry,
    drumMaterial,

    ventGeometry,
    ventMaterial,

    enclosureGeometry,
    crownGeometry,
    enclosureMaterial,

    slitGeometry,
    slitMaterial,

    towerGeometry,

    railRingGeometry,
    railPostGeometry,
    railMaterial,

    campusBuildingGeometry,
    campusRoofGeometry,

    rockGeometry,
    rockMaterial,
  );


  return {
    facilityAnchor,
    materials,
  };
}

function buildHctEnvironment(group: THREE.Group, disposables: Disposable[]): BuildResult {
  const materials: THREE.MeshStandardMaterial[] = [];
  group.add(makeSkyDome(0x255da5, 0xa6bfd7, disposables));

  const ground = makeTerrain(
    {
      color: 0x756653,
      height: (x, z) => {
        const distance = Math.hypot(x, z);
        const plateau = 1 - THREE.MathUtils.smoothstep(distance, 4, 10);
        return fbm(x, z, 5.3) * 0.72 * (1 - plateau * 0.78) +
          Math.max(0, (distance - 20) * 0.045);
      },
    },
    disposables,
    materials,
  );
  group.add(ground);

  const ridgeSpecs = [
    { seed: 51, width: 78, depth: 15, height: 7, baseY: -1.2, z: -24, color: 0x65584b },
    { seed: 63, width: 86, depth: 17, height: 10.5, baseY: -1.8, z: -34, color: 0x71645a },
    { seed: 79, width: 92, depth: 18, height: 13.5, baseY: -2.4, z: -45, color: 0x817b78 },
  ];
  ridgeSpecs.forEach((spec) => group.add(makeRidge(spec, disposables, materials)));

  group.add(makeRoad([
    new THREE.Vector3(-13, 0.12, 16),
    new THREE.Vector3(-9, 0.1, 12),
    new THREE.Vector3(-5, 0.12, 8),
    new THREE.Vector3(-2, 0.12, 5),
    new THREE.Vector3(-0.7, 0.15, 2.8),
  ], disposables, materials, 0.25));

  const rockGeometry = new THREE.IcosahedronGeometry(0.18, 1);
  const rockMaterial = makeMaterial(0x51483e, materials, 0.98);
  const rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, 180);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();

  for (let index = 0; index < 180; index += 1) {
    const angle = hash(index, 8, 91) * Math.PI * 2;
    const radius = 5 + hash(index, 4, 99) * 28;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = fbm(x, z, 5.3) * 0.7;
    const s = 0.45 + hash(index, 12, 103) * 1.6;

    position.set(x, y + 0.08 * s, z);
    quaternion.setFromEuler(new THREE.Euler(
      hash(index, 2, 107),
      hash(index, 3, 109) * Math.PI * 2,
      hash(index, 5, 113),
    ));
    scale.set(s, 0.7 * s, s);
    matrix.compose(position, quaternion, scale);
    rocks.setMatrixAt(index, matrix);
  }

  rocks.instanceMatrix.needsUpdate = true;
  group.add(rocks);

  const facilityAnchor = new THREE.Group();
  facilityAnchor.name = "astra-hct-facility";
  facilityAnchor.position.set(0, 0.15, 0);
  group.add(facilityAnchor);

  const compoundGeometry = new THREE.BoxGeometry(3.4, 0.18, 2.8);
  const compoundMaterial = makeMaterial(0x8b867a, materials, 0.9);
  const compound = new THREE.Mesh(compoundGeometry, compoundMaterial);
  compound.position.y = 0.09;
  facilityAnchor.add(compound);

  const wallMaterial = makeMaterial(0xe3e1d9, materials, 0.62, 0.03);
  const buildingGeometry = new THREE.BoxGeometry(1.35, 0.65, 1.1);
  const building = new THREE.Mesh(buildingGeometry, wallMaterial);
  building.position.set(0, 0.5, 0);
  facilityAnchor.add(building);

  const domeBaseGeometry = new THREE.CylinderGeometry(0.72, 0.74, 0.32, 48);
  const domeBase = new THREE.Mesh(domeBaseGeometry, wallMaterial);
  domeBase.position.y = 0.98;
  facilityAnchor.add(domeBase);

  const domeGeometry = new THREE.SphereGeometry(0.73, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeometry, wallMaterial);
  dome.position.y = 1.14;
  facilityAnchor.add(dome);

  const sideGeometry = new THREE.BoxGeometry(0.75, 0.46, 0.9);
  const sideBuilding = new THREE.Mesh(sideGeometry, wallMaterial);
  sideBuilding.position.set(1.05, 0.34, 0.15);
  facilityAnchor.add(sideBuilding);

  disposables.push(
    rockGeometry, rockMaterial, compoundGeometry, compoundMaterial,
    buildingGeometry, wallMaterial, domeBaseGeometry, domeGeometry, sideGeometry,
  );

  return { facilityAnchor, materials };
}

function createDishAssembly(
  materials: THREE.MeshStandardMaterial[],
  disposables: Disposable[],
) {
  const root = new THREE.Group();
  const concreteMaterial = makeMaterial(0x9b9b94, materials, 0.82, 0.05);
  const steelMaterial = makeMaterial(0xd0d0ca, materials, 0.58, 0.22);
  const darkSteelMaterial = makeMaterial(0x42484b, materials, 0.68, 0.28);

  const baseGeometry = new THREE.CylinderGeometry(0.19, 0.28, 0.34, 12);
  const base = new THREE.Mesh(baseGeometry, concreteMaterial);
  base.position.y = 0.17;
  root.add(base);

  const mastGeometry = new THREE.CylinderGeometry(0.07, 0.1, 0.7, 10);
  const mast = new THREE.Mesh(mastGeometry, steelMaterial);
  mast.position.y = 0.67;
  root.add(mast);

  const yoke = new THREE.Group();
  yoke.position.y = 1.03;
  root.add(yoke);

  const yokeBarGeometry = new THREE.BoxGeometry(0.75, 0.08, 0.08);
  yoke.add(new THREE.Mesh(yokeBarGeometry, darkSteelMaterial));

  const armGeometry = new THREE.BoxGeometry(0.08, 0.42, 0.08);
  const leftArm = new THREE.Mesh(armGeometry, darkSteelMaterial);
  leftArm.position.set(-0.33, 0.18, 0);
  const rightArm = leftArm.clone();
  rightArm.position.x = 0.33;
  yoke.add(leftArm, rightArm);

  const reflectorGroup = new THREE.Group();
  reflectorGroup.position.y = 0.32;
  reflectorGroup.rotation.x = -0.78;
  yoke.add(reflectorGroup);

  const reflectorGeometry = new THREE.SphereGeometry(0.72, 32, 14, 0, Math.PI * 2, 0, Math.PI / 3.4);
  const reflector = new THREE.Mesh(reflectorGeometry, steelMaterial);
  reflector.scale.y = 0.48;
  reflectorGroup.add(reflector);

  const rimGeometry = new THREE.TorusGeometry(0.62, 0.025, 6, 32);
  const rim = new THREE.Mesh(rimGeometry, darkSteelMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.z = 0.22;
  reflectorGroup.add(rim);

  const feedGeometry = new THREE.CylinderGeometry(0.028, 0.028, 0.62, 8);
  const feed = new THREE.Mesh(feedGeometry, darkSteelMaterial);
  feed.rotation.x = Math.PI / 2;
  feed.position.set(0, 0.02, 0.42);
  reflectorGroup.add(feed);

  disposables.push(
    baseGeometry, concreteMaterial, mastGeometry, steelMaterial,
    yokeBarGeometry, darkSteelMaterial, armGeometry,
    reflectorGeometry, rimGeometry, feedGeometry,
  );

  return root;
}

function buildUgmrtEnvironment(group: THREE.Group, disposables: Disposable[]): BuildResult {
  const materials: THREE.MeshStandardMaterial[] = [];
  group.add(makeSkyDome(0x4d83bd, 0xd6d4bb, disposables));

  const ground = makeTerrain(
    { color: 0x6b704b, height: (x, z) => fbm(x, z, 8.7) * 0.34 },
    disposables,
    materials,
  );
  group.add(ground);

  const fieldGeometry = new THREE.PlaneGeometry(6, 4);
  fieldGeometry.rotateX(-Math.PI / 2);
  const fieldMaterials = [
    makeMaterial(0x77764d, materials, 0.98),
    makeMaterial(0x6a7144, materials, 0.98),
    makeMaterial(0x8a794c, materials, 0.98),
  ];

  for (let index = 0; index < 22; index += 1) {
    const field = new THREE.Mesh(fieldGeometry, fieldMaterials[index % fieldMaterials.length]);
    field.position.set(-27 + (index % 6) * 10.5, 0.05, -24 + Math.floor(index / 6) * 12);
    field.rotation.y = (index % 3) * 0.11;
    group.add(field);
  }

  const roadMaterial = makeMaterial(0x4e514b, materials, 0.95);
  const roadGeometry = new THREE.PlaneGeometry(52, 0.55);
  roadGeometry.rotateX(-Math.PI / 2);
  const armAngles = [
    Math.PI / 2,
    Math.PI / 2 + (Math.PI * 2) / 3,
    Math.PI / 2 + (Math.PI * 4) / 3,
  ];

  for (const angle of armAngles) {
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.position.y = 0.09;
    road.rotation.y = -angle;
    group.add(road);
  }

  const facilityAnchor = new THREE.Group();
  facilityAnchor.name = "astra-ugmrt-array";
  group.add(facilityAnchor);

  const antennaMaster = createDishAssembly(materials, disposables);
  const positions: THREE.Vector3[] = [];

  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    const ring = index < 4 ? 2.2 : index < 8 ? 4.2 : 6.1;
    positions.push(new THREE.Vector3(Math.cos(angle) * ring, 0, Math.sin(angle) * ring));
  }

  for (const armAngle of armAngles) {
    for (let step = 1; step <= 6; step += 1) {
      const distance = 7.5 + step * 3.7;
      positions.push(new THREE.Vector3(
        Math.cos(armAngle) * distance,
        0,
        Math.sin(armAngle) * distance,
      ));
    }
  }

  positions.forEach((position, index) => {
    const antenna = antennaMaster.clone(true);
    antenna.name = `ugmrt-antenna-${index + 1}`;
    antenna.position.copy(position);
    antenna.position.y = 0.14 + fbm(position.x, position.z, 8.7) * 0.34;
    antenna.rotation.y = (hash(index, 5, 151) - 0.5) * 0.32;
    facilityAnchor.add(antenna);
  });

  const shrubGeometry = new THREE.IcosahedronGeometry(0.18, 1);
  const shrubMaterial = makeMaterial(0x30452d, materials, 0.96);
  const shrubs = new THREE.InstancedMesh(shrubGeometry, shrubMaterial, 230);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();

  for (let index = 0; index < 230; index += 1) {
    const x = (hash(index, 3, 171) - 0.5) * 64;
    const z = (hash(index, 8, 179) - 0.5) * 64;
    const y = fbm(x, z, 8.7) * 0.34 + 0.18;
    const s = 0.45 + hash(index, 11, 181) * 1.15;
    position.set(x, y, z);
    scale.set(s, 0.7 * s, s);
    matrix.compose(position, new THREE.Quaternion(), scale);
    shrubs.setMatrixAt(index, matrix);
  }

  shrubs.instanceMatrix.needsUpdate = true;
  group.add(shrubs);

  disposables.push(fieldGeometry, ...fieldMaterials, roadMaterial, roadGeometry, shrubGeometry, shrubMaterial);
  return { facilityAnchor, materials };
}

function getLighting(phase: ObservatoryLightingPhase) {
  switch (phase) {
    case "day":
      return { key: new THREE.Color(0xfff4df), intensity: 2.6, hemisphere: 1.3, emissive: 0 };
    case "golden-hour":
      return { key: new THREE.Color(0xffba76), intensity: 2.1, hemisphere: 0.95, emissive: 0.015 };
    case "sunset":
      return { key: new THREE.Color(0xff845d), intensity: 1.55, hemisphere: 0.72, emissive: 0.025 };
    case "twilight":
      return { key: new THREE.Color(0x8ca7ff), intensity: 0.9, hemisphere: 0.6, emissive: 0.035 };
    case "blue-hour":
      return { key: new THREE.Color(0x6c8cff), intensity: 0.62, hemisphere: 0.48, emissive: 0.045 };
    case "night":
      return { key: new THREE.Color(0x5065a9), intensity: 0.28, hemisphere: 0.26, emissive: 0.065 };
  }
}

export function createObservatoryEnvironmentSystem({
  scene,
  observatoryId,
}: ObservatoryEnvironmentSystemOptions): ObservatoryEnvironmentSystem {
  const group = new THREE.Group();
  group.name = `astra-environment-${observatoryId}`;
  group.visible = false;
  group.position.set(0, -50, 0);
  scene.add(group);

  const disposables: Disposable[] = [];
  let result: BuildResult;

  switch (observatoryId) {
    case "dot":
      result = buildDotEnvironment(group, disposables);
      break;
    case "hct":
      result = buildHctEnvironment(group, disposables);
      break;
    case "ugmrt":
      result = buildUgmrtEnvironment(group, disposables);
      break;
  }

  const hemisphere = new THREE.HemisphereLight(0xbfd6ff, 0x332b22, 1.3);
  group.add(hemisphere);

  const keyLight = new THREE.DirectionalLight(0xfff4df, 2.6);
  keyLight.position.set(
    observatoryId === "dot" ? -11 : -8,
    observatoryId === "dot" ? 15 : 13,
    observatoryId === "dot" ? 11 : 9,
  );
  group.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9ebdff, 0.45);
  fillLight.position.set(
    observatoryId === "dot" ? 12 : 10,
    observatoryId === "dot" ? 7 : 6,
    observatoryId === "dot" ? -10 : -8,
  );
  group.add(fillLight);

  let disposed = false;

  const applyLighting = (phase: ObservatoryLightingPhase) => {
    const lighting = getLighting(phase);
    keyLight.color.copy(lighting.key);
    keyLight.intensity = lighting.intensity;
    hemisphere.intensity = lighting.hemisphere;
    fillLight.intensity = Math.max(0.18, lighting.hemisphere * 0.34);

    for (const material of result.materials) {
      material.emissive.copy(lighting.key);
      material.emissiveIntensity = lighting.emissive;
    }
  };

  applyLighting("day");

  return {
    observatoryId,
    group,
    facilityAnchor: result.facilityAnchor,

    setVisible(visible) {
      if (disposed) return;
      group.visible = visible;
    },

    setLightingPhase(phase) {
      if (disposed) return;
      applyLighting(phase);
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(group);
      group.clear();

      for (const item of new Set(disposables)) {
        item.dispose();
      }

      disposables.length = 0;
    },
  };
}
