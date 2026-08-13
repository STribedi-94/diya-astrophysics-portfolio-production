import * as THREE from "three";

import type {
  GroundObservatoryId,
} from "./observatory-registry";


/*
 * ==================================================================
 * PROJECT DIYA ASTRA
 * Accepted-GLB Observatory Destination Camera Contract
 * FINAL CINEMATIC ARRIVAL CALIBRATION
 * ==================================================================
 *
 * The accepted DOT / HCT / uGMRT GLBs are normalized by
 * observatory-environment-system.ts so their measured focal target becomes
 * LOCAL (0, 0, 0).
 *
 * These poses are therefore stable local-space camera poses,
 * not raw Blender coordinates and not the old procedural-world coordinates.
 *
 * Earth-space descent remains owned by GlobeScene + scene handoff.
 *
 * IMPORTANT RUNTIME CONTRACT
 * --------------------------
 * The current Observatory entry handoff terminates at "approach".
 *
 * Therefore:
 *
 * regionalHigh
 *   → terrainAcquire
 *   → establishing
 *   → approach
 *
 * is the currently active Earth-to-Observatory cinematic route.
 *
 * "approach" is consequently the authoritative settled arrival pose.
 *
 * facility / science remain retained for future extended local cinematic
 * choreography, but they are not currently used as the terminal arrival.
 */

export type ObservatoryDestinationCameraPose = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
};


export type ObservatoryDestinationStage =
  | "regionalHigh"
  | "terrainAcquire"
  | "establishing"
  | "approach"
  | "facility"
  | "science";


export type ObservatoryDestinationCameraProfile = {
  observatoryId:
    GroundObservatoryId;

  regionalHigh:
    ObservatoryDestinationCameraPose;

  terrainAcquire:
    ObservatoryDestinationCameraPose;

  establishing:
    ObservatoryDestinationCameraPose;

  approach:
    ObservatoryDestinationCameraPose;

  facility:
    ObservatoryDestinationCameraPose;

  science:
    ObservatoryDestinationCameraPose;
};


function createPose(
  position:
    readonly [
      number,
      number,
      number,
    ],
  target:
    readonly [
      number,
      number,
      number,
    ],
  fov:
    number,
): ObservatoryDestinationCameraPose {
  return {
    position:
      new THREE.Vector3(
        ...position,
      ),

    target:
      new THREE.Vector3(
        ...target,
      ),

    fov,
  };
}


/*
 * ==================================================================
 * uGMRT
 * ==================================================================
 *
 * Scientific focal identity:
 * COMPLETE 30 × 45-m antenna array.
 *
 * uGMRT requires much wider terminal framing than DOT/HCT because the
 * scientific subject is the distributed array rather than a single building.
 *
 * The previous accepted-GLB pass successfully reached the array, but nearby
 * reflectors remained visually dominant.
 *
 * FINAL POLICY:
 * - preserve regionalHigh / terrainAcquire / establishing;
 * - move the terminal approach substantially farther outward;
 * - slightly widen FOV;
 * - retain Explore Observatory for visitor-controlled close inspection.
 */

const UGMRT_CAMERA:
  ObservatoryDestinationCameraProfile =
{
  observatoryId:
    "ugmrt",

  regionalHigh:
    createPose(
      [
        48,
        38,
        62,
      ],
      [
        0,
        -1.5,
        0,
      ],
      50,
    ),

  terrainAcquire:
    createPose(
      [
        34,
        27,
        46,
      ],
      [
        0,
        -0.8,
        0,
      ],
      47,
    ),

  establishing:
    createPose(
      [
        27,
        20,
        35,
      ],
      [
        0,
        0,
        0,
      ],
      44,
    ),

  /*
   * FINAL LOCKED CINEMATIC ARRIVAL
   *
   * Previous calibrated pass:
   *   position = [27, 18.5, 34]
   *   target   = [0, 0.45, 0]
   *   fov      = 43
   *
   * Final:
   * substantially farther out so multiple antennas and array geometry
   * establish the scene before the visitor chooses Explore/zoom.
   */
  approach:
    createPose(
      [
        38,
        26,
        48,
      ],
      [
        0,
        0.6,
        0,
      ],
      45,
    ),

  /*
   * Reserved for future local cinematic choreography.
   */
  facility:
    createPose(
      [
        22,
        14,
        27,
      ],
      [
        0,
        0.7,
        0,
      ],
      41,
    ),

  /*
   * Reserved for future alternate scientific presentation.
   */
  science:
    createPose(
      [
        -18.5,
        12,
        22,
      ],
      [
        0,
        0.85,
        0,
      ],
      40,
    ),
};


/*
 * ==================================================================
 * HCT / HANLE
 * ==================================================================
 *
 * Scientific focal identity:
 * HCT main building + telescope dome.
 *
 * The previous calibrated pass already produces a strong readable scene.
 *
 * Final change is intentionally modest:
 * - slightly more site/terrain context;
 * - telescope remains dominant;
 * - close inspection belongs to Explore Observatory.
 */

const HCT_CAMERA:
  ObservatoryDestinationCameraProfile =
{
  observatoryId:
    "hct",

  regionalHigh:
    createPose(
      [
        -24,
        20,
        32,
      ],
      [
        0,
        -1.5,
        -5,
      ],
      50,
    ),

  terrainAcquire:
    createPose(
      [
        -18,
        14,
        24,
      ],
      [
        0,
        -0.7,
        -3.5,
      ],
      47,
    ),

  establishing:
    createPose(
      [
        -12,
        9,
        16,
      ],
      [
        0,
        0,
        -1.2,
      ],
      43,
    ),

  /*
   * FINAL LOCKED CINEMATIC ARRIVAL
   *
   * Previous calibrated pass:
   *   position = [-10.5, 7.4, 13.5]
   *   target   = [0, 0.65, 0]
   *   fov      = 42
   *
   * Final:
   * modest additional retreat.
   */
  approach:
    createPose(
      [
        -12.5,
        8.8,
        16,
      ],
      [
        0,
        0.75,
        0,
      ],
      43,
    ),

  /*
   * Reserved for future local cinematic choreography.
   */
  facility:
    createPose(
      [
        -7.5,
        5.4,
        9.5,
      ],
      [
        0,
        0.65,
        0,
      ],
      39,
    ),

  /*
   * Reserved for future alternate scientific presentation.
   */
  science:
    createPose(
      [
        7.2,
        5.0,
        8.5,
      ],
      [
        0,
        0.8,
        0,
      ],
      40,
    ),
};


/*
 * ==================================================================
 * DOT / DEVASTHAL
 * ==================================================================
 *
 * Scientific focal identity:
 * 3.6-m telescope enclosure / dome.
 *
 * The previous calibrated pass already produces a strong cinematic
 * architectural view.
 *
 * Final change is intentionally modest so the dome/building remain prominent
 * while revealing slightly more road, vegetation and Himalayan site context.
 */

const DOT_CAMERA:
  ObservatoryDestinationCameraProfile =
{
  observatoryId:
    "dot",

  regionalHigh:
    createPose(
      [
        38,
        30,
        54,
      ],
      [
        0,
        -2.5,
        -13,
      ],
      52,
    ),

  terrainAcquire:
    createPose(
      [
        28,
        21,
        38,
      ],
      [
        0,
        -1.5,
        -8,
      ],
      48,
    ),

  establishing:
    createPose(
      [
        17,
        12,
        22,
      ],
      [
        0,
        -0.25,
        -3,
      ],
      43,
    ),

  /*
   * FINAL LOCKED CINEMATIC ARRIVAL
   *
   * Previous calibrated pass:
   *   position = [11.8, 8.0, 15.0]
   *   target   = [0, 0.65, 0]
   *   fov      = 41
   *
   * Final:
   * modest additional retreat.
   */
  approach:
    createPose(
      [
        14,
        9.5,
        18,
      ],
      [
        0,
        0.75,
        0,
      ],
      42,
    ),

  /*
   * Reserved for future local cinematic choreography.
   */
  facility:
    createPose(
      [
        7.2,
        4.8,
        9.3,
      ],
      [
        0,
        0.65,
        0,
      ],
      38,
    ),

  /*
   * Reserved for future alternate scientific presentation.
   */
  science:
    createPose(
      [
        -7.0,
        4.7,
        8.4,
      ],
      [
        0,
        0.72,
        0,
      ],
      39,
    ),
};


export const OBSERVATORY_DESTINATION_CAMERAS =
  Object.freeze({
    ugmrt:
      UGMRT_CAMERA,

    hct:
      HCT_CAMERA,

    dot:
      DOT_CAMERA,
  }) satisfies Readonly<
    Record<
      GroundObservatoryId,
      ObservatoryDestinationCameraProfile
    >
  >;


export function getObservatoryDestinationCamera(
  observatoryId:
    GroundObservatoryId,
): ObservatoryDestinationCameraProfile {
  return OBSERVATORY_DESTINATION_CAMERAS[
    observatoryId
  ];
}


export function getObservatoryDestinationPose(
  observatoryId:
    GroundObservatoryId,
  stage:
    ObservatoryDestinationStage,
): ObservatoryDestinationCameraPose {
  const canonical =
    getObservatoryDestinationCamera(
      observatoryId,
    )[stage];

  return {
    position:
      canonical.position.clone(),

    target:
      canonical.target.clone(),

    fov:
      canonical.fov,
  };
}