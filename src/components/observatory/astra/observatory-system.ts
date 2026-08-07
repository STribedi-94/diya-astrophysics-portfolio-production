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

/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Ground Observatory Geographic System
 * ------------------------------------------------------------------
 *
 * IMPORTANT SCIENTIFIC / PRESENTATION SEPARATION
 *
 * Authoritative geographic coordinates always remain those stored in:
 *
 *   src/data/observatory-network.ts
 *
 * Those original latitude / longitude values continue to control:
 *
 * - scientific facility identity;
 * - displayed coordinate text;
 * - guided Observatory camera focus;
 * - geographic interpretation.
 *
 * A very small longitude offset is applied ONLY to the visible
 * marker group for presentation/readability on the cinematic globe.
 *
 * The underlying scientific coordinates are never modified.
 */

/*
 * ------------------------------------------------------------------
 * PRECISION OBSERVATORY FOCUS
 * ------------------------------------------------------------------
 */

const OBSERVATORY_FOCUS_DISTANCE =
  1.72;

const OBSERVATORY_FOCUS_TARGET_RADIUS =
  EARTH_RADIUS * 0.72;

/*
 * ------------------------------------------------------------------
 * DISPLAY-ONLY MARKER OFFSETS
 * ------------------------------------------------------------------
 *
 * The NASA globe texture has no political/state boundaries and the
 * Himalaya/Tibetan plateau is visually continuous.
 *
 * At the scale used by Project Astra, the mathematically exact marker
 * positions can therefore look unintuitive to a casual visitor.
 *
 * These offsets are deliberately small and affect ONLY the rendered
 * marker position.
 *
 * Scientific focus continues to use the original real coordinates.
 *
 * Negative longitude offset = slight westward presentation shift.
 */

const OBSERVATORY_VISUAL_LONGITUDE_OFFSET:
  Readonly<Record<string, number>> =
  Object.freeze({
    /*
     * uGMRT:
     * Real longitude: 74.0497° E
     *
     * Small westward visual adjustment makes the marker read more
     * naturally as western Maharashtra in the cinematic India view.
     */
    ugmrt: -3.0,

    /*
     * HCT:
     * Real longitude: 78.9642° E
     *
     * Slight westward presentation adjustment only.
     */
    hct: -5.2,

    /*
     * DOT:
     * Real longitude: 79.6841° E
     *
     * Slight westward presentation adjustment only.
     */
    dot: -5.0,
  });

function getVisualLongitude(
  node: NetworkNode,
) {
  if (
    node.lon == null
  ) {
    return null;
  }

  return (
    node.lon +
    (
      OBSERVATORY_VISUAL_LONGITUDE_OFFSET[
        node.id
      ] ??
      0
    )
  );
}

/*
 * ------------------------------------------------------------------
 * GEOGRAPHIC MARKER PRESENTATION
 * ------------------------------------------------------------------
 */

const CORE_SURFACE_LIFT =
  0.012;

const HALO_SURFACE_LIFT =
  0.008;

const BEACON_SURFACE_LIFT =
  0.027;

const CORE_RADIUS =
  0.012;

const HALO_INNER_RADIUS =
  0.019;

const HALO_OUTER_RADIUS =
  0.029;

const BEACON_RADIUS =
  0.0023;

const BEACON_HEIGHT =
  0.050;

const LOCAL_FORWARD =
  new THREE.Vector3(
    0,
    0,
    1,
  );

/*
 * ------------------------------------------------------------------
 * GEOGRAPHIC CONVERSION
 * ------------------------------------------------------------------
 *
 * Standard geographical convention:
 *
 * + latitude  = north
 * - latitude  = south
 *
 * + longitude = east
 * - longitude = west
 *
 * This function itself applies NO visual correction.
 *
 * Any display-only offset is supplied explicitly by the caller.
 */
export function latLonToVec3(
  lat: number,
  lon: number,
  radius = EARTH_RADIUS,
): THREE.Vector3 {
  const latitude =
    THREE.MathUtils.degToRad(
      lat,
    );

  const longitude =
    THREE.MathUtils.degToRad(
      lon,
    );

  const cosLatitude =
    Math.cos(
      latitude,
    );

  return new THREE.Vector3(
    radius *
      cosLatitude *
      Math.cos(
        longitude,
      ),

    radius *
      Math.sin(
        latitude,
      ),

    -radius *
      cosLatitude *
      Math.sin(
        longitude,
      ),
  );
}

/*
 * ------------------------------------------------------------------
 * TRUE SCIENTIFIC WORLD POSITION
 * ------------------------------------------------------------------
 *
 * The visible marker may be presentation-shifted.
 *
 * Therefore guided Observatory focus must NOT use marker.group's
 * displayed world position.
 *
 * Instead:
 *
 * 1. rebuild the exact local Earth coordinate from node.lat/node.lon;
 * 2. transform that exact coordinate through the current earthGroup
 *    matrixWorld;
 * 3. use that true world-space position for the camera.
 */

function getTrueObservatoryWorldPosition(
  marker: ObservatoryMarker,
) {
  const {
    lat,
    lon,
  } = marker.node;

  if (
    lat == null ||
    lon == null
  ) {
    /*
     * Defensive fallback only.
     *
     * Ground nodes in the current registry always contain coordinates.
     */
    return marker.group.getWorldPosition(
      new THREE.Vector3(),
    );
  }

  const exactLocalPosition =
    latLonToVec3(
      lat,
      lon,
      EARTH_RADIUS,
    );

  const parent =
    marker.group.parent;

  if (!parent) {
    return exactLocalPosition;
  }

  /*
   * Ensure current Earth rotation is represented in matrixWorld.
   */
  parent.updateWorldMatrix(
    true,
    false,
  );

  return parent.localToWorld(
    exactLocalPosition.clone(),
  );
}

/*
 * ------------------------------------------------------------------
 * GUIDED OBSERVATORY FOCUS
 * ------------------------------------------------------------------
 */

/**
 * Creates the precision camera pose from the REAL observatory
 * latitude / longitude.
 *
 * This remains scientifically exact even though the visible marker
 * receives a small presentation-only longitude offset.
 */
export function createObservatoryFocusPose(
  marker: ObservatoryMarker,
): ObservatoryFocusPose {
  const worldPosition =
    getTrueObservatoryWorldPosition(
      marker,
    );

  const radialDirection =
    worldPosition
      .clone()
      .normalize();

  const azimuth =
    Math.atan2(
      radialDirection.x,
      radialDirection.z,
    );

  const polar =
    Math.acos(
      THREE.MathUtils.clamp(
        radialDirection.y,
        -1,
        1,
      ),
    );

  const target =
    radialDirection
      .clone()
      .multiplyScalar(
        OBSERVATORY_FOCUS_TARGET_RADIUS,
      );

  return {
    distance:
      OBSERVATORY_FOCUS_DISTANCE,

    azimuth,

    polar,

    target,
  };
}

/*
 * ------------------------------------------------------------------
 * OBSERVATORY SYSTEM
 * ------------------------------------------------------------------
 */

export function createObservatorySystem(
  options: {
    earthGroup: THREE.Group;

    nodes: NetworkNode[];

    disposables: Array<{
      dispose(): void;
    }>;
  },
): ObservatorySystem {
  const {
    earthGroup,
    nodes,
    disposables,
  } = options;

  const markers:
    ObservatoryMarker[] = [];

  const coreGeometry =
    new THREE.SphereGeometry(
      CORE_RADIUS,
      18,
      14,
    );

  const haloGeometry =
    new THREE.RingGeometry(
      HALO_INNER_RADIUS,
      HALO_OUTER_RADIUS,
      28,
    );

  const beaconGeometry =
    new THREE.CylinderGeometry(
      BEACON_RADIUS,
      BEACON_RADIUS,
      BEACON_HEIGHT,
      8,
    );

  disposables.push(
    coreGeometry,
    haloGeometry,
    beaconGeometry,
  );

  for (
    const node of nodes
  ) {
    if (
      node.lat == null ||
      node.lon == null
    ) {
      continue;
    }

    /*
     * --------------------------------------------------------------
     * TRUE SCIENTIFIC POSITION
     * --------------------------------------------------------------
     *
     * Kept available conceptually as the authoritative coordinate.
     *
     * This exact lat/lon is also independently reconstructed by
     * createObservatoryFocusPose().
     */
    const truePosition =
      latLonToVec3(
        node.lat,
        node.lon,
        EARTH_RADIUS,
      );

    /*
     * --------------------------------------------------------------
     * VISUAL MARKER POSITION
     * --------------------------------------------------------------
     *
     * Latitude remains unchanged.
     *
     * Longitude receives only the small display-only offset defined
     * above.
     */
    const visualLongitude =
      getVisualLongitude(
        node,
      ) ??
      node.lon;

    const visualPosition =
      latLonToVec3(
        node.lat,
        visualLongitude,
        EARTH_RADIUS,
      );

    const visualRadialDirection =
      visualPosition
        .clone()
        .normalize();

    const group =
      new THREE.Group();

    group.name =
      `astra-observatory-${node.id}`;

    /*
     * Visible marker uses the presentation position.
     */
    group.position.copy(
      visualPosition,
    );

    /*
     * Local +Z points outward from the visual marker's current
     * presentation position.
     */
    group.quaternion
      .setFromUnitVectors(
        LOCAL_FORWARD,
        visualRadialDirection,
      );

    /*
     * Preserve the exact position in userData for debugging and
     * future scientific tooling.
     *
     * Nothing in the current public scene depends on these values.
     */
    group.userData.trueLatitude =
      node.lat;

    group.userData.trueLongitude =
      node.lon;

    group.userData.visualLongitude =
      visualLongitude;

    group.userData.trueLocalPosition =
      truePosition.clone();

    const color =
      new THREE.Color(
        node.color,
      );

    /*
     * --------------------------------------------------------------
     * MATERIALS
     * --------------------------------------------------------------
     */

    const coreMaterial =
      new THREE.MeshBasicMaterial(
        {
          color,

          transparent:
            true,

          opacity:
            0,

          depthTest:
            true,

          depthWrite:
            false,

          toneMapped:
            false,
        },
      );

    const haloMaterial =
      new THREE.MeshBasicMaterial(
        {
          color,

          transparent:
            true,

          opacity:
            0,

          side:
            THREE.DoubleSide,

          depthTest:
            true,

          depthWrite:
            false,

          toneMapped:
            false,
        },
      );

    const beaconMaterial =
      new THREE.MeshBasicMaterial(
        {
          color,

          transparent:
            true,

          opacity:
            0,

          depthTest:
            true,

          depthWrite:
            false,

          toneMapped:
            false,
        },
      );

    /*
     * --------------------------------------------------------------
     * CORE
     * --------------------------------------------------------------
     */

    const core =
      new THREE.Mesh(
        coreGeometry,
        coreMaterial,
      );

    core.name =
      `${node.id}-geographic-core`;

    core.position.set(
      0,
      0,
      CORE_SURFACE_LIFT,
    );

    /*
     * --------------------------------------------------------------
     * HALO
     * --------------------------------------------------------------
     */

    const halo =
      new THREE.Mesh(
        haloGeometry,
        haloMaterial,
      );

    halo.name =
      `${node.id}-geographic-halo`;

    halo.position.set(
      0,
      0,
      HALO_SURFACE_LIFT,
    );

    /*
     * --------------------------------------------------------------
     * BEACON
     * --------------------------------------------------------------
     */

    const beacon =
      new THREE.Mesh(
        beaconGeometry,
        beaconMaterial,
      );

    beacon.name =
      `${node.id}-geographic-beacon`;

    beacon.rotation.x =
      Math.PI / 2;

    beacon.position.set(
      0,
      0,
      BEACON_SURFACE_LIFT,
    );

    halo.renderOrder =
      4;

    beacon.renderOrder =
      5;

    core.renderOrder =
      6;

    group.add(
      halo,
      beacon,
      core,
    );

    /*
     * Markers remain children of Earth so all visual markers continue
     * to follow:
     *
     * - automatic Earth rotation;
     * - manual Rotate Earth;
     * - Restore;
     * - opening orientation.
     */
    earthGroup.add(
      group,
    );

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
      for (
        const marker of markers
      ) {
        marker.group.remove(
          marker.core,
          marker.halo,
          marker.beacon,
        );

        earthGroup.remove(
          marker.group,
        );
      }

      markers.length =
        0;
    },
  };
}