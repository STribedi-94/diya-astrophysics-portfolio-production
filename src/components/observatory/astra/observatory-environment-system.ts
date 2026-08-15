import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { assetUrl } from "@/config/assets";

import {
  type ObservatoryLightingPhase,
} from "./observatory-destinations";

import type {
  GroundObservatoryId,
} from "./observatory-registry";

export type ObservatoryEnvironmentSystemOptions = {
  scene: THREE.Scene;
  observatoryId: GroundObservatoryId;
};

export type ObservatoryEnvironmentSystem = {
  observatoryId: GroundObservatoryId;
  group: THREE.Group;
  facilityAnchor: THREE.Object3D;
  setVisible(visible: boolean): void;
  setLightingPhase(phase: ObservatoryLightingPhase): void;
  isReady(): boolean;
  hasLoadError(): boolean;
  dispose(): void;
};

type ObservatoryModelProfile = {
  url: string;
  desiredFocalHorizontalDiameter: number;
  selectFocalObjects(root: THREE.Object3D): THREE.Object3D[];
};

const MODEL_PROFILES: Readonly<
  Record<GroundObservatoryId, ObservatoryModelProfile>
> = Object.freeze({
  dot: {
    url: assetUrl("observatories/3d/dot-facility-web-safe-v2.glb"),
    desiredFocalHorizontalDiameter: 2.6,
    selectFocalObjects(root) {
      const matches: THREE.Object3D[] = [];

      root.traverse((object) => {
        if (
          object.name === "DOT_TelescopeEnclosure" ||
          object.name.startsWith("DOT_DomeRib_") ||
          object.name.startsWith("DOT_DomeSeam_")
        ) {
          matches.push(object);
        }
      });

      return matches;
    },
  },

  hct: {
    url: assetUrl("observatories/3d/hct-facility-web-safe-v1.glb"),
    desiredFocalHorizontalDiameter: 3.8,
    selectFocalObjects(root) {
      const matches: THREE.Object3D[] = [];

      root.traverse((object) => {
        if (
          object.name === "HCT_Main_Building" ||
          object.name === "HCT_Dome_Slit" ||
          object.name.startsWith("HCT_Dome_Seam_") ||
          object.name.startsWith("HCT_Dome_Shutter_Rail_")
        ) {
          matches.push(object);
        }
      });

      return matches;
    },
  },

  ugmrt: {
    url: assetUrl("observatories/3d/ugmrt-facility-web-safe-v1.glb"),
    desiredFocalHorizontalDiameter: 18.0,
    selectFocalObjects(root) {
      const matches: THREE.Object3D[] = [];
      const pattern = /^UGMRT_45m_Mesh_Reflector(?:\.\d+)?$/;

      root.traverse((object) => {
        if (pattern.test(object.name)) {
          matches.push(object);
        }
      });

      return matches;
    },
  },
});

function getObjectBounds(
  objects: THREE.Object3D[],
) {
  const box = new THREE.Box3();
  let initialized = false;

  for (const object of objects) {
    const objectBox = new THREE.Box3()
      .setFromObject(object);

    if (objectBox.isEmpty()) {
      continue;
    }

    if (!initialized) {
      box.copy(objectBox);
      initialized = true;
    } else {
      box.union(objectBox);
    }
  }

  return initialized
    ? box
    : null;
}

function getHorizontalDiameter(
  box: THREE.Box3,
) {
  const size = box.getSize(
    new THREE.Vector3(),
  );

  return Math.hypot(
    size.x,
    size.z,
  );
}

function disposeLoadedObject(
  root: THREE.Object3D,
) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return;
    }

    geometries.add(object.geometry);

    const meshMaterials = Array.isArray(
      object.material,
    )
      ? object.material
      : [object.material];

    for (const material of meshMaterials) {
      materials.add(material);

      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) {
          textures.add(value);
        }
      }
    }
  });

  for (const texture of textures) {
    texture.dispose();
  }

  for (const material of materials) {
    material.dispose();
  }

  for (const geometry of geometries) {
    geometry.dispose();
  }
}

function getLighting(
  phase: ObservatoryLightingPhase,
) {
  switch (phase) {
    case "day":
      return {
        key: new THREE.Color(0xfff4df),
        keyIntensity: 2.35,
        hemisphere: 1.15,
        fill: 0.42,
      };

    case "golden-hour":
      return {
        key: new THREE.Color(0xffba76),
        keyIntensity: 1.95,
        hemisphere: 0.88,
        fill: 0.34,
      };

    case "sunset":
      return {
        key: new THREE.Color(0xff845d),
        keyIntensity: 1.45,
        hemisphere: 0.66,
        fill: 0.28,
      };

    case "twilight":
      return {
        key: new THREE.Color(0x8ca7ff),
        keyIntensity: 0.86,
        hemisphere: 0.52,
        fill: 0.24,
      };

    case "blue-hour":
      return {
        key: new THREE.Color(0x6c8cff),
        keyIntensity: 0.62,
        hemisphere: 0.42,
        fill: 0.20,
      };

    case "night":
      return {
        key: new THREE.Color(0x5065a9),
        keyIntensity: 0.30,
        hemisphere: 0.24,
        fill: 0.16,
      };
  }
}

export function createObservatoryEnvironmentSystem({
  scene,
  observatoryId,
}: ObservatoryEnvironmentSystemOptions): ObservatoryEnvironmentSystem {
  const profile =
    MODEL_PROFILES[observatoryId];

  const group = new THREE.Group();
  group.name =
    `astra-environment-${observatoryId}`;
  group.visible = false;
  group.position.set(
    0,
    -50,
    0,
  );
  scene.add(group);

  /*
   * The accepted GLB is normalized around its measured scientific/facility
   * focal target. Camera paths therefore operate in one predictable LOCAL
   * destination coordinate system even though the raw Blender assets have
   * radically different scales (DOT campus, HCT plateau, uGMRT array).
   */
  const contentRoot = new THREE.Group();
  contentRoot.name =
    `astra-environment-content-${observatoryId}`;
  group.add(contentRoot);

  const facilityAnchor =
    new THREE.Object3D();
  facilityAnchor.name =
    `astra-${observatoryId}-facility-anchor`;
  facilityAnchor.position.set(
    0,
    0,
    0,
  );
  group.add(facilityAnchor);

  const hemisphere =
    new THREE.HemisphereLight(
      0xcad9ff,
      0x332b22,
      1.15,
    );
  group.add(hemisphere);

  const keyLight =
    new THREE.DirectionalLight(
      0xfff4df,
      2.35,
    );
  keyLight.position.set(
    -18,
    30,
    22,
  );
  group.add(keyLight);

  const fillLight =
    new THREE.DirectionalLight(
      0x9ebdff,
      0.42,
    );
  fillLight.position.set(
    18,
    14,
    -20,
  );
  group.add(fillLight);

  let disposed = false;
  let ready = false;
  let loadError = false;
  let loadedRoot:
    THREE.Object3D | null = null;

  const applyLighting = (
    phase: ObservatoryLightingPhase,
  ) => {
    const lighting =
      getLighting(phase);

    keyLight.color.copy(
      lighting.key,
    );
    keyLight.intensity =
      lighting.keyIntensity;
    hemisphere.intensity =
      lighting.hemisphere;
    fillLight.intensity =
      lighting.fill;
  };

  applyLighting("day");

  const loader =
    new GLTFLoader();

  loader.load(
    profile.url,
    (gltf) => {
      if (disposed) {
        disposeLoadedObject(
          gltf.scene,
        );
        return;
      }

      loadedRoot =
        gltf.scene;
      loadedRoot.name =
        `astra-${observatoryId}-accepted-glb`;

      contentRoot.add(
        loadedRoot,
      );

      loadedRoot.updateWorldMatrix(
        true,
        true,
      );

      let focalObjects =
        profile.selectFocalObjects(
          loadedRoot,
        );

      /*
       * Defensive fallback: never leave the destination un-normalized if an
       * exporter changes object suffixes later. The full model remains usable,
       * but the console warning makes the regression visible during QA.
       */
      if (focalObjects.length === 0) {
        console.warn(
          `[Astra] ${observatoryId}: focal object selection failed; falling back to full GLB bounds.`,
        );

        focalObjects = [
          loadedRoot,
        ];
      }

      if (
        observatoryId === "ugmrt" &&
        focalObjects.length !== 30
      ) {
        console.warn(
          `[Astra] uGMRT: expected 30 reflector focal objects, found ${focalObjects.length}.`,
        );
      }

      const focalBounds =
        getObjectBounds(
          focalObjects,
        );

      if (!focalBounds) {
        loadError = true;
        console.error(
          `[Astra] ${observatoryId}: accepted GLB loaded but focal bounds could not be measured.`,
        );
        return;
      }

      const focalDiameter =
        Math.max(
          1e-6,
          getHorizontalDiameter(
            focalBounds,
          ),
        );

      const scale =
        profile.desiredFocalHorizontalDiameter /
        focalDiameter;

      const focalCenter =
        focalBounds.getCenter(
          new THREE.Vector3(),
        );

      loadedRoot.scale.setScalar(
        scale,
      );

      /*
       * Move the measured focal center to LOCAL (0, 0, 0). Scaling happens
       * around the GLB origin, so translation is multiplied by the same scale.
       */
      loadedRoot.position.set(
        -focalCenter.x * scale,
        -focalCenter.y * scale,
        -focalCenter.z * scale,
      );

      loadedRoot.updateWorldMatrix(
        true,
        true,
      );

      ready = true;

      const normalizedBounds =
        new THREE.Box3()
          .setFromObject(
            loadedRoot,
          );

      const normalizedSize =
        normalizedBounds.getSize(
          new THREE.Vector3(),
        );

      console.info(
        `[Astra] ${observatoryId} accepted GLB ready`,
        {
          url: profile.url,
          focalObjectCount:
            focalObjects.length,
          focalDiameter,
          scale,
          normalizedSize:
            normalizedSize.toArray(),
        },
      );
    },
    undefined,
    (error) => {
      if (disposed) {
        return;
      }

      loadError = true;
      console.error(
        `[Astra] Failed to load ${observatoryId} accepted GLB from ${profile.url}`,
        error,
      );
    },
  );

  return {
    observatoryId,
    group,
    facilityAnchor,

    setVisible(visible) {
      if (disposed) {
        return;
      }

      group.visible =
        visible;
    },

    setLightingPhase(phase) {
      if (disposed) {
        return;
      }

      applyLighting(
        phase,
      );
    },

    isReady() {
      return ready;
    },

    hasLoadError() {
      return loadError;
    },

    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      scene.remove(group);

      if (loadedRoot) {
        disposeLoadedObject(
          loadedRoot,
        );
      }

      group.clear();
      loadedRoot = null;
      ready = false;
    },
  };
}
