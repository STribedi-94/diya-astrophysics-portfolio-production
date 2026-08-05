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

export function createObservatorySystem(options: {
  earthGroup: THREE.Group;
  nodes: NetworkNode[];
  disposables: Array<{ dispose(): void }>;
}): ObservatorySystem {
  const { earthGroup, nodes, disposables } = options;

  const markers: ObservatoryMarker[] = [];

  const coreGeometry = new THREE.SphereGeometry(0.022, 16, 12);
  const haloGeometry = new THREE.RingGeometry(0.035, 0.055, 24);
  const beaconGeometry = new THREE.CylinderGeometry(
    0.0035,
    0.0035,
    0.11,
    6,
  );

  disposables.push(coreGeometry, haloGeometry, beaconGeometry);

  for (const node of nodes) {
    const position = latLonToVec3(
      node.lat!,
      node.lon!,
      EARTH_RADIUS,
    );

    const group = new THREE.Group();

    group.position.copy(position);
    group.lookAt(position.clone().multiplyScalar(2));

    const color = new THREE.Color(node.color);

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

    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.z = 0.03;

    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.z = 0.004;

    const beacon = new THREE.Mesh(
      beaconGeometry,
      beaconMaterial,
    );

    beacon.rotation.x = Math.PI / 2;
    beacon.position.z = 0.055;

    group.add(core);
    group.add(halo);
    group.add(beacon);

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