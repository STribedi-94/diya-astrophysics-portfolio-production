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

const EARTH_SYSTEM_FILE = path.join(
  projectPaths.astraComponents,
  "earth-system.ts",
);

const BACKUP_DIRECTORY = path.join(
  projectPaths.toolBackups,
  "astra-core",
  "earth-system",
);

const EARTH_SYSTEM_SOURCE = `import * as THREE from "three";

import { imageService } from "@/services/images";

export const EARTH_RADIUS = 1;

export type EarthSystemOptions = {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  onReady: () => void;
  isDisposed: () => boolean;
};

export type EarthSystem = {
  group: THREE.Group;
  uniforms: {
    dayMap: { value: THREE.Texture | null };
    nightMap: { value: THREE.Texture | null };
    sunDir: { value: THREE.Vector3 };
    reveal: { value: number };
  };
  atmosphereMaterial: THREE.ShaderMaterial;
  dispose: () => void;
};

function createFallbackTexture(
  key: "dayMap" | "nightMap",
) {
  const canvas = document.createElement("canvas");

  canvas.width = 4;
  canvas.height = 4;

  const context = canvas.getContext("2d");

  if (context) {
    context.fillStyle =
      key === "dayMap"
        ? "#1b3a5c"
        : "#000010";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }

  return new THREE.CanvasTexture(canvas);
}

export function createEarthSystem({
  scene,
  renderer,
  onReady,
  isDisposed,
}: EarthSystemOptions): EarthSystem {
  const disposables: Array<{
    dispose: () => void;
  }> = [];

  const sunDirection = new THREE.Vector3(
    0.35,
    0.3,
    1,
  ).normalize();

  const group = new THREE.Group();

  scene.add(group);

  const earthGeometry = new THREE.SphereGeometry(
    EARTH_RADIUS,
    64,
    48,
  );

  const uniforms = {
    dayMap: {
      value: null as THREE.Texture | null,
    },

    nightMap: {
      value: null as THREE.Texture | null,
    },

    sunDir: {
      value: sunDirection.clone(),
    },

    reveal: {
      value: 0,
    },
  };

  const earthMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,

    vertexShader: \`
      varying vec2 vUv;
      varying vec3 vN;

      void main() {
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    \`,

    fragmentShader: \`
      uniform sampler2D dayMap;
      uniform sampler2D nightMap;
      uniform vec3 sunDir;
      uniform float reveal;

      varying vec2 vUv;
      varying vec3 vN;

      void main() {
        vec3 day =
          texture2D(dayMap, vUv).rgb;

        vec3 night =
          texture2D(nightMap, vUv).rgb;

        float daylight =
          dot(
            normalize(vN),
            normalize(sunDir)
          );

        float illuminated =
          smoothstep(
            -0.18,
            0.22,
            daylight
          );

        vec3 color =
          mix(
            night * 0.6 + day * 0.12,
            day *
              (
                0.75 +
                0.7 *
                  max(daylight, 0.0)
              ),
            illuminated
          );

        gl_FragColor =
          vec4(color, reveal);
      }
    \`,
  });

  const earthMesh = new THREE.Mesh(
    earthGeometry,
    earthMaterial,
  );

  group.add(earthMesh);

  disposables.push(
    earthGeometry,
    earthMaterial,
  );

  const atmosphereGeometry =
    new THREE.SphereGeometry(
      EARTH_RADIUS * 1.035,
      48,
      32,
    );

  const atmosphereMaterial =
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,

      uniforms: {
        reveal: {
          value: 0,
        },
      },

      vertexShader: \`
        varying vec3 vN;
        varying vec3 vP;

        void main() {
          vN =
            normalize(
              mat3(modelMatrix) *
              normal
            );

          vec4 worldPosition =
            modelMatrix *
            vec4(position, 1.0);

          vP = worldPosition.xyz;

          gl_Position =
            projectionMatrix *
            viewMatrix *
            worldPosition;
        }
      \`,

      fragmentShader: \`
        varying vec3 vN;
        varying vec3 vP;

        uniform float reveal;

        void main() {
          vec3 viewDirection =
            normalize(
              cameraPosition -
              vP
            );

          float intensity =
            pow(
              1.0 -
                abs(
                  dot(
                    viewDirection,
                    normalize(vN)
                  )
                ),
              3.0
            );

          gl_FragColor =
            vec4(
              vec3(
                0.32,
                0.55,
                0.95
              ) *
                intensity *
                1.25,
              intensity *
                reveal
            );
        }
      \`,
    });

  const atmosphereMesh = new THREE.Mesh(
    atmosphereGeometry,
    atmosphereMaterial,
  );

  scene.add(atmosphereMesh);

  disposables.push(
    atmosphereGeometry,
    atmosphereMaterial,
  );

  const textureLoader =
    new THREE.TextureLoader();

  let loadedTextureCount = 0;

  function finishTexture() {
    loadedTextureCount += 1;

    if (
      loadedTextureCount === 2 &&
      !isDisposed()
    ) {
      onReady();
    }
  }

  function loadTexture(
    url: string,
    key: "dayMap" | "nightMap",
  ) {
    textureLoader.load(
      url,

      (texture) => {
        if (isDisposed()) {
          texture.dispose();
          return;
        }

        texture.colorSpace =
          THREE.SRGBColorSpace;

        texture.anisotropy =
          Math.min(
            4,
            renderer.capabilities
              .getMaxAnisotropy(),
          );

        uniforms[key].value =
          texture;

        disposables.push(texture);

        finishTexture();
      },

      undefined,

      () => {
        if (isDisposed()) {
          return;
        }

        const fallbackTexture =
          createFallbackTexture(key);

        uniforms[key].value =
          fallbackTexture;

        disposables.push(
          fallbackTexture,
        );

        finishTexture();
      },
    );
  }

  loadTexture(
    imageService.getRequiredImage(
      "earth-day-texture",
    ).imageUrl,

    "dayMap",
  );

  loadTexture(
    imageService.getRequiredImage(
      "earth-night-texture",
    ).imageUrl,

    "nightMap",
  );

  return {
    group,
    uniforms,
    atmosphereMaterial,

    dispose() {
      group.remove(earthMesh);
      scene.remove(group);
      scene.remove(atmosphereMesh);

      for (const disposable of disposables) {
        disposable.dispose();
      }
    },
  };
}
`;

const OLD_IMPORT = `import { imageService } from "@/services/images";
import { AstraCameraController } from "./astra/camera-controller";`;

const NEW_IMPORT = `import { AstraCameraController } from "./astra/camera-controller";
import {
  createEarthSystem,
  EARTH_RADIUS,
} from "./astra/earth-system";`;

const OLD_EARTH_RADIUS = `const EARTH_R = 1;
`;

const OLD_EARTH_BLOCK = `    /* ---------------- earth ---------------- */
    const sunDir = new THREE.Vector3(0.35, 0.3, 1.0).normalize();
    const earthGroup = new THREE.Group();
    earthGroup.rotation.y = facingRotation(78);
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    const earthGeo = new THREE.SphereGeometry(EARTH_R, 64, 48);
    const earthUniforms = {
      dayMap: { value: null as THREE.Texture | null },
      nightMap: { value: null as THREE.Texture | null },
      sunDir: { value: sunDir.clone() },
      reveal: { value: 0 },
    };
    const earthMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      transparent: true,
      vertexShader: \`
        varying vec2 vUv; varying vec3 vN;
        void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }\`,
      fragmentShader: \`
        uniform sampler2D dayMap; uniform sampler2D nightMap;
        uniform vec3 sunDir; uniform float reveal;
        varying vec2 vUv; varying vec3 vN;
        void main(){
          vec3 day = texture2D(dayMap, vUv).rgb;
          vec3 night = texture2D(nightMap, vUv).rgb;
          float d = dot(normalize(vN), normalize(sunDir));
          float lit = smoothstep(-0.18, 0.22, d);
          vec3 col = mix(night*0.6 + day*0.12, day*(0.75+0.7*max(d,0.0)), lit);
          gl_FragColor = vec4(col, reveal);
        }\`,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);
    disposables.push(earthGeo, earthMat);

    let texLoaded = 0;
    const finishTex = () => {
      texLoaded++;
      if (texLoaded === 2 && !disposed) onReady();
    };
    const loadTex = (url: string, key: "dayMap" | "nightMap") => {
      loader.load(
        url,
        (t) => {
          if (disposed) {
            t.dispose();
            return;
          }
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          earthUniforms[key].value = t;
          disposables.push(t);
          finishTex();
        },
        undefined,
        () => {
          if (disposed) return;
          // Missing texture must not blank the scene — fall back to a flat marble.
          const c = document.createElement("canvas");
          c.width = c.height = 4;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.fillStyle = key === "dayMap" ? "#1b3a5c" : "#000010";
            ctx.fillRect(0, 0, 4, 4);
          }
          const t = new THREE.CanvasTexture(c);
          earthUniforms[key].value = t;
          disposables.push(t);
          finishTex();
        },
      );
    };
    loadTex(imageService.getRequiredImage("earth-day-texture").imageUrl, "dayMap");
    loadTex(imageService.getRequiredImage("earth-night-texture").imageUrl, "nightMap");

    // Atmospheric rim
    const atmGeo = new THREE.SphereGeometry(EARTH_R * 1.035, 48, 32);
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { reveal: { value: 0 } },
      vertexShader: \`varying vec3 vN; varying vec3 vP;
        void main(){ vN=normalize(mat3(modelMatrix)*normal);
          vec4 wp=modelMatrix*vec4(position,1.0); vP=wp.xyz;
          gl_Position=projectionMatrix*viewMatrix*wp; }\`,
      fragmentShader: \`varying vec3 vN; varying vec3 vP; uniform float reveal;
        void main(){
          vec3 v=normalize(cameraPosition-vP);
          float f=pow(1.0-abs(dot(v,normalize(vN))),3.0);
          gl_FragColor=vec4(vec3(0.32,0.55,0.95)*f*1.25, f*reveal);
        }\`,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));
    disposables.push(atmGeo, atmMat);`;

const NEW_EARTH_BLOCK = `    /* ---------------- Project Diya Astra Earth system ---------------- */
    const earthSystem = createEarthSystem({
      scene,
      renderer,
      onReady,
      isDisposed: () => disposed,
    });

    const earthGroup = earthSystem.group;
    const earthUniforms = earthSystem.uniforms;
    const atmMat = earthSystem.atmosphereMaterial;

    earthGroup.rotation.y =
      facingRotation(78);

    disposables.push(earthSystem);`;

function createEarthSystemFile() {
  if (exists(EARTH_SYSTEM_FILE)) {
    const existingSource = readText(
      EARTH_SYSTEM_FILE,
    ).replace(/\r\n/g, "\n");

    if (
      existingSource.trim() !==
      EARTH_SYSTEM_SOURCE.trim()
    ) {
      throw new Error(
        [
          "An unexpected earth-system.ts already exists.",
          "The builder will not overwrite it.",
          "",
          EARTH_SYSTEM_FILE,
        ].join("\n"),
      );
    }

    info(
      "Existing earth-system.ts matches the approved source.",
    );

    return;
  }

  writeText(
    EARTH_SYSTEM_FILE,
    EARTH_SYSTEM_SOURCE,
    {
      overwrite: false,
      lineEnding: "lf",
    },
  );

  success(
    `Created Earth system:\n${EARTH_SYSTEM_FILE}`,
  );
}

function buildUpdatedGlobeScene(
  originalSource,
) {
  let updatedSource =
    originalSource.replace(
      /\r\n/g,
      "\n",
    );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_IMPORT,
    NEW_IMPORT,
    {
      label:
        "Camera Controller and Image Service imports",
    },
  );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_EARTH_RADIUS,
    "",
    {
      label: "Legacy Earth radius constant",
    },
  );

  updatedSource = replaceOnce(
    updatedSource,
    OLD_EARTH_BLOCK,
    NEW_EARTH_BLOCK,
    {
      label:
        "Legacy inline Earth rendering system",
    },
  );

    updatedSource = replaceOnce(
    updatedSource,
    "latLonToVec3(node.lat!, node.lon!, EARTH_R)",
    "latLonToVec3(node.lat!, node.lon!, EARTH_RADIUS)",
    {
      label:
        "Ground-marker Earth radius reference",
    },
  );

  return updatedSource;
}

function run() {
  banner(
    "PROJECT DIYA ASTRA — EARTH SYSTEM BUILDER",
  );

  assertFile(projectPaths.globeScene);

  info(`Repository: ${projectPaths.root}`);
  info(
    `GlobeScene: ${projectPaths.globeScene}`,
  );

  ensureDirectory(
    projectPaths.astraComponents,
  );

  ensureDirectory(
    BACKUP_DIRECTORY,
  );

  const originalSource = readText(
    projectPaths.globeScene,
  );

  const normalizedSource =
    originalSource.replace(
      /\r\n/g,
      "\n",
    );

  if (
    normalizedSource.includes(
      'from "./astra/earth-system"',
    )
  ) {
    throw new Error(
      "Astra Earth System integration already exists in GlobeScene.tsx.",
    );
  }

  const backupPath = backupFile(
    projectPaths.globeScene,
    BACKUP_DIRECTORY,
    {
      suffix:
        "pre-astra-earth-system",
    },
  );

  info(
    `Backup created: ${backupPath}`,
  );

  createEarthSystemFile();

  const updatedSource =
    buildUpdatedGlobeScene(
      normalizedSource,
    );

  writeText(
    projectPaths.globeScene,
    updatedSource,
    {
      overwrite: true,
      lineEnding: "lf",
    },
  );

  success(
    "GlobeScene.tsx Earth System integration completed.",
  );

  console.log("");
  console.log("Created:");
  console.log(
    path.relative(
      projectPaths.root,
      EARTH_SYSTEM_FILE,
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
  console.error(
    "Astra Earth System Builder failed.",
  );

  console.error(
    error instanceof Error
      ? error.stack ?? error.message
      : String(error),
  );

  process.exitCode = 1;
}