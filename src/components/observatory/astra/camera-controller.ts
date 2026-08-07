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

export type AstraCameraControllerOptions = {
  initialDistance?: number;
  initialAzimuth?: number;
  initialPolar?: number;
  minDistance?: number;
  maxDistance?: number;
};

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

  setTarget(target: THREE.Vector3) {
    this.target.copy(target);
    this.apply();
  }

  orbit(
    deltaX: number,
    deltaY: number,
    sensitivity = 0.005,
  ) {
    this.setInteractionState({
      mode: "sceneOrbit",
      inputOwner: "camera",
    });

    this.azimuth -= deltaX * sensitivity;

    this.polar = THREE.MathUtils.clamp(
      this.polar - deltaY * sensitivity,
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

  restoreOverview() {
    this.setInteractionState({
      mode: "returning",
      selectedId: null,
      inputOwner: "guided",
    });

    this.distance =
      ASTRA_OVERVIEW_CAMERA.distance;

    this.azimuth =
      ASTRA_OVERVIEW_CAMERA.azimuth;

    this.polar =
      ASTRA_OVERVIEW_CAMERA.polar;

    this.target.copy(
      createAstraOverviewTarget(),
    );

    this.apply();

    this.setInteractionState({
      mode: "overview",
      selectedId: null,
      inputOwner: "earth",
    });
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