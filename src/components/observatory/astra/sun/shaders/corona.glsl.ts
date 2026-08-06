export const CORONA_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
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

  float angle =
    atan(
      centered.y,
      centered.x
    );

  float radial =
    pow(
      max(
        0.0,
        1.0 - radius
      ),
      falloff
    );

  float drift =
    time *
    0.012;

  float angularNoise =
    valueNoise(
      vec2(
        angle * 3.6 + drift,
        radius * 6.0 -
          drift * 0.7
      )
    );

  float equatorial =
    pow(
      abs(cos(angle)),
      1.45
    );

  float polar =
    pow(
      abs(sin(angle)),
      2.25
    );

  float broadStreamers =
    0.5 +
    0.5 *
    sin(
      angle * 5.0 +
      angularNoise * 3.6 +
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
      angle * 11.0 -
      radius * 7.0 -
      drift * 1.25
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
      angle * 23.0 +
      radius * 12.0 +
      drift * 0.8
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
    latitudeField * 0.24 +
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
      color * alpha,
      alpha
    );
}
`;