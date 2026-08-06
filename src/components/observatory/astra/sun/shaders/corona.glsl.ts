export const CORONA_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(
      position,
      1.0
    );
}
`;

export const CORONA_FRAGMENT_SHADER = /* glsl */ `
uniform vec3 color;
uniform float intensity;
uniform float falloff;
uniform float streamerScale;
uniform float polarBias;
uniform float time;

varying vec2 vUv;

float hash21(vec2 point) {
  point =
    fract(
      point *
      vec2(
        123.34,
        456.21
      )
    );

  point +=
    dot(
      point,
      point + 45.32
    );

  return
    fract(
      point.x *
      point.y
    );
}

float valueNoise(vec2 point) {
  vec2 cell =
    floor(point);

  vec2 local =
    fract(point);

  local =
    local *
    local *
    (
      3.0 -
      2.0 *
      local
    );

  float a =
    hash21(cell);

  float b =
    hash21(
      cell +
      vec2(
        1.0,
        0.0
      )
    );

  float c =
    hash21(
      cell +
      vec2(
        0.0,
        1.0
      )
    );

  float d =
    hash21(
      cell +
      vec2(
        1.0,
        1.0
      )
    );

  return
    mix(
      mix(
        a,
        b,
        local.x
      ),

      mix(
        c,
        d,
        local.x
      ),

      local.y
    );
}

float fbm(vec2 point) {
  float total =
    0.0;

  float amplitude =
    0.52;

  mat2 rotation =
    mat2(
      0.82,
      -0.57,
      0.57,
      0.82
    );

  for (
    int octave = 0;
    octave < 6;
    octave += 1
  ) {
    total +=
      amplitude *
      valueNoise(point);

    point =
      rotation *
      point *
      2.03 +
      vec2(
        13.7,
        8.4
      );

    amplitude *=
      0.50;
  }

  return total;
}

float ridgeNoise(vec2 point) {
  float noiseValue =
    fbm(point);

  return
    1.0 -
    abs(
      noiseValue *
      2.0 -
      1.0
    );
}

void main() {
  vec2 centered =
    vUv -
    vec2(0.5);

  float planeRadius =
    length(centered) *
    2.0;

  if (
    planeRadius >
    1.0
  ) {
    discard;
  }

  float angle =
    atan(
      centered.y,
      centered.x
    );

  /*
   * The active Sun system creates two differently sized planes:
   *
   * inner corona scale = 2.55
   * outer corona scale = 3.90
   *
   * Their polarBias values identify the layer:
   *
   * inner = 0.28
   * outer = 0.58
   */
  float layerBlend =
    smoothstep(
      0.30,
      0.56,
      polarBias
    );

  float diskRadius =
    mix(
      0.392,
      0.256,
      layerBlend
    );

  /*
   * Corona distance measured outward from the real solar limb.
   */
  float limbDistance =
    clamp(
      (
        planeRadius -
        diskRadius
      ) /
      max(
        0.001,
        1.0 -
        diskRadius
      ),
      0.0,
      1.0
    );

  float outsideDisk =
    smoothstep(
      diskRadius *
      0.92,
      diskRadius *
      1.035,
      planeRadius
    );

  float behindDiskGlow =
    1.0 -
    smoothstep(
      diskRadius *
      0.45,
      diskRadius,
      planeRadius
    );

  float drift =
    time *
    mix(
      0.020,
      0.012,
      layerBlend
    );

  vec2 polarUv =
    vec2(
      angle *
      mix(
        2.7,
        3.5,
        layerBlend
      ),

      limbDistance *
      mix(
        8.0,
        11.0,
        layerBlend
      )
    );

  float broadNoise =
    fbm(
      polarUv +
      vec2(
        drift,
        -drift *
        0.44
      )
    );

  float mediumNoise =
    fbm(
      polarUv *
      2.20 +
      vec2(
        -drift *
        1.35,
        drift *
        0.68
      )
    );

  float fineNoise =
    ridgeNoise(
      polarUv *
      4.60 +
      vec2(
        drift *
        2.10,
        -drift *
        0.92
      )
    );

  float equatorial =
    pow(
      abs(
        cos(angle)
      ),
      1.35
    );

  float polar =
    pow(
      abs(
        sin(angle)
      ),
      2.10
    );

  float latitudeField =
    mix(
      equatorial,
      polar,
      polarBias
    );

  /*
   * Broad magnetic streamer families.
   */
  float broadStreamers =
    0.5 +
    0.5 *
    sin(
      angle *
      6.0 +
      broadNoise *
      6.4 +
      limbDistance *
      5.0 +
      drift
    );

  broadStreamers =
    pow(
      broadStreamers,
      3.0
    );

  float intermediateStreamers =
    0.5 +
    0.5 *
    sin(
      angle *
      13.0 -
      limbDistance *
      11.0 +
      mediumNoise *
      5.8 -
      drift *
      1.42
    );

  intermediateStreamers =
    pow(
      intermediateStreamers,
      5.2
    );

  float fineStreamers =
    0.5 +
    0.5 *
    sin(
      angle *
      31.0 +
      limbDistance *
      18.0 +
      fineNoise *
      6.6 +
      drift *
      1.76
    );

  fineStreamers =
    pow(
      fineStreamers,
      9.0
    );

  float streamerField =
    0.18 +
    latitudeField *
    0.25 +
    broadStreamers *
    streamerScale *
    1.22 +
    intermediateStreamers *
    streamerScale *
    0.70 +
    fineStreamers *
    streamerScale *
    0.34;

  /*
   * Reduced broad-noise dominance prevents a smoky appearance.
   */
  streamerField *=
    0.76 +
    broadNoise *
    0.46;

  /*
   * Longer directional coronal rays.
   */
  float longRaySelection =
    smoothstep(
      0.46,
      0.76,
      broadNoise *
      0.66 +
      mediumNoise *
      0.34
    );

  float longRays =
    longRaySelection *
    pow(
      max(
        0.0,
        1.0 -
        limbDistance
      ),
      mix(
        0.36,
        0.54,
        layerBlend
      )
    );

  /*
   * Narrow radial filament system.
   */
  float radialFilaments =
    0.5 +
    0.5 *
    sin(
      angle *
      47.0 +
      fineNoise *
      5.0 -
      time *
      0.025
    );

  radialFilaments =
    pow(
      radialFilaments,
      14.0
    );

  radialFilaments *=
    pow(
      max(
        0.0,
        1.0 -
        limbDistance
      ),
      0.72
    );

  /*
   * Curved prominence loops near the solar limb.
   */
  float prominenceWaveA =
    abs(
      sin(
        angle *
        4.0 +
        limbDistance *
        25.0 -
        drift *
        1.40 +
        broadNoise *
        3.8
      )
    );

  prominenceWaveA =
    1.0 -
    smoothstep(
      0.020,
      0.105,
      prominenceWaveA
    );

  float prominenceWaveB =
    abs(
      sin(
        angle *
        7.0 -
        limbDistance *
        32.0 +
        drift *
        1.05 +
        mediumNoise *
        4.2
      )
    );

  prominenceWaveB =
    1.0 -
    smoothstep(
      0.018,
      0.090,
      prominenceWaveB
    );

  float prominenceRadial =
    smoothstep(
      0.0,
      0.018,
      limbDistance
    ) *
    (
      1.0 -
      smoothstep(
        0.15,
        0.34,
        limbDistance
      )
    );

  float prominenceSelection =
    smoothstep(
      0.45,
      0.73,
      mediumNoise
    );

  float prominenceMask =
    (
      prominenceWaveA *
      0.82 +
      prominenceWaveB *
      0.52
    ) *
    prominenceRadial *
    prominenceSelection;

  /*
   * Dense inner chromospheric glow.
   */
  float chromosphereGlow =
    exp(
      -limbDistance *
      mix(
        15.0,
        11.0,
        layerBlend
      )
    );

  float innerCoronaGlow =
    pow(
      max(
        0.0,
        1.0 -
        limbDistance
      ),
      mix(
        1.10,
        1.45,
        layerBlend
      )
    );

  float outerCoronaGlow =
    pow(
      max(
        0.0,
        1.0 -
        limbDistance
      ),
      mix(
        0.62,
        0.92,
        layerBlend
      )
    );

  float directionalAsymmetry =
    0.80 +
    0.13 *
    cos(
      angle -
      0.58
    ) +
    0.07 *
    sin(
      angle *
      2.0 +
      1.18
    );

  /*
   * Gentle polar enhancement creates a magnetically structured
   * silhouette without producing an artificial starburst.
   */
  float polarAnisotropy =
    0.88 +
    0.24 *
    pow(
      abs(
        sin(angle)
      ),
      2.4
    );

  float outerFade =
    1.0 -
    smoothstep(
      0.80,
      1.0,
      limbDistance
    );

  float effectiveIntensity =
    max(
      intensity,
      mix(
        0.64,
        0.28,
        layerBlend
      )
    );

  float coronaAlpha =
    (
      chromosphereGlow *
      mix(
        0.94,
        0.36,
        layerBlend
      ) +

      innerCoronaGlow *
      streamerField *
      mix(
        0.72,
        0.48,
        layerBlend
      ) +

      /*
       * Reduced diffuse outer plasma prevents dark smoky clouds.
       */
      outerCoronaGlow *
      streamerField *
      mix(
        0.34,
        0.58,
        layerBlend
      ) +

      /*
       * Stronger and slightly longer directional rays.
       */
      longRays *
      streamerScale *
      mix(
        0.82,
        1.22,
        layerBlend
      ) +

      radialFilaments *
      streamerScale *
      mix(
        0.32,
        0.58,
        layerBlend
      ) +

      prominenceMask *
      mix(
        1.18,
        0.48,
        layerBlend
      )
    ) *
    outsideDisk *
    outerFade *
    directionalAsymmetry *
    polarAnisotropy *
    effectiveIntensity;

  coronaAlpha +=
    behindDiskGlow *
    effectiveIntensity *
    mix(
      0.10,
      0.045,
      layerBlend
    );

  if (
    coronaAlpha <
    0.00035
  ) {
    discard;
  }

  /*
   * Brighter golden-white inner corona.
   */
  vec3 hotCoreColor =
    vec3(
      1.56,
      1.30,
      0.74
    );

  vec3 middleCoronaColor =
    color *
    vec3(
      1.30,
      0.94,
      0.60
    );

  vec3 outerCoronaColor =
    color *
    vec3(
      1.24,
      0.44,
      0.18
    );

  float hotCoreMix =
    exp(
      -limbDistance *
      8.4
    );

  float outerColorMix =
    smoothstep(
      0.18,
      0.92,
      limbDistance
    );

  vec3 coronaColor =
    mix(
      middleCoronaColor,
      hotCoreColor,
      hotCoreMix
    );

  coronaColor =
    mix(
      coronaColor,
      outerCoronaColor,
      outerColorMix *
      mix(
        0.50,
        0.72,
        layerBlend
      )
    );

  coronaColor +=
    vec3(
      1.35,
      0.34,
      0.022
    ) *
    prominenceMask *
    0.92;

  coronaColor +=
    vec3(
      1.18,
      0.72,
      0.28
    ) *
    radialFilaments *
    0.12;

  gl_FragColor =
    vec4(
      coronaColor *
      coronaAlpha,
      coronaAlpha
    );
}
`;