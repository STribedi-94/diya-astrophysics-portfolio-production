export const CHROMOSPHERE_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position =
    projectionMatrix *
    modelViewMatrix *
    vec4(position, 1.0);
}
`;

export const CHROMOSPHERE_FRAGMENT_SHADER = /* glsl */ `
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
    p.x * p.y
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
    radius > 1.0 ||
    radius < 0.68
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
      angle * 15.0 +
      time * 0.041
    ) * 0.022 +
    sin(
      angle * 29.0 -
      time * 0.027
    ) * 0.012 +
    (
      hash21(
        vec2(
          floor(angle * 24.0),
          9.0
        )
      ) -
      0.5
    ) * 0.015;

  float innerEdge =
    0.76 +
    irregularity;

  float outerEdge =
    0.985 +
    irregularity * 0.42;

  float ring =
    smoothstep(
      innerEdge,
      0.91 + irregularity,
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
        angle * 5.0 -
        time * 0.018
      )
    ) *
    max(
      0.0,
      sin(
        angle * 8.0 +
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
          angle * 19.0 +
          time * 0.024
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
    ring * 0.34 +
    prominence * 0.17 +
    filament * 0.06;

  gl_FragColor =
    vec4(
      color * alpha,
      alpha
    );
}
`;