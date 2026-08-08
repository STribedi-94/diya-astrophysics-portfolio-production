import * as THREE from "three";

import {
  getObservatoryDestinationPose,
  type ObservatoryDestinationCameraPose,
  type ObservatoryDestinationStage,
} from "./observatory-destination-camera";

import type {
  GroundObservatoryId,
} from "./observatory-registry";


export type ObservatoryDestinationTransitionOptions = {
  camera:
    THREE.PerspectiveCamera;
};


export type ObservatoryDestinationTransitionRequest = {
  observatoryId:
    GroundObservatoryId;

  stage:
    ObservatoryDestinationStage;

  duration?:
    number;

  worldOffset?:
    THREE.Vector3;

  onComplete?:
    () => void;

  onProgress?:
    (
      progress:
        number,
    ) => void;
};


export type ObservatoryExplicitPoseTransitionRequest = {
  pose:
    ObservatoryDestinationCameraPose;

  duration?:
    number;

  onComplete?:
    () => void;

  onProgress?:
    (
      progress:
        number,
    ) => void;
};


export type ObservatoryPosePathTransitionRequest = {
  poses:
    ObservatoryDestinationCameraPose[];

  duration:
    number;

  observatoryId?:
    GroundObservatoryId | null;

  stage?:
    ObservatoryDestinationStage | null;

  onComplete?:
    () => void;

  onProgress?:
    (
      progress:
        number,
    ) => void;
};


export type ObservatoryDestinationTransitionSystem = {
  isActive():
    boolean;

  getObservatoryId():
    GroundObservatoryId | null;

  getStage():
    ObservatoryDestinationStage | null;

  captureCurrentPose():
    ObservatoryDestinationCameraPose;

  transitionTo(
    request:
      ObservatoryDestinationTransitionRequest,
  ): void;

  transitionToPose(
    request:
      ObservatoryExplicitPoseTransitionRequest,
  ): void;

  transitionAlongPoses(
    request:
      ObservatoryPosePathTransitionRequest,
  ): void;

  cancel(): void;

  update(
    deltaSeconds:
      number,
  ): void;

  dispose(): void;
};


type ActiveTransition = {
  observatoryId:
    GroundObservatoryId | null;

  stage:
    ObservatoryDestinationStage | null;

  elapsed:
    number;

  duration:
    number;

  poses:
    ObservatoryDestinationCameraPose[];

  positionCurve:
    THREE.CatmullRomCurve3 | null;

  targetCurve:
    THREE.CatmullRomCurve3 | null;

  onComplete?:
    () => void;

  onProgress?:
    (
      progress:
        number,
    ) => void;
};


function smoothJourney(
  value:
    number,
) {
  const t =
    THREE.MathUtils.clamp(
      value,
      0,
      1,
    );

  return (
    t *
    t *
    t *
    (
      t *
      (
        t *
        6 -
        15
      ) +
      10
    )
  );
}


function clonePose(
  pose:
    ObservatoryDestinationCameraPose,
): ObservatoryDestinationCameraPose {
  return {
    position:
      pose.position
        .clone(),

    target:
      pose.target
        .clone(),

    fov:
      pose.fov,
  };
}


function offsetPose(
  pose:
    ObservatoryDestinationCameraPose,
  worldOffset?:
    THREE.Vector3,
) {
  const cloned =
    clonePose(
      pose,
    );

  if (
    worldOffset
  ) {
    cloned.position.add(
      worldOffset,
    );

    cloned.target.add(
      worldOffset,
    );
  }

  return cloned;
}


function interpolateFov(
  poses:
    ObservatoryDestinationCameraPose[],
  progress:
    number,
) {
  if (
    poses.length <=
    1
  ) {
    return (
      poses[0]?.fov ??
      45
    );
  }

  const scaled =
    THREE.MathUtils.clamp(
      progress,
      0,
      1,
    ) *
    (
      poses.length -
      1
    );

  const index =
    Math.min(
      poses.length -
        2,
      Math.floor(
        scaled,
      ),
    );

  const local =
    scaled -
    index;

  return THREE.MathUtils
    .lerp(
      poses[
        index
      ].fov,
      poses[
        index +
        1
      ].fov,
      local,
    );
}


export function createObservatoryDestinationTransitionSystem({
  camera,
}: ObservatoryDestinationTransitionOptions): ObservatoryDestinationTransitionSystem {
  let disposed =
    false;

  let active:
    ActiveTransition | null =
    null;

  let currentObservatoryId:
    GroundObservatoryId | null =
    null;

  let currentStage:
    ObservatoryDestinationStage | null =
    null;


  const captureCurrentPose =
    (): ObservatoryDestinationCameraPose => {
      const direction =
        new THREE.Vector3();

      camera.getWorldDirection(
        direction,
      );

      return {
        position:
          camera.position
            .clone(),

        target:
          camera.position
            .clone()
            .add(
              direction.multiplyScalar(
                5,
              ),
            ),

        fov:
          camera.fov,
      };
    };


  const applyPose =
    (
      pose:
        ObservatoryDestinationCameraPose,
    ) => {
      camera.position.copy(
        pose.position,
      );

      camera.fov =
        pose.fov;

      camera.updateProjectionMatrix();

      camera.lookAt(
        pose.target,
      );
    };


  const startPath =
    (
      suppliedPoses:
        ObservatoryDestinationCameraPose[],
      duration:
        number,
      observatoryId:
        GroundObservatoryId | null,
      stage:
        ObservatoryDestinationStage | null,
      onComplete?:
        () => void,
      onProgress?:
        (
          progress:
            number,
        ) => void,
    ) => {
      active =
        null;

      const poses = [
        captureCurrentPose(),
        ...suppliedPoses.map(
          clonePose,
        ),
      ];


      currentObservatoryId =
        observatoryId;

      currentStage =
        stage;


      if (
        poses.length <
          2 ||
        duration <=
          0.001
      ) {
        const finalPose =
          poses[
            poses.length -
              1
          ];

        applyPose(
          finalPose,
        );

        onProgress?.(
          1,
        );

        onComplete?.();

        return;
      }


      const positionCurve =
        poses.length >=
        3
          ? new THREE
              .CatmullRomCurve3(
                poses.map(
                  (
                    pose,
                  ) =>
                    pose.position,
                ),
                false,
                "centripetal",
                0.5,
              )
          : null;


      const targetCurve =
        poses.length >=
        3
          ? new THREE
              .CatmullRomCurve3(
                poses.map(
                  (
                    pose,
                  ) =>
                    pose.target,
                ),
                false,
                "centripetal",
                0.5,
              )
          : null;


      active = {
        observatoryId,
        stage,
        elapsed:
          0,
        duration,
        poses,
        positionCurve,
        targetCurve,
        onComplete,
        onProgress,
      };
    };


  return {
    isActive() {
      return (
        active !==
        null
      );
    },


    getObservatoryId() {
      return currentObservatoryId;
    },


    getStage() {
      return currentStage;
    },


    captureCurrentPose() {
      return captureCurrentPose();
    },


    transitionTo({
      observatoryId,
      stage,
      duration = 1.4,
      worldOffset,
      onComplete,
      onProgress,
    }) {
      if (
        disposed
      ) {
        return;
      }

      startPath(
        [
          offsetPose(
            getObservatoryDestinationPose(
              observatoryId,
              stage,
            ),
            worldOffset,
          ),
        ],
        duration,
        observatoryId,
        stage,
        onComplete,
        onProgress,
      );
    },


    transitionToPose({
      pose,
      duration = 1.25,
      onComplete,
      onProgress,
    }) {
      if (
        disposed
      ) {
        return;
      }

      startPath(
        [
          pose,
        ],
        duration,
        null,
        null,
        onComplete,
        onProgress,
      );
    },


    transitionAlongPoses({
      poses,
      duration,
      observatoryId = null,
      stage = null,
      onComplete,
      onProgress,
    }) {
      if (
        disposed
      ) {
        return;
      }

      startPath(
        poses,
        duration,
        observatoryId,
        stage,
        onComplete,
        onProgress,
      );
    },


    cancel() {
      if (
        disposed
      ) {
        return;
      }

      active =
        null;
    },


    update(
      deltaSeconds,
    ) {
      if (
        disposed ||
        !active
      ) {
        return;
      }


      const transition =
        active;


      transition.elapsed =
        Math.min(
          transition.duration,
          transition.elapsed +
            Math.max(
              0,
              deltaSeconds,
            ),
        );


      const raw =
        transition.duration >
        0
          ? transition.elapsed /
            transition.duration
          : 1;


      const progress =
        smoothJourney(
          raw,
        );


      let position:
        THREE.Vector3;

      let target:
        THREE.Vector3;


      if (
        transition
          .positionCurve &&
        transition
          .targetCurve
      ) {
        position =
          transition
            .positionCurve
            .getPoint(
              progress,
            );

        target =
          transition
            .targetCurve
            .getPoint(
              progress,
            );
      } else {
        const start =
          transition
            .poses[0];

        const end =
          transition
            .poses[
              transition
                .poses
                .length -
                1
            ];

        position =
          start.position
            .clone()
            .lerp(
              end.position,
              progress,
            );

        target =
          start.target
            .clone()
            .lerp(
              end.target,
              progress,
            );
      }


      camera.position.copy(
        position,
      );

      camera.fov =
        interpolateFov(
          transition.poses,
          progress,
        );

      camera.updateProjectionMatrix();

      camera.lookAt(
        target,
      );


      transition
        .onProgress?.(
          raw,
        );


      if (
        raw >=
        1
      ) {
        const finalPose =
          transition
            .poses[
              transition
                .poses
                .length -
                1
            ];

        const completion =
          transition
            .onComplete;

        active =
          null;

        applyPose(
          finalPose,
        );

        completion?.();
      }
    },


    dispose() {
      if (
        disposed
      ) {
        return;
      }

      active =
        null;

      currentObservatoryId =
        null;

      currentStage =
        null;

      disposed =
        true;
    },
  };
}
