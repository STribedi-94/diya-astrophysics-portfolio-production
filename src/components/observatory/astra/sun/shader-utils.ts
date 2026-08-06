/*
 * Project Astra
 * Shared GLSL helper snippets used by the Sun rendering system.
 */

export const GLSL_HASH21 = /* glsl */ `
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
`;

export const GLSL_VALUE_NOISE = /* glsl */ `
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
`;

export const GLSL_FBM = /* glsl */ `
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
`;