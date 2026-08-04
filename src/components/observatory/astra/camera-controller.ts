import * as THREE from "three";

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
  private mode: AstraCameraMode = "overview";

  constructor(
    camera: THREE.PerspectiveCamera,
    options: AstraCameraControllerOptions = {},
  ) {
    this.camera = camera;
    this.distance = options.initialDistance ?? 5.4;
    this.azimuth = options.initialAzimuth ?? 0;
    this.polar = options.initialPolar ?? Math.PI / 2 - 0.28;
    this.minDistance = options.minDistance ?? 3.2;
    this.maxDistance = options.maxDistance ?? 8.5;

    this.apply();
  }

  getMode() {
    return this.mode;
  }

  setMode(mode: AstraCameraMode) {
    this.mode = mode;
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
    this.mode = "sceneOrbit";

    this.azimuth -= deltaX * sensitivity;

    this.polar = THREE.MathUtils.clamp(
      this.polar - deltaY * sensitivity,
      0.55,
      Math.PI - 0.55,
    );

    this.apply();
  }

  zoomByScale(scale: number) {
    if (!Number.isFinite(scale) || scale <= 0) {
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

    this.zoomByScale(1 + direction * 0.08);
  }

  restoreOverview() {
    this.mode = "returning";

    this.distance = 5.4;
    this.azimuth = 0;
    this.polar = Math.PI / 2 - 0.28;
    this.target.set(0, 0, 0);

    this.apply();

    this.mode = "overview";
  }

  apply() {
    const sinPolar = Math.sin(this.polar);

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

    this.camera.lookAt(this.target);
  }
}
