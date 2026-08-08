import * as THREE from "three";

import type {
  ObservatoryDescentVeilSystem,
} from "./observatory-descent-veil";

import type {
  ObservatoryEnvironmentSystem,
} from "./observatory-environment-system";

import {
  getObservatoryDestinationPose,
  type ObservatoryDestinationCameraPose,
} from "./observatory-destination-camera";

import type {
  ObservatoryDestinationTransitionSystem,
} from "./observatory-destination-transition";

import type {
  ObservatoryJourneyController,
} from "./observatory-journey-controller";

import type {
  GroundObservatoryId,
} from "./observatory-registry";


export type ObservatorySceneHandoffOptions = {
  transitionSystem:
    ObservatoryDestinationTransitionSystem;

  journeyController:
    ObservatoryJourneyController;

  veilSystem:
    ObservatoryDescentVeilSystem;

  environments:
    Record<
      GroundObservatoryId,
      ObservatoryEnvironmentSystem
    >;

  reducedMotion:
    boolean;
};


export type ObservatorySceneHandoff = {
  isDestinationActive():
    boolean;

  getActiveObservatoryId():
    GroundObservatoryId | null;

  enter(
    observatoryId:
      GroundObservatoryId,
  ): void;

  returnToEarth(
    onComplete?:
      () => void,
  ): boolean;

  cancelAndReset(): void;

  dispose(): void;
};


const LOCAL_WORLD_ORIGIN =
  new THREE.Vector3(
    0,
    -18,
    0,
  );


function withOffset(
  pose:
    ObservatoryDestinationCameraPose,
) {
  return {
    position:
      pose.position
        .clone()
        .add(
          LOCAL_WORLD_ORIGIN,
        ),

    target:
      pose.target
        .clone()
        .add(
          LOCAL_WORLD_ORIGIN,
        ),

    fov:
      pose.fov,
  };
}


export function createObservatorySceneHandoff({
  transitionSystem,
  journeyController,
  veilSystem,
  environments,
  reducedMotion,
}: ObservatorySceneHandoffOptions): ObservatorySceneHandoff {
  let disposed =
    false;

  let activeObservatoryId:
    GroundObservatoryId | null =
    null;

  let earthReturnPose:
    ObservatoryDestinationCameraPose | null =
    null;

  let returning =
    false;

  let token =
    0;


  const parkAll =
    () => {
      for (
        const environment of
        Object.values(
          environments,
        )
      ) {
        environment
          .setVisible(
            false,
          );

        environment
          .group
          .position
          .set(
            0,
            -50,
            0,
          );
      }
    };


  const prepare =
    (
      observatoryId:
        GroundObservatoryId,
    ) => {
      parkAll();

      const environment =
        environments[
          observatoryId
        ];

      environment
        .group
        .position
        .copy(
          LOCAL_WORLD_ORIGIN,
        );

      environment
        .setVisible(
          true,
        );

      journeyController
        .activateDestination(
          observatoryId,
        );

      journeyController
        .setLightingPhase(
          "day",
        );
    };


  const localPose =
    (
      observatoryId:
        GroundObservatoryId,
      stage:
        "regionalHigh"
        | "terrainAcquire"
        | "establishing"
        | "approach",
    ) =>
      withOffset(
        getObservatoryDestinationPose(
          observatoryId,
          stage,
        ),
      );


  parkAll();


  return {
    isDestinationActive() {
      return (
        activeObservatoryId !==
          null ||
        returning
      );
    },


    getActiveObservatoryId() {
      return activeObservatoryId;
    },


    enter(
      observatoryId,
    ) {
      if (
        disposed
      ) {
        return;
      }

      const currentToken =
        ++token;

      transitionSystem
        .cancel();

      returning =
        false;

      earthReturnPose =
        transitionSystem
          .captureCurrentPose();

      activeObservatoryId =
        observatoryId;

      prepare(
        observatoryId,
      );

      /*
       * The coordinate-space switch happens only while the veil is sealed.
       * Snap to the high regional local pose, then start one continuous
       * spline through the terrain acquisition and facility approach.
       */

      transitionSystem
        .transitionToPose({
          pose:
            localPose(
              observatoryId,
              "regionalHigh",
            ),

          duration:
            0,

          onComplete:
            () => {
              if (
                disposed ||
                currentToken !==
                  token
              ) {
                return;
              }

              void veilSystem
                .revealLocal();

              transitionSystem
                .transitionAlongPoses({
                  observatoryId,

                  stage:
                    "approach",

                  poses: [
                    localPose(
                      observatoryId,
                      "terrainAcquire",
                    ),

                    localPose(
                      observatoryId,
                      "establishing",
                    ),

                    localPose(
                      observatoryId,
                      "approach",
                    ),
                  ],

                  duration:
                    reducedMotion
                      ? 0.55
                      : 6.0,
                });
            },
        });
    },


    returnToEarth(
      onComplete,
    ) {
      if (
        disposed ||
        !activeObservatoryId ||
        !earthReturnPose ||
        returning
      ) {
        return false;
      }

      const currentToken =
        ++token;

      returning =
        true;

      transitionSystem
        .cancel();

      journeyController
        .beginReturn();

      const observatoryId =
        activeObservatoryId;

      const returnPose = {
        position:
          earthReturnPose
            .position
            .clone(),

        target:
          earthReturnPose
            .target
            .clone(),

        fov:
          earthReturnPose
            .fov,
      };


      transitionSystem
        .transitionAlongPoses({
          observatoryId,

          stage:
            "regionalHigh",

          poses: [
            localPose(
              observatoryId,
              "establishing",
            ),

            localPose(
              observatoryId,
              "terrainAcquire",
            ),

            localPose(
              observatoryId,
              "regionalHigh",
            ),
          ],

          duration:
            reducedMotion
              ? 0.45
              : 4.8,

          onProgress:
            (
              progress,
            ) => {
              veilSystem
                .setReturnProgress(
                  progress,
                );
            },

          onComplete:
            () => {
              if (
                disposed ||
                currentToken !==
                  token
              ) {
                return;
              }

              /*
               * setReturnProgress() has already made the veil essentially
               * opaque by the end of the continuous ascent. Therefore the
               * coordinate switch can happen immediately with no stationary
               * "seal" pause.
               */

              transitionSystem
                .transitionToPose({
                  pose:
                    returnPose,

                  duration:
                    0,

                  onComplete:
                    () => {
                      if (
                        disposed ||
                        currentToken !==
                          token
                      ) {
                        return;
                      }

                      journeyController
                        .reset();

                      parkAll();

                      activeObservatoryId =
                        null;

                      earthReturnPose =
                        null;

                      returning =
                        false;

                      /*
                       * Start canonical Earth Restore immediately while the
                       * neutral haze is already clearing.
                       */

                      onComplete?.();

                      void veilSystem
                        .revealEarth();
                    },
                });
            },
        });

      return true;
    },


    cancelAndReset() {
      if (
        disposed
      ) {
        return;
      }

      token +=
        1;

      transitionSystem
        .cancel();

      veilSystem
        .cancel();

      journeyController
        .reset();

      parkAll();

      activeObservatoryId =
        null;

      earthReturnPose =
        null;

      returning =
        false;
    },


    dispose() {
      if (
        disposed
      ) {
        return;
      }

      token +=
        1;

      transitionSystem
        .cancel();

      veilSystem
        .cancel();

      journeyController
        .reset();

      parkAll();

      activeObservatoryId =
        null;

      earthReturnPose =
        null;

      returning =
        false;

      disposed =
        true;
    },
  };
}
