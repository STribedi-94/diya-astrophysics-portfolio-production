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

function addTreeClusters(
  group: THREE.Group,
  disposables: Disposable[],
  materials: THREE.MeshStandardMaterial[],
  seed: number,
  count: number,
) {
  const trunkGeometry = new THREE.CylinderGeometry(0.035, 0.05, 0.42, 5);
  const crownGeometry = new THREE.ConeGeometry(0.22, 0.8, 8);
  const trunkMaterial = makeMaterial(0x4d3826, materials, 0.95);
  const crownMaterial = makeMaterial(0x173a25, materials, 0.97);
  const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, count);
  const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, count);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  const rotation = new THREE.Quaternion();

  for (let index = 0; index < count; index += 1) {
    const angle = hash(index, 3, seed) * Math.PI * 2;
    const radius = 5 + Math.pow(hash(index, 7, seed + 9), 0.72) * 24;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius + 3;
    const groundY = fbm(x, z, 2.8) * 1.2 + Math.max(0, (radius - 12) * 0.025);
    const size = 0.62 + hash(index, 11, seed + 2) * 1.18;

    position.set(x, groundY + 0.21 * size, z);
    scale.set(size, size, size);
    rotation.setFromEuler(new THREE.Euler(0, hash(index, 13, seed + 5) * Math.PI * 2, 0));
    matrix.compose(position, rotation, scale);
    trunks.setMatrixAt(index, matrix);

    position.y += 0.53 * size;
    matrix.compose(position, rotation, scale);
    crowns.setMatrixAt(index, matrix);
  }

  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  group.add(trunks, crowns);
  disposables.push(trunkGeometry, crownGeometry, trunkMaterial, crownMaterial);
}

function buildDotEnvironment(group: THREE.Group, disposables: Disposable[]): BuildResult {
  const materials: THREE.MeshStandardMaterial[] = [];
  group.add(makeSkyDome(0x5d8fc8, 0xc5d8d3, disposables));

  const ground = makeTerrain(
    {
      color: 0x314333,
      height: (x, z) => {
        const distance = Math.hypot(x, z);
        const centralFlatten = 1 - THREE.MathUtils.smoothstep(distance, 2.5, 6);
        return fbm(x, z, 2.8) * 1.35 * (1 - centralFlatten * 0.85) +
          Math.max(0, (distance - 18) * 0.035);
      },
    },
    disposables,
    materials,
  );
  group.add(ground);

  const ridgeSpecs = [
    { seed: 11, width: 72, depth: 13, height: 7.8, baseY: -0.9, z: -22, color: 0x263b31 },
    { seed: 19, width: 78, depth: 14, height: 10.4, baseY: -1.3, z: -30, color: 0x30433b },
    { seed: 31, width: 82, depth: 16, height: 12.2, baseY: -2.2, z: -39, color: 0x455653 },
  ];
  ridgeSpecs.forEach((spec) => group.add(makeRidge(spec, disposables, materials)));
  addTreeClusters(group, disposables, materials, 41, 760);

  group.add(makeRoad([
    new THREE.Vector3(11, 0.18, 19),
    new THREE.Vector3(7, 0.16, 13),
    new THREE.Vector3(4, 0.16, 8),
    new THREE.Vector3(1.6, 0.15, 4.5),
    new THREE.Vector3(0.8, 0.16, 2.3),
  ], disposables, materials, 0.22));

  const facilityAnchor = new THREE.Group();
  facilityAnchor.name = "astra-dot-facility";
  facilityAnchor.position.set(0, 0.15, 0);
  group.add(facilityAnchor);

  const platformGeometry = new THREE.CylinderGeometry(1.25, 1.35, 0.22, 48);
  const platformMaterial = makeMaterial(0x7b7c74, materials, 0.88);
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.y = 0.11;
  facilityAnchor.add(platform);

  const wallMaterial = makeMaterial(0xd9dad6, materials, 0.55, 0.04);
  const lowerGeometry = new THREE.CylinderGeometry(0.76, 0.83, 0.86, 48);
  const lower = new THREE.Mesh(lowerGeometry, wallMaterial);
  lower.position.y = 0.65;
  facilityAnchor.add(lower);

  const drumGeometry = new THREE.CylinderGeometry(0.7, 0.76, 0.42, 48);
  const drum = new THREE.Mesh(drumGeometry, wallMaterial);
  drum.position.y = 1.27;
  facilityAnchor.add(drum);

  const domeGeometry = new THREE.SphereGeometry(0.72, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeometry, wallMaterial);
  dome.position.y = 1.48;
  facilityAnchor.add(dome);

  const slitGeometry = new THREE.BoxGeometry(0.18, 0.86, 0.08);
  const slitMaterial = makeMaterial(0x151a1e, materials, 0.7);
  const slit = new THREE.Mesh(slitGeometry, slitMaterial);
  slit.position.set(0, 1.64, 0.64);
  facilityAnchor.add(slit);

  disposables.push(
    platformGeometry, platformMaterial, lowerGeometry, wallMaterial,
    drumGeometry, domeGeometry, slitGeometry, slitMaterial,
  );

  return { facilityAnchor, materials };
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
  keyLight.position.set(-8, 13, 9);
  group.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9ebdff, 0.45);
  fillLight.position.set(10, 6, -8);
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
