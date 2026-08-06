export const SUN_DISK_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
}
`;

export const SUN_DISK_FRAGMENT_SHADER = /* glsl */ `
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
      hash21(i + vec2(1.0, 0.0)),
      f.x
    ),
    mix(
      hash21(i + vec2(0.0, 1.0)),
      hash21(i + vec2(1.0, 1.0)),
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

float ridge(float value) {
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

  if (radius > 1.0) {
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
`;