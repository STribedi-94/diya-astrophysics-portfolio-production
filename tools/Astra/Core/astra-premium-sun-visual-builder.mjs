import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);

const repositoryRoot = path.resolve(
  path.dirname(currentFile),
  "..",
  "..",
  "..",
);

const sunSystemPath = path.join(
  repositoryRoot,
  "src",
  "components",
  "observatory",
  "astra",
  "sun-system.ts",
);

const backupDirectory = path.join(
  repositoryRoot,
  ".astra-backup",
);

function log(message) {
  console.log(
    `[Astra Premium Sun Visual Builder v2] ${message}`,
  );
}

function fail(message) {
  console.error(
    `\n[Astra Premium Sun Visual Builder v2] ERROR: ${message}\n`,
  );

  process.exit(1);
}

function replaceSection(
  source,
  startMarker,
  endMarker,
  replacement,
  description,
) {
  const startIndex =
    source.indexOf(startMarker);

  if (startIndex === -1) {
    fail(
      `Could not find start marker for ${description}.`,
    );
  }

  const endIndex =
    source.indexOf(
      endMarker,
      startIndex,
    );

  if (endIndex === -1) {
    fail(
      `Could not find end marker for ${description}.`,
    );
  }

  return (
    source.slice(0, startIndex) +
    replacement +
    "\n\n" +
    source.slice(endIndex)
  );
}

function replaceExactlyOnce(
  source,
  searchValue,
  replacement,
  description,
) {
  const firstIndex =
    source.indexOf(searchValue);

  if (firstIndex === -1) {
    fail(
      `Could not find expected source block: ${description}.`,
    );
  }

  const secondIndex =
    source.indexOf(
      searchValue,
      firstIndex +
        searchValue.length,
    );

  if (secondIndex !== -1) {
    fail(
      `Expected exactly one source block for ${description}.`,
    );
  }

  return source.replace(
    searchValue,
    replacement,
  );
}

function createBackup(source) {
  fs.mkdirSync(
    backupDirectory,
    {
      recursive: true,
    },
  );

  const timestamp =
    new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

  const backupPath =
    path.join(
      backupDirectory,
      `sun-system.before-phase-4.3-v2.${timestamp}.ts`,
    );

  fs.writeFileSync(
    backupPath,
    source,
    "utf8",
  );

  log(
    `Backup created:\n${backupPath}`,
  );
}

const premiumMaterialFunctions =
  String.raw`function createSunDiskMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,

    uniforms: {
      time: {
        value: 0,
      },

      opacity: {
        value: 1,
      },
    },

    vertexShader: \`
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    \`,

    fragmentShader: \`
      uniform float time;
      uniform float opacity;

      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(
          p *
          vec2(
            123.34,
            456.21
          )
        );

        p += dot(
          p,
          p + 45.32
        );

        return fract(
          p.x * p.y
        );
      }

      float valueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        f =
          f *
          f *
          (
            3.0 -
            2.0 *
            f
          );

        return mix(
          mix(
            hash21(i),
            hash21(
              i +
              vec2(
                1.0,
                0.0
              )
            ),
            f.x
          ),

          mix(
            hash21(
              i +
              vec2(
                0.0,
                1.0
              )
            ),

            hash21(
              i +
              vec2(
                1.0,
                1.0
              )
            ),

            f.x
          ),

          f.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;

        for (
          int octave = 0;
          octave < 5;
          octave++
        ) {
          value +=
            amplitude *
            valueNoise(p);

          p =
            mat2(
              1.61,
              1.17,
              -1.17,
              1.61
            ) *
            p +
            vec2(
              11.7,
              7.3
            );

          amplitude *= 0.5;
        }

        return value;
      }

      float ridge(
        float value
      ) {
        return
          1.0 -
          abs(
            value *
            2.0 -
            1.0
          );
      }

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float radius =
          length(centered) *
          2.0;

        if (
          radius >
          1.0
        ) {
          discard;
        }

        float hemisphere =
          sqrt(
            max(
              0.0,
              1.0 -
              radius *
              radius
            )
          );

        float slowTime =
          time *
          0.014;

        vec2 projectedSurface =
          centered *
          (
            11.5 +
            hemisphere *
            3.0
          );

        vec2 warp =
          vec2(
            fbm(
              projectedSurface *
              0.24 +
              vec2(
                slowTime,
                -slowTime *
                0.61
              )
            ),

            fbm(
              projectedSurface *
              0.24 +
              vec2(
                -slowTime *
                0.47,
                slowTime
              ) +
              19.4
            )
          );

        vec2 surfaceUv =
          projectedSurface +
          (
            warp -
            0.5
          ) *
          1.35;

        float convectionLarge =
          fbm(
            surfaceUv *
            0.5 +
            vec2(
              slowTime *
              0.34,
              0.0
            )
          );

        float convectionMedium =
          fbm(
            surfaceUv *
            1.32 -
            vec2(
              0.0,
              slowTime *
              0.48
            )
          );

        float cellularFine =
          ridge(
            valueNoise(
              surfaceUv *
              4.4 +
              vec2(
                slowTime *
                0.72,
                -slowTime *
                0.58
              )
            )
          );

        float intergranular =
          ridge(
            fbm(
              surfaceUv *
              2.4 +
              vec2(
                -slowTime *
                0.4,
                slowTime *
                0.28
              )
            )
          );

        float granulation =
          convectionLarge *
          0.34 +
          convectionMedium *
          0.28 +
          cellularFine *
          0.24 +
          intergranular *
          0.14;

        float magneticField =
          fbm(
            surfaceUv *
            0.16 +
            vec2(
              -slowTime *
              0.12,
              slowTime *
              0.09
            ) +
            33.0
          );

        float magneticRegions =
          smoothstep(
            0.72,
            0.9,
            magneticField
          );

        float facularNetwork =
          smoothstep(
            0.57,
            0.8,
            convectionMedium
          ) *
          smoothstep(
            0.28,
            0.9,
            radius
          );

        vec3 deepLimb =
          vec3(
            0.78,
            0.11,
            0.01
          );

        vec3 orange =
          vec3(
            1.0,
            0.34,
            0.025
          );

        vec3 gold =
          vec3(
            1.0,
            0.69,
            0.16
          );

        vec3 warmInterior =
          vec3(
            1.0,
            0.84,
            0.38
          );

        vec3 color =
          mix(
            deepLimb,
            orange,
            pow(
              hemisphere,
              0.28
            )
          );

        color =
          mix(
            color,
            gold,
            pow(
              hemisphere,
              0.7
            ) *
            0.78
          );

        color =
          mix(
            color,
            warmInterior,
            pow(
              hemisphere,
              2.2
            ) *
            0.38
          );

        float contrast =
          (
            granulation -
            0.5
          ) *
          0.42;

        color *=
          1.0 +
          contrast;

        color +=
          facularNetwork *
          vec3(
            0.17,
            0.07,
            0.008
          );

        color *=
          1.0 -
          magneticRegions *
          0.16;

        float limbDarkening =
          0.48 +
          0.52 *
          pow(
            hemisphere,
            0.44
          );

        color *=
          limbDarkening;

        float edgeSoftness =
          smoothstep(
            1.0,
            0.975,
            radius
          );

        float limbEmission =
          smoothstep(
            0.84,
            0.99,
            radius
          ) *
          (
            1.0 -
            smoothstep(
              0.975,
              1.0,
              radius
            )
          );

        color +=
          limbEmission *
          vec3(
            0.23,
            0.055,
            0.006
          );

        gl_FragColor =
          vec4(
            color *
            1.24,
            edgeSoftness *
            opacity
          );
      }
    \`,
  });
}

function createChromosphereMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending:
      THREE.AdditiveBlending,
    toneMapped: false,

    uniforms: {
      time: {
        value: 0,
      },
    },

    vertexShader: \`
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    \`,

    fragmentShader: \`
      uniform float time;

      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(
          p *
          vec2(
            127.1,
            311.7
          )
        );

        p += dot(
          p,
          p + 34.5
        );

        return fract(
          p.x *
          p.y
        );
      }

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float radius =
          length(centered) *
          2.0;

        if (
          radius >
          1.0 ||
          radius <
          0.68
        ) {
          discard;
        }

        float angle =
          atan(
            centered.y,
            centered.x
          );

        float irregularity =
          sin(
            angle *
            15.0 +
            time *
            0.041
          ) *
          0.022 +
          sin(
            angle *
            29.0 -
            time *
            0.027
          ) *
          0.012 +
          (
            hash21(
              vec2(
                floor(
                  angle *
                  24.0
                ),
                9.0
              )
            ) -
            0.5
          ) *
          0.015;

        float innerEdge =
          0.76 +
          irregularity;

        float outerEdge =
          0.985 +
          irregularity *
          0.42;

        float ring =
          smoothstep(
            innerEdge,
            0.91 +
            irregularity,
            radius
          ) *
          (
            1.0 -
            smoothstep(
              outerEdge,
              1.0,
              radius
            )
          );

        float prominenceSeed =
          max(
            0.0,
            sin(
              angle *
              5.0 -
              time *
              0.018
            )
          ) *
          max(
            0.0,
            sin(
              angle *
              8.0 +
              1.7
            )
          );

        float prominence =
          pow(
            prominenceSeed,
            9.0
          ) *
          smoothstep(
            0.88,
            1.0,
            radius
          );

        float filament =
          pow(
            max(
              0.0,
              sin(
                angle *
                19.0 +
                time *
                0.024
              )
            ),
            16.0
          ) *
          ring;

        vec3 color =
          mix(
            vec3(
              1.0,
              0.11,
              0.008
            ),
            vec3(
              1.0,
              0.48,
              0.045
            ),
            ring
          );

        float alpha =
          ring *
          0.34 +
          prominence *
          0.17 +
          filament *
          0.06;

        gl_FragColor =
          vec4(
            color *
            alpha,
            alpha
          );
      }
    \`,
  });
}

function createCoronaMaterial(
  options: {
    color:
      THREE.ColorRepresentation;
    intensity: number;
    falloff: number;
    streamerScale: number;
    polarBias: number;
  }
) {
  const {
    color,
    intensity,
    falloff,
    streamerScale,
    polarBias,
  } = options;

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending:
      THREE.AdditiveBlending,
    toneMapped: false,

    uniforms: {
      color: {
        value:
          new THREE.Color(
            color,
          ),
      },

      intensity: {
        value:
          intensity,
      },

      falloff: {
        value:
          falloff,
      },

      streamerScale: {
        value:
          streamerScale,
      },

      polarBias: {
        value:
          polarBias,
      },

      time: {
        value: 0,
      },
    },

    vertexShader: \`
      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position =
          projectionMatrix *
          modelViewMatrix *
          vec4(position, 1.0);
      }
    \`,

    fragmentShader: \`
      uniform vec3 color;
      uniform float intensity;
      uniform float falloff;
      uniform float streamerScale;
      uniform float polarBias;
      uniform float time;

      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(
          p *
          vec2(
            123.34,
            456.21
          )
        );

        p += dot(
          p,
          p + 45.32
        );

        return fract(
          p.x *
          p.y
        );
      }

      float valueNoise(vec2 p) {
        vec2 i =
          floor(p);

        vec2 f =
          fract(p);

        f =
          f *
          f *
          (
            3.0 -
            2.0 *
            f
          );

        return mix(
          mix(
            hash21(i),
            hash21(
              i +
              vec2(
                1.0,
                0.0
              )
            ),
            f.x
          ),

          mix(
            hash21(
              i +
              vec2(
                0.0,
                1.0
              )
            ),

            hash21(
              i +
              vec2(
                1.0,
                1.0
              )
            ),

            f.x
          ),

          f.y
        );
      }

      void main() {
        vec2 centered =
          vUv -
          vec2(0.5);

        float radius =
          length(centered) *
          2.0;

        if (
          radius >
          1.0
        ) {
          discard;
        }

        float angle =
          atan(
            centered.y,
            centered.x
          );

        float radial =
          pow(
            max(
              0.0,
              1.0 -
              radius
            ),
            falloff
          );

        float drift =
          time *
          0.012;

        float angularNoise =
          valueNoise(
            vec2(
              angle *
              3.6 +
              drift,

              radius *
              6.0 -
              drift *
              0.7
            )
          );

        float equatorial =
          pow(
            abs(
              cos(angle)
            ),
            1.45
          );

        float polar =
          pow(
            abs(
              sin(angle)
            ),
            2.25
          );

        float broadStreamers =
          0.5 +
          0.5 *
          sin(
            angle *
            5.0 +
            angularNoise *
            3.6 +
            drift
          );

        broadStreamers =
          pow(
            broadStreamers,
            3.6
          );

        float intermediateStreamers =
          0.5 +
          0.5 *
          sin(
            angle *
            11.0 -
            radius *
            7.0 -
            drift *
            1.25
          );

        intermediateStreamers =
          pow(
            intermediateStreamers,
            6.5
          );

        float fineStreamers =
          0.5 +
          0.5 *
          sin(
            angle *
            23.0 +
            radius *
            12.0 +
            drift *
            0.8
          );

        fineStreamers =
          pow(
            fineStreamers,
            12.0
          );

        float latitudeField =
          mix(
            equatorial,
            polar,
            polarBias
          );

        float streamerField =
          0.44 +
          latitudeField *
          0.24 +
          broadStreamers *
          streamerScale +
          intermediateStreamers *
          streamerScale *
          0.26 +
          fineStreamers *
          streamerScale *
          0.09;

        float asymmetry =
          0.82 +
          0.18 *
          cos(
            angle -
            0.4
          );

        float alpha =
          radial *
          streamerField *
          asymmetry *
          intensity;

        gl_FragColor =
          vec4(
            color *
            alpha,
            alpha
          );
      }
    \`,
  });
}`;

function main() {
  log(
    "Starting Project Astra Phase 4.3 Premium Sun visual upgrade v2.",
  );

  if (
    !fs.existsSync(
      sunSystemPath,
    )
  ) {
    fail(
      `Sun System source was not found:\n${sunSystemPath}`,
    );
  }

  const rawSource =
    fs.readFileSync(
      sunSystemPath,
      "utf8",
    );

  let source =
    rawSource.replace(
      /\r\n/g,
      "\n",
    );

  const requiredStartingFragments = [
    "const SUN_DISTANCE = 32;",
    "const SUN_DISK_RADIUS = 1.05;",
    "function createSunDiskMaterial()",
    "function createCoronaMaterial(options:",
    "const innerCoronaGeometry =",
    "const outerCoronaGeometry =",
    "diskMaterial.uniforms.time.value =",
    "innerCoronaMaterial.uniforms.time.value =",
    "outerCoronaMaterial.uniforms.time.value =",
  ];

  for (
    const fragment of
    requiredStartingFragments
  ) {
    if (
      !source.includes(
        fragment,
      )
    ) {
      fail(
        `Expected Phase 4.2 source fragment was not found: ${fragment}`,
      );
    }
  }

  if (
    source.includes(
      "createChromosphereMaterial",
    )
  ) {
    fail(
      "The Premium Sun visual upgrade already appears to be present.",
    );
  }

  source =
    replaceSection(
      source,
      "function createSunDiskMaterial()",
      "export function createAstraSunSystem",
      premiumMaterialFunctions,
      "Premium Sun material functions",
    );

  source =
    replaceExactlyOnce(
      source,

      `  root.add(disk);

  const innerCoronaGeometry =`,

      `  root.add(disk);

  const chromosphereGeometry =
    new THREE.PlaneGeometry(
      SUN_DISK_RADIUS * 2.34,
      SUN_DISK_RADIUS * 2.34,
      1,
      1,
    );

  const chromosphereMaterial =
    createChromosphereMaterial();

  const chromosphere =
    new THREE.Mesh(
      chromosphereGeometry,
      chromosphereMaterial,
    );

  chromosphere.position.z =
    -0.015;

  root.add(
    chromosphere,
  );

  const innerCoronaGeometry =`,

      "chromosphere geometry and material insertion",
    );

  source =
    replaceExactlyOnce(
      source,

      `      intensity: 0.5,
      falloff: 3.2,`,

      `      intensity: 0.42,
      falloff: 2.55,
      streamerScale: 0.44,
      polarBias: 0.28,`,

      "inner corona premium calibration",
    );

  source =
    replaceExactlyOnce(
      source,

      `      intensity: 0.17,
      falloff: 4.8,`,

      `      intensity: 0.115,
      falloff: 3.45,
      streamerScale: 0.62,
      polarBias: 0.58,`,

      "outer corona premium calibration",
    );

  source =
    replaceExactlyOnce(
      source,

      `        diskMaterial.uniforms.time.value =
          elapsedSeconds;

        innerCoronaMaterial.uniforms.time.value =`,

      `        diskMaterial.uniforms.time.value =
          elapsedSeconds;

        chromosphereMaterial.uniforms.time.value =
          elapsedSeconds;

        innerCoronaMaterial.uniforms.time.value =`,

      "chromosphere animation update",
    );

  source =
    replaceExactlyOnce(
      source,

      `      diskGeometry.dispose();
      diskMaterial.dispose();

      innerCoronaGeometry.dispose();`,

      `      diskGeometry.dispose();
      diskMaterial.dispose();

      chromosphereGeometry.dispose();
      chromosphereMaterial.dispose();

      innerCoronaGeometry.dispose();`,

      "chromosphere disposal lifecycle",
    );

  const requiredFinalFragments = [
    "function createChromosphereMaterial()",
    "streamerScale: number;",
    "polarBias: number;",
    "const chromosphereGeometry =",
    "const chromosphereMaterial =",
    "chromosphereMaterial.uniforms.time.value",
    "chromosphereGeometry.dispose();",
    "chromosphereMaterial.dispose();",
    "streamerScale: 0.44",
    "streamerScale: 0.62",
    "polarBias: 0.28",
    "polarBias: 0.58",
  ];

  for (
    const fragment of
    requiredFinalFragments
  ) {
    if (
      !source.includes(
        fragment,
      )
    ) {
      fail(
        `Final source validation failed: ${fragment}`,
      );
    }
  }

  createBackup(
    rawSource,
  );

  fs.writeFileSync(
    sunSystemPath,
    source,
    "utf8",
  );

  log(
    `Updated:\n${sunSystemPath}`,
  );

  log(
    "Premium photosphere, chromosphere, limb treatment and asymmetric corona applied.",
  );

  log(
    "No Git operation was performed.",
  );
}

main();