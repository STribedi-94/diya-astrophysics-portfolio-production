import path from "node:path";

import {
  assertFile,
  backupFile,
  banner,
  ensureDirectory,
  exists,
  info,
  projectPaths,
  readText,
  replaceOnce,
  success,
  writeText,
} from "../../Utilities/safe-file-utils.mjs";

const CAMERA_CONTROLLER_FILE = path.join(
  projectPaths.astraComponents,
  "camera-controller.ts",
);

const BACKUP_DIRECTORY = path.join(
  projectPaths.toolBackups,
  "astra-core",
  "camera-controller",
);

const CAMERA_CONTROLLER_SOURCE = `import * as THREE from "three";

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
`;

const IMPORT_SEARCH =
  'import { imageService } from "@/services/images";';

const IMPORT_REPLACEMENT = `${IMPORT_SEARCH}
import { AstraCameraController } from "./astra/camera-controller";`;

const OLD_CAMERA_BLOCK = `    /* ---------------- camera orbit state ---------------- */
    let camDist = 5.4;
    let camAz = 0;
    let camPol = Math.PI / 2 - 0.28; // modest northern tilt
    const MIN_D = 3.2;
    const MAX_D = 8.5;

    function applyCamera() {
      camera.position.set(
        camDist * Math.sin(camPol) * Math.sin(camAz),
        camDist * Math.cos(camPol),
        camDist * Math.sin(camPol) * Math.cos(camAz),
      );
      camera.lookAt(0, 0, 0);
    }
    applyCamera();`;

const NEW_CAMERA_BLOCK = `    /* ---------------- Project Diya Astra camera controller ---------------- */
    const cameraController = new AstraCameraController(camera, {
      initialDistance: 5.4,
      initialAzimuth: 0,
      initialPolar: Math.PI / 2 - 0.28,
      minDistance: 3.2,
      maxDistance: 8.5,
    });`;

const OLD_PINCH_START = `        pinchStart = camDist;`;

const NEW_PINCH_START = `        pinchStart = cameraController.getDistance();`;

const OLD_PINCH_ZOOM = `        if (pinchDist > 0) camDist = THREE.MathUtils.clamp(pinchStart * (pinchDist / d), MIN_D, MAX_D);`;

const NEW_PINCH_ZOOM = `        if (pinchDist > 0) {
          cameraController.zoomToDistance(
            pinchStart * (pinchDist / d),
          );
        }`;

const OLD_DRAG_CAMERA = `        camAz -= dx * 0.005;
        camPol = THREE.MathUtils.clamp(camPol - dy * 0.005, 0.55, Math.PI - 0.55);
        applyCamera();`;

const NEW_DRAG_CAMERA = `        cameraController.orbit(dx, dy);`;

const OLD_WHEEL_ZOOM = `      camDist = THREE.MathUtils.clamp(camDist * (1 + Math.sign(e.deltaY) * 0.08), MIN_D, MAX_D);`;

const NEW_WHEEL_ZOOM = `      cameraController.zoomByWheel(e.deltaY);`;

function buildUpdatedGlobeScene(originalSource) {
  let updatedSource = originalSource;

  updatedSource = replaceOnce(
    updatedSource,
    IMPORT_SEARCH,
    IMPORT_REPLACEMENT,
    {
      label: "Image Service import",
    },
  );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_CAMERA_BLOCK,
    NEW_CAMERA_BLOCK,
    {
      label: "Existing camera state block",
    },
  );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_PINCH_START,
    NEW_PINCH_START,
    {
      label: "Pinch start distance assignment",
    },
  );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_PINCH_ZOOM,
    NEW_PINCH_ZOOM,
    {
      label: "Pinch zoom implementation",
    },
  );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_DRAG_CAMERA,
    NEW_DRAG_CAMERA,
    {
      label: "Pointer drag camera implementation",
    },
  );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_WHEEL_ZOOM,
    NEW_WHEEL_ZOOM,
    {
      label: "Wheel zoom implementation",
    },
  );

  return updatedSource;
}

function run() {
  banner("PROJECT DIYA ASTRA — CAMERA CONTROLLER BUILDER");

  assertFile(projectPaths.globeScene);

  info(`Repository: ${projectPaths.root}`);
  info(`GlobeScene: ${projectPaths.globeScene}`);

  ensureDirectory(projectPaths.astraComponents);
  ensureDirectory(BACKUP_DIRECTORY);

    const originalSource = readText(projectPaths.globeScene);

  const normalizedOriginalSource = originalSource.replace(
    /\r\n/g,
    "\n",
  );

  if (
        normalizedOriginalSource.includes(
      'import { AstraCameraController } from "./astra/camera-controller";',
    )
  ) {
    throw new Error(
      "Astra Camera Controller integration already exists in GlobeScene.tsx.",
    );
  }

  const backupPath = backupFile(
    projectPaths.globeScene,
    BACKUP_DIRECTORY,
    {
      suffix: "pre-astra-camera",
    },
  );

  info(`Backup created: ${backupPath}`);

   if (exists(CAMERA_CONTROLLER_FILE)) {
    const existingControllerSource = readText(
      CAMERA_CONTROLLER_FILE,
    ).replace(/\r\n/g, "\n");

    if (
      existingControllerSource.trim() !==
      CAMERA_CONTROLLER_SOURCE.trim()
    ) {
      throw new Error(
        [
          "An unexpected camera-controller.ts already exists.",
          "The builder will not overwrite it automatically.",
          "",
          CAMERA_CONTROLLER_FILE,
        ].join("\n"),
      );
    }

    info(
      "Existing camera-controller.ts matches the approved source.",
    );
  } else {
    writeText(
      CAMERA_CONTROLLER_FILE,
      CAMERA_CONTROLLER_SOURCE,
      {
        overwrite: false,
        lineEnding: "lf",
      },
    );

    success(
      `Created camera controller:\n${CAMERA_CONTROLLER_FILE}`,
    );
  }

  const updatedSource = buildUpdatedGlobeScene(
    normalizedOriginalSource,
  );

  writeText(
    projectPaths.globeScene,
    updatedSource,
    {
      overwrite: true,
      lineEnding: "lf",
    },
  );

  success("GlobeScene.tsx camera integration completed.");

  console.log("");
  console.log("Created:");
  console.log(
    path.relative(
      projectPaths.root,
      CAMERA_CONTROLLER_FILE,
    ),
  );

  console.log("");
  console.log("Modified:");
  console.log(
    path.relative(
      projectPaths.root,
      projectPaths.globeScene,
    ),
  );

  console.log("");
  console.log("Next verification:");
  console.log("npm run build");
}

try {
  run();
} catch (error) {
  console.error("");
  console.error("Astra Camera Controller Builder failed.");
  console.error(
    error instanceof Error
      ? error.stack ?? error.message
      : String(error),
  );
  process.exitCode = 1;
}