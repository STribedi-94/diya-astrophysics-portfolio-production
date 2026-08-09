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


export type ObservatorySceneEntryRequest = {
  observatoryId:
    GroundObservatoryId;

  earthPoses:
    ObservatoryDestinationCameraPose[];
};


export type ObservatorySceneReturnRequest = {
  finalPose?:
    ObservatoryDestinationCameraPose;

  onProgress?:
    (
      progress:
        number,
    ) => void;

  onComplete?:
    () => void;
};


export type ObservatorySceneHandoff = {
  isDestinationActive():
    boolean;

  getActiveObservatoryId():
    GroundObservatoryId | null;

  enter(
    request:
      ObservatorySceneEntryRequest,
  ): void;

  returnToEarth(
    request?:
      ObservatorySceneReturnRequest,
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


const ENTRY_LOCAL_ACTIVATE_PROGRESS =
  0.45;

const ENTRY_LOCAL_REVEAL_PROGRESS =
  0.72;

const RETURN_LOCAL_HIDE_PROGRESS =
  0.60;

const RETURN_EARTH_REVEAL_PROGRESS =
  0.72;

/*
 * Stage 1.15C masking envelope:
 *
 * Stage 1.15B correctly gave revealLocal()/revealEarth() sole opacity
 * ownership once a reveal begins, eliminating the persistent white-screen
 * race. The earlier Stage 1.15A felt slower/smoother because the competing
 * progress writer unintentionally kept the veil opaque much longer across
 * the global/local scale transition.
 *
 * Preserve the Stage 1.15B ownership fix, but deliberately hold the veil
 * opaque across that high-motion handoff and reveal only after the camera
 * has progressed well into the destination/Earth side. Restore also keeps
 * the local environment visible longer before it is parked.
 */


function clonePose(
  pose:
    ObservatoryDestinationCameraPose,
): ObservatoryDestinationCameraPose {
  return {
    position:
      pose.position.clone(),

    target:
      pose.target.clone(),

    fov:
      pose.fov,
  };
}


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

  let entryStartPose:
    ObservatoryDestinationCameraPose | null =
    null;

  let entryEarthPoses:
    ObservatoryDestinationCameraPose[] =
    [];

  let returning =
    false;

  let token =
    0;


  const parkAllPositions =
    () => {
      for (
        const environment of
        Object.values(
          environments,
        )
      ) {
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


  const positionDestination =
    (
      observatoryId:
        GroundObservatoryId,
    ) => {
      parkAllPositions();

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


  parkAllPositions();


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


    enter({
      observatoryId,
      earthPoses,
    }) {
      if (
        disposed ||
        earthPoses.length ===
          0
      ) {
        return;
      }

      const currentToken =
        ++token;

      transitionSystem
        .cancel();

      returning =
        false;

      entryStartPose =
        transitionSystem
          .captureCurrentPose();

      entryEarthPoses =
        earthPoses.map(
          clonePose,
        );

      activeObservatoryId =
        observatoryId;

      positionDestination(
        observatoryId,
      );

      veilSystem
        .beginEarthDive(
          observatoryId,
        );

      let localActivated =
        false;

      let localRevealStarted =
        false;

      /*
       * Stage 1.15:
       *
       * One transition system owns the complete perceived journey.
       * The same Catmull-Rom path now contains both Earth-space and
       * local-destination poses. The unavoidable scale/origin change
       * therefore happens inside the already-moving path while the
       * atmospheric veil is opaque, rather than between two animations.
       */
      transitionSystem
        .transitionAlongPoses({
          observatoryId,

          stage:
            "approach",

          poses: [
            ...entryEarthPoses
              .map(
                clonePose,
              ),

            localPose(
              observatoryId,
              "regionalHigh",
            ),

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
              ? 1.15
              : 9.2,

          onProgress:
            (
              progress,
            ) => {
              if (
                disposed ||
                currentToken !==
                  token
              ) {
                return;
              }

              /*
               * Stage 1.15B veil ownership:
               *
               * Once revealLocal() begins, it becomes the sole writer of the
               * veil opacity. Continuing to call setDiveProgress() afterwards
               * would force the haze/clouds back toward full white every frame
               * and can leave the viewport permanently washed out.
               */
              if (!localRevealStarted) {
                const veilProgress =
                  THREE.MathUtils.clamp(
                    progress /
                      ENTRY_LOCAL_ACTIVATE_PROGRESS,
                    0,
                    1,
                  );

                observatoryDescentProgress(
                  veilSystem,
                  veilProgress,
                );
              }

              if (
                !localActivated &&
                progress >=
                  ENTRY_LOCAL_ACTIVATE_PROGRESS
              ) {
                localActivated =
                  true;

                journeyController
                  .markDestinationReady(
                    observatoryId,
                  );

                journeyController
                  .activateDestination(
                    observatoryId,
                  );
              }

              if (
                !localRevealStarted &&
                progress >=
                  ENTRY_LOCAL_REVEAL_PROGRESS
              ) {
                localRevealStarted =
                  true;

                void veilSystem
                  .revealLocal();
              }
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

              if (
                !localActivated
              ) {
                journeyController
                  .markDestinationReady(
                    observatoryId,
                  );

                journeyController
                  .activateDestination(
                    observatoryId,
                  );
              }

              /*
               * Reassert the clear terminal state at completion. This is safe
               * even when the reveal already started and makes the final frame
               * deterministic across refresh/HMR timing differences.
               */
              void veilSystem
                .revealLocal();
            },
        });
    },


    returnToEarth(
      request = {},
    ) {
      if (
        disposed ||
        !activeObservatoryId ||
        !entryStartPose ||
        entryEarthPoses.length ===
          0 ||
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

      const finalPose =
        request.finalPose
          ? clonePose(
              request.finalPose,
            )
          : clonePose(
              entryStartPose,
            );

      const reversedEarthPoses =
        entryEarthPoses
          .slice()
          .reverse()
          .map(
            clonePose,
          );

      let localHidden =
        false;

      let earthRevealStarted =
        false;

      /*
       * The return is the same ownership model in reverse: local ascent,
       * atmospheric cross-space transit, Earth reacquisition, then the final
       * requested global pose. No zero-duration camera snap and no second
       * camera-controller Restore are required.
       */
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

            ...reversedEarthPoses,

            finalPose,
          ],

          duration:
            reducedMotion
              ? 1.0
              : 8.4,

          onProgress:
            (
              progress,
            ) => {
              if (
                disposed ||
                currentToken !==
                  token
              ) {
                return;
              }

              /*
               * Stage 1.15B veil ownership:
               *
               * revealEarth() must become the only opacity writer after the
               * Earth-reveal threshold. Otherwise subsequent return-progress
               * frames immediately overwrite the fade-to-clear with opaque
               * haze again, which caused the persistent white-splash state.
               */
              if (!earthRevealStarted) {
                const veilProgress =
                  THREE.MathUtils.clamp(
                    progress /
                      RETURN_LOCAL_HIDE_PROGRESS,
                    0,
                    1,
                  );

                veilSystem
                  .setReturnProgress(
                    veilProgress,
                  );
              }

              request
                .onProgress?.(
                  progress,
                );

              if (
                !localHidden &&
                progress >=
                  RETURN_LOCAL_HIDE_PROGRESS
              ) {
                localHidden =
                  true;

                journeyController
                  .reset();

                parkAllPositions();
              }

              if (
                !earthRevealStarted &&
                progress >=
                  RETURN_EARTH_REVEAL_PROGRESS
              ) {
                earthRevealStarted =
                  true;

                void veilSystem
                  .revealEarth();
              }
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

              if (
                !localHidden
              ) {
                journeyController
                  .reset();

                parkAllPositions();
              }

              /*
               * Reassert the clear Earth terminal state so no stale haze can
               * survive the journey after reloads or different frame timing.
               */
              void veilSystem
                .revealEarth();

              activeObservatoryId =
                null;

              entryStartPose =
                null;

              entryEarthPoses =
                [];

              returning =
                false;

              request
                .onProgress?.(
                  1,
                );

              request
                .onComplete?.();
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

      parkAllPositions();

      activeObservatoryId =
        null;

      entryStartPose =
        null;

      entryEarthPoses =
        [];

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

      parkAllPositions();

      activeObservatoryId =
        null;

      entryStartPose =
        null;

      entryEarthPoses =
        [];

      returning =
        false;

      disposed =
        true;
    },
  };
}


function observatoryDescentProgress(
  veilSystem:
    ObservatoryDescentVeilSystem,
  progress:
    number,
) {
  veilSystem
    .setDiveProgress(
      progress,
    );
}
