import * as THREE from "three";

import {
  ASTRA_OVERVIEW_CAMERA,
  createAstraOverviewTarget,
} from "./composition";

export type AstraCameraMode =
  | "overview"
  | "earthInteraction"
  | "sceneOrbit"
  | "tessOverview"
  | "tessSectorFocus"
  | "tessTargetFocus"
  | "observatoryAlignment"
  | "observatoryApproach"
  | "observatoryFocus"
  | "galleryFocus"
  | "returning";

export type AstraInteractionState = {
  mode: AstraCameraMode;
  selectedId: string | null;
  inputOwner: "earth" | "camera" | "guided";
};

export const ASTRA_INITIAL_INTERACTION_STATE: AstraInteractionState = {
  mode: "overview",
  selectedId: null,
  inputOwner: "earth",
};

export type AstraCameraPose = {
  distance: number;
  azimuth: number;
  polar: number;
  target: THREE.Vector3;
};

export type AstraCameraTransitionOptions = {
  duration?: number;
  mode?: AstraCameraMode;
  inputOwner?: AstraInteractionState["inputOwner"];
  selectedId?: string | null;
  onComplete?: () => void;
};

export type AstraCameraControllerOptions = {
  initialDistance?: number;
  initialAzimuth?: number;
  initialPolar?: number;
  minDistance?: number;
  maxDistance?: number;
};

type AstraCameraTransition = {
  startPose: AstraCameraPose;
  endPose: AstraCameraPose;
  elapsed: number;
  duration: number;
  onComplete?: () => void;
};

const DEFAULT_TRANSITION_DURATION = 1.15;

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function shortestAngleDelta(from: number, to: number) {
  return Math.atan2(
    Math.sin(to - from),
    Math.cos(to - from),
  );
}

export class AstraCameraController {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly minDistance: number;
  private readonly maxDistance: number;
  private readonly target = new THREE.Vector3();

  private distance: number;
  private azimuth: number;
  private polar: number;

  private interactionState: AstraInteractionState = {
    ...ASTRA_INITIAL_INTERACTION_STATE,
  };

  private transition: AstraCameraTransition | null = null;

  constructor(
    camera: THREE.PerspectiveCamera,
    options: AstraCameraControllerOptions = {},
  ) {
    this.camera = camera;

    this.distance =
      options.initialDistance ??
      ASTRA_OVERVIEW_CAMERA.distance;

    this.azimuth =
      options.initialAzimuth ??
      ASTRA_OVERVIEW_CAMERA.azimuth;

    this.polar =
      options.initialPolar ??
      ASTRA_OVERVIEW_CAMERA.polar;

    this.minDistance =
      options.minDistance ??
      ASTRA_OVERVIEW_CAMERA.minDistance;

    this.maxDistance =
      options.maxDistance ??
      ASTRA_OVERVIEW_CAMERA.maxDistance;

    this.target.copy(
      createAstraOverviewTarget(),
    );

    this.apply();
  }

  getMode() {
    return this.interactionState.mode;
  }

  getInteractionState(): AstraInteractionState {
    return {
      ...this.interactionState,
    };
  }

  setMode(mode: AstraCameraMode) {
    this.interactionState = {
      ...this.interactionState,
      mode,
    };
  }

  setInteractionState(
    nextState: Partial<AstraInteractionState>,
  ) {
    this.interactionState = {
      ...this.interactionState,
      ...nextState,
    };
  }

  getDistance() {
    return this.distance;
  }

  getPose(): AstraCameraPose {
    return {
      distance: this.distance,
      azimuth: this.azimuth,
      polar: this.polar,
      target: this.target.clone(),
    };
  }

  isTransitioning() {
    return this.transition !== null;
  }

  cancelTransition(
    nextState?: Partial<AstraInteractionState>,
  ) {
    if (!this.transition) {
      if (nextState) {
        this.setInteractionState(nextState);
      }

      return;
    }

    this.transition = null;

    if (nextState) {
      this.setInteractionState(nextState);
    }
  }

  transitionTo(
    pose: AstraCameraPose,
    options: AstraCameraTransitionOptions = {},
  ) {
    const duration = Math.max(
      0,
      options.duration ??
        DEFAULT_TRANSITION_DURATION,
    );

    this.transition = null;

    this.setInteractionState({
      mode:
        options.mode ??
        this.interactionState.mode,
      inputOwner:
        options.inputOwner ??
        "guided",
      selectedId:
        options.selectedId !== undefined
          ? options.selectedId
          : this.interactionState.selectedId,
    });

    const endPose: AstraCameraPose = {
      distance: THREE.MathUtils.clamp(
        pose.distance,
        this.minDistance,
        this.maxDistance,
      ),
      azimuth: pose.azimuth,
      polar: THREE.MathUtils.clamp(
        pose.polar,
        0.55,
        Math.PI - 0.55,
      ),
      target: pose.target.clone(),
    };

    if (duration === 0) {
      this.distance = endPose.distance;
      this.azimuth = endPose.azimuth;
      this.polar = endPose.polar;
      this.target.copy(endPose.target);

      this.apply();

      options.onComplete?.();

      return;
    }

    this.transition = {
      startPose: this.getPose(),
      endPose,
      elapsed: 0,
      duration,
      onComplete: options.onComplete,
    };
  }

  update(deltaSeconds: number) {
    if (
      !this.transition ||
      !Number.isFinite(deltaSeconds) ||
      deltaSeconds <= 0
    ) {
      return;
    }

    const transition = this.transition;

    transition.elapsed = Math.min(
      transition.elapsed + deltaSeconds,
      transition.duration,
    );

    const rawProgress =
      transition.duration === 0
        ? 1
        : transition.elapsed /
          transition.duration;

    const progress = easeInOutCubic(
      THREE.MathUtils.clamp(
        rawProgress,
        0,
        1,
      ),
    );

    this.distance = THREE.MathUtils.lerp(
      transition.startPose.distance,
      transition.endPose.distance,
      progress,
    );

    this.azimuth =
      transition.startPose.azimuth +
      shortestAngleDelta(
        transition.startPose.azimuth,
        transition.endPose.azimuth,
      ) *
        progress;

    this.polar = THREE.MathUtils.lerp(
      transition.startPose.polar,
      transition.endPose.polar,
      progress,
    );

    this.target.lerpVectors(
      transition.startPose.target,
      transition.endPose.target,
      progress,
    );

    this.apply();

    if (rawProgress >= 1) {
      this.distance =
        transition.endPose.distance;

      this.azimuth =
        transition.endPose.azimuth;

      this.polar =
        transition.endPose.polar;

      this.target.copy(
        transition.endPose.target,
      );

      this.apply();

      this.transition = null;

      transition.onComplete?.();
    }
  }

  setTarget(target: THREE.Vector3) {
    this.cancelTransition();

    this.target.copy(target);
    this.apply();
  }

  orbit(
    deltaX: number,
    deltaY: number,
    sensitivity = 0.005,
  ) {
    this.cancelTransition({
      mode: "sceneOrbit",
      inputOwner: "camera",
    });

    this.azimuth -=
      deltaX * sensitivity;

    this.polar = THREE.MathUtils.clamp(
      this.polar -
        deltaY * sensitivity,
      0.55,
      Math.PI - 0.55,
    );

    this.apply();
  }

  zoomByScale(scale: number) {
    if (
      !Number.isFinite(scale) ||
      scale <= 0
    ) {
      return;
    }

    this.cancelTransition({
      mode: "sceneOrbit",
      inputOwner: "camera",
    });

    this.distance = THREE.MathUtils.clamp(
      this.distance * scale,
      this.minDistance,
      this.maxDistance,
    );

    this.apply();
  }

  zoomToDistance(distance: number) {
    if (!Number.isFinite(distance)) {
      return;
    }

    this.cancelTransition({
      mode: "sceneOrbit",
      inputOwner: "camera",
    });

    this.distance = THREE.MathUtils.clamp(
      distance,
      this.minDistance,
      this.maxDistance,
    );

    this.apply();
  }

  zoomByWheel(deltaY: number) {
    const direction = Math.sign(deltaY);

    if (direction === 0) {
      return;
    }

    this.zoomByScale(
      1 + direction * 0.08,
    );
  }

  restoreOverview(
    duration = DEFAULT_TRANSITION_DURATION,
  ) {
    const overviewPose: AstraCameraPose = {
      distance:
        ASTRA_OVERVIEW_CAMERA.distance,
      azimuth:
        ASTRA_OVERVIEW_CAMERA.azimuth,
      polar:
        ASTRA_OVERVIEW_CAMERA.polar,
      target:
        createAstraOverviewTarget(),
    };

    this.transitionTo(
      overviewPose,
      {
        duration,
        mode: "returning",
        inputOwner: "guided",
        selectedId: null,

        onComplete: () => {
          this.setInteractionState({
            mode: "overview",
            selectedId: null,
            inputOwner: "earth",
          });
        },
      },
    );
  }

  apply() {
    const sinPolar =
      Math.sin(this.polar);

    this.camera.position.set(
      this.target.x +
        this.distance *
          sinPolar *
          Math.sin(this.azimuth),

      this.target.y +
        this.distance *
          Math.cos(this.polar),

      this.target.z +
        this.distance *
          sinPolar *
          Math.cos(this.azimuth),
    );

    this.camera.lookAt(
      this.target,
    );
  }
}