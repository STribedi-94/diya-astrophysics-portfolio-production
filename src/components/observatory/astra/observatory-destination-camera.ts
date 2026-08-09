import * as THREE from "three";

import type {
  GroundObservatoryId,
} from "./observatory-registry";


/*
 * ==================================================================
 * PROJECT DIYA ASTRA
 * Ground Observatory Destination Camera Contract — Premium Arrival
 * ==================================================================
 *
 * Stage 1.13B expands the old four-pose local camera contract into a
 * genuine arrival path:
 *
 * regionalHigh
 *   → terrainAcquire
 *   → establishing
 *   → approach
 *   → facility
 *   → science
 *
 * These are LOCAL destination coordinates only. Earth-space descent is
 * still owned separately and will be connected in Stage 1.13C.
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
 * ------------------------------------------------------------------
 * uGMRT
 * ------------------------------------------------------------------
 *
 * The first two poses are deliberately very wide. The visitor must
 * understand the array's physical scale before an individual antenna
 * becomes visually dominant.
 */

const UGMRT_CAMERA:
  ObservatoryDestinationCameraProfile =
{
  observatoryId:
    "ugmrt",

  regionalHigh:
    createPose(
      [
        0,
        28,
        31,
      ],
      [
        0,
        0,
        0,
      ],
      50,
    ),

  terrainAcquire:
    createPose(
      [
        13,
        17,
        24,
      ],
      [
        0,
        0.8,
        -1,
      ],
      47,
    ),

  establishing:
    createPose(
      [
        11.5,
        8.8,
        14.5,
      ],
      [
        0,
        0.7,
        0,
      ],
      44,
    ),

  approach:
    createPose(
      [
        7.2,
        4.6,
        8.4,
      ],
      [
        0.5,
        1.0,
        0,
      ],
      41,
    ),

  facility:
    createPose(
      [
        3.6,
        2.45,
        4.1,
      ],
      [
        0,
        1.05,
        0,
      ],
      38,
    ),

  science:
    createPose(
      [
        5.5,
        3.1,
        2.6,
      ],
      [
        0,
        1.05,
        0,
      ],
      39,
    ),
};


/*
 * ------------------------------------------------------------------
 * HCT / HANLE
 * ------------------------------------------------------------------
 *
 * Arrival begins above the huge barren valley. The dome stays small
 * until the establishing / approach stages.
 */

const HCT_CAMERA:
  ObservatoryDestinationCameraProfile =
{
  observatoryId:
    "hct",

  regionalHigh:
    createPose(
      [
        -5,
        29,
        34,
      ],
      [
        0,
        0.5,
        -5,
      ],
      50,
    ),

  terrainAcquire:
    createPose(
      [
        -12,
        18,
        25,
      ],
      [
        0,
        0.6,
        -5,
      ],
      47,
    ),

  establishing:
    createPose(
      [
        -9,
        10.5,
        15,
      ],
      [
        0,
        0.8,
        -1,
      ],
      44,
    ),

  approach:
    createPose(
      [
        -5.5,
        5.4,
        8.2,
      ],
      [
        0,
        1.0,
        0,
      ],
      40,
    ),

  facility:
    createPose(
      [
        -3.0,
        2.8,
        4.1,
      ],
      [
        0,
        1.05,
        0,
      ],
      37,
    ),

  science:
    createPose(
      [
        3.8,
        2.7,
        3.2,
      ],
      [
        0,
        1.05,
        0,
      ],
      38,
    ),
};


/*
 * ------------------------------------------------------------------
 * DOT / DEVASTHAL
 * ------------------------------------------------------------------
 *
 * DOT gets the deepest "mountain acquisition" route. The camera first
 * reads the ridge system and forested valley, then descends toward the
 * observatory clearing.
 */

const DOT_CAMERA:
  ObservatoryDestinationCameraProfile =
{
  observatoryId:
    "dot",

  /*
   * Premium DOT / Devasthal framing.
   *
   * Preserve the accepted six-stage journey contract while allowing the
   * expanded Himalayan environment to read in layers:
   *
   * regionalHigh     → distant ridge system + valley scale
   * terrainAcquire   → forested approach + observatory-site elevation
   * establishing     → terrace + road + telescope context
   * approach         → facility becomes dominant
   * facility         → architectural reveal
   * science          → alternate close scientific presentation angle
   */

  regionalHigh:
    createPose(
      [
        3,
        32,
        38,
      ],
      [
        0,
        1,
        -13,
      ],
      52,
    ),

  terrainAcquire:
    createPose(
      [
        16,
        19,
        27,
      ],
      [
        0,
        1.15,
        -10,
      ],
      48,
    ),

  establishing:
    createPose(
      [
        12.5,
        10.8,
        15.5,
      ],
      [
        0,
        1.15,
        -2.8,
      ],
      43,
    ),

  approach:
    createPose(
      [
        7.2,
        5.8,
        9.4,
      ],
      [
        0,
        1.35,
        0.1,
      ],
      39,
    ),

  facility:
    createPose(
      [
        4.0,
        3.1,
        4.9,
      ],
      [
        0,
        1.42,
        0,
      ],
      36,
    ),

  science:
    createPose(
      [
        -4.3,
        2.9,
        3.8,
      ],
      [
        0,
        1.46,
        0,
      ],
      37,
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
      canonical.position
        .clone(),

    target:
      canonical.target
        .clone(),

    fov:
      canonical.fov,
  };
}
