import * as THREE from "three";
import type { NetworkNode } from "@/data/observatory-network";
import { EARTH_RADIUS } from "./earth-system";

export type ObservatoryMarker = {
  node: NetworkNode;
  group: THREE.Group;
  core: THREE.Mesh;
  halo: THREE.Mesh;
  beacon: THREE.Mesh;
};

export type ObservatorySystem = {
  markers: ObservatoryMarker[];
  dispose(): void;
};

export type ObservatoryFocusPose = {
  distance: number;
  azimuth: number;
  polar: number;
  target: THREE.Vector3;
};

const OBSERVATORY_FOCUS_DISTANCE = 2.55;
const OBSERVATORY_FOCUS_TARGET_RADIUS = EARTH_RADIUS * 0.28;

export function latLonToVec3(
  lat: number,
  lon: number,
  radius = EARTH_RADIUS,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Creates a guided camera pose for a ground observatory.
 *
 * The marker's world-space direction determines the camera orbit
 * angles, so this remains correct even while Earth has rotated.
 *
 * The camera target is biased slightly toward the selected
 * observatory rather than targeting the Earth's exact centre.
 * This keeps the planet visible while giving the selected
 * facility a cinematic off-centre emphasis.
 */
export function createObservatoryFocusPose(
  marker: ObservatoryMarker,
): ObservatoryFocusPose {
  const worldPosition = marker.group.getWorldPosition(
    new THREE.Vector3(),
  );

  const radialDirection = worldPosition
    .clone()
    .normalize();

  const azimuth = Math.atan2(
    radialDirection.x,
    radialDirection.z,
  );

  const polar = Math.acos(
    THREE.MathUtils.clamp(
      radialDirection.y,
      -1,
      1,
    ),
  );

  const target = radialDirection.multiplyScalar(
    OBSERVATORY_FOCUS_TARGET_RADIUS,
  );

  return {
    distance: OBSERVATORY_FOCUS_DISTANCE,
    azimuth,
    polar,
    target,
  };
}

export function createObservatorySystem(options: {
  earthGroup: THREE.Group;
  nodes: NetworkNode[];
  disposables: Array<{ dispose(): void }>;
}): ObservatorySystem {
  const { earthGroup, nodes, disposables } = options;

  const markers: ObservatoryMarker[] = [];

  const coreGeometry = new THREE.SphereGeometry(
    0.022,
    16,
    12,
  );

  const haloGeometry = new THREE.RingGeometry(
    0.035,
    0.055,
    24,
  );

  const beaconGeometry = new THREE.CylinderGeometry(
    0.0035,
    0.0035,
    0.11,
    6,
  );

  disposables.push(
    coreGeometry,
    haloGeometry,
    beaconGeometry,
  );

  for (const node of nodes) {
    const position = latLonToVec3(
      node.lat!,
      node.lon!,
      EARTH_RADIUS,
    );

    const group = new THREE.Group();

    group.position.copy(position);

    group.lookAt(
      position.clone().multiplyScalar(2),
    );

    const color = new THREE.Color(
      node.color,
    );

    const coreMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
    });

    const haloMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const beaconMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
    });

    const core = new THREE.Mesh(
      coreGeometry,
      coreMaterial,
    );

    core.position.z = 0.03;

    const halo = new THREE.Mesh(
      haloGeometry,
      haloMaterial,
    );

    halo.position.z = 0.004;

    const beacon = new THREE.Mesh(
      beaconGeometry,
      beaconMaterial,
    );

    beacon.rotation.x = Math.PI / 2;
    beacon.position.z = 0.055;

    group.add(
      core,
      halo,
      beacon,
    );

    earthGroup.add(group);

    disposables.push(
      coreMaterial,
      haloMaterial,
      beaconMaterial,
    );

    markers.push({
      node,
      group,
      core,
      halo,
      beacon,
    });
  }

  return {
    markers,

    dispose() {
      markers.length = 0;
    },
  };
}