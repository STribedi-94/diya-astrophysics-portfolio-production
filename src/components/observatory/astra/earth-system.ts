import * as THREE from "three";

import { imageService } from "@/services/images";

export const EARTH_RADIUS = 1;

/**
 * Shared world-space Sun direction for Project Diya Astra.
 *
 * Earth illumination, spacecraft lighting, solar-panel response,
 * and future Sun-related systems must use this same normalized vector
 * so that day/night behaviour remains visually coherent.
 */
export const ASTRA_SUN_DIRECTION = new THREE.Vector3(
  0.35,
  0.3,
  1,
).normalize();

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

    const sunDirection =
    ASTRA_SUN_DIRECTION.clone();

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

    vertexShader: `
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
    `,

    fragmentShader: `
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
    `,
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

      vertexShader: `
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
      `,

      fragmentShader: `
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
      `,
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
