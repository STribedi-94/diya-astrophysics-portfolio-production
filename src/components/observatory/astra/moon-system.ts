import * as THREE from "three";

import {
  ASTRA_SUN_DIRECTION,
  EARTH_RADIUS,
} from "./earth-system";


export type MoonSystemOptions = {
  scene: THREE.Scene;
  reducedMotion: boolean;
};


export type MoonSystem = {
  root: THREE.Group;
  moon: THREE.Mesh;
  orbit: THREE.Line;

  update(options?: {
    elapsedSeconds?: number;
    reducedMotion?: boolean;
  }): void;

  dispose(): void;
};


/*
 * ------------------------------------------------------------
 * Project Diya Astra — Moon Foundation
 * ------------------------------------------------------------
 *
 * The Moon is an independent Earth-centred Astra subsystem.
 *
 * Scientific / visual invariants:
 *
 * - Earth remains at the world origin.
 * - Moon illumination uses ASTRA_SUN_DIRECTION.
 * - Moon owns its own orbital motion and synchronous rotation.
 * - no additional solar-light authority is created here.
 * - a visible lunar orbital guide communicates the motion.
 * - opening position is deterministic.
 * - reduced-motion mode slows essential lunar motion instead
 *   of freezing the astronomical system.
 * - subsystem remains ready for future textures, eclipses,
 *   labels, selection and guided camera transitions.
 */


/*
 * Real Moon / Earth radius ratio.
 */
const MOON_RADIUS =
  EARTH_RADIUS * 0.2724;


/*
 * True Earth–Moon distance is approximately 60 Earth radii.
 *
 * Rendering that literally in the current Observatory composition
 * would make the Moon visually insignificant, therefore Astra uses
 * a deliberately compressed cinematic orbital distance while
 * preserving the correct Moon/Earth size relationship.
 *
 * 2.85 gives enough Earth–Moon separation in fullscreen while
 * remaining much safer inside the embedded Observatory viewport.
 */
const MOON_ORBIT_RADIUS =
  EARTH_RADIUS * 2.85;


/*
 * The real lunar orbital inclination is not represented literally
 * because the website camera/composition is itself cinematic.
 *
 * This restrained tilt makes the orbit readable in three dimensions
 * without competing visually with the TESS orbit.
 */
/*
 * Scientific inclination plus a cinematic presentation tilt.
 *
 * The previous XZ orbital plane was viewed almost edge-on by the
 * canonical Astra opening camera. The additional plane tilt keeps
 * the lunar orbit visibly elliptical in the default Earth view
 * while preserving a modest secondary lunar inclination.
 */
const MOON_ORBIT_PRESENTATION_TILT =
  THREE.MathUtils.degToRad(-55);

const MOON_ORBIT_INCLINATION =
  THREE.MathUtils.degToRad(8);


/*
 * Visual orbital period in seconds.
 *
 * This is intentionally accelerated relative to the real Moon but
 * slow enough that the motion remains elegant rather than distracting.
 */
const MOON_ORBIT_PERIOD =
  180;


/*
 * Reduced-motion does not stop scientifically meaningful motion.
 * Instead it slows the lunar orbit substantially.
 */
const REDUCED_MOTION_SCALE =
  0.70;


/*
 * Opening orbital phase.
 *
 * IMPORTANT:
 * This is now applied relative to the Moon subsystem's own start
 * time. It therefore remains deterministic on first render instead
 * of depending on how long the browser/page has already been open.
 *
 * The 32-degree opening pose was visually successful during the
 * first Moon QA when it was actually displayed at that phase.
 */
const INITIAL_ORBIT_PHASE =
  THREE.MathUtils.degToRad(8);


/*
 * Visible orbital guide configuration.
 */
const ORBIT_SEGMENTS =
  192;


export function createMoonSystem({
  scene,
  reducedMotion,
}: MoonSystemOptions): MoonSystem {
  const root =
    new THREE.Group();

  root.name =
    "AstraMoonSystem";

  scene.add(root);


  /*
   * ------------------------------------------------------------
   * Lunar orbital plane
   * ------------------------------------------------------------
   */

  const orbitPlane =
    new THREE.Group();

  orbitPlane.name =
    "AstraMoonOrbitalPlane";

  orbitPlane.rotation.set(
  MOON_ORBIT_PRESENTATION_TILT,
  0,
  MOON_ORBIT_INCLINATION,
);

  root.add(orbitPlane);


  /*
   * ------------------------------------------------------------
   * Visible lunar orbit
   * ------------------------------------------------------------
   *
   * The path uses the exact same radius and orbital plane as the
   * Moon itself, so the Moon visibly travels along this line.
   *
   * Blue-grey separates it from the purple TESS trajectory.
   */

  const orbitPoints:
    THREE.Vector3[] = [];

  for (
    let index = 0;
    index <= ORBIT_SEGMENTS;
    index++
  ) {
    const angle =
      (
        index /
        ORBIT_SEGMENTS
      ) *
      Math.PI *
      2;

    orbitPoints.push(
      new THREE.Vector3(
        Math.cos(angle) *
          MOON_ORBIT_RADIUS,

        0,

        Math.sin(angle) *
          MOON_ORBIT_RADIUS,
      ),
    );
  }


  const orbitGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(
        orbitPoints,
      );


  const orbitMaterial =
    new THREE.LineBasicMaterial({
      color:
        new THREE.Color(
          0x7899bd,
        ),

      transparent:
        true,

      opacity:
        0.24,

      depthWrite:
        false,

      depthTest:
        true,

      toneMapped:
        false,
    });


  const orbit =
    new THREE.Line(
      orbitGeometry,
      orbitMaterial,
    );


  orbit.name =
    "AstraMoonOrbit";

  /*
   * Keep it visually restrained and behind major scene subjects.
   */
  orbit.renderOrder =
    -2;


  /*
   * Orbit is visual context, never an interaction target.
   */
  orbit.raycast =
    () => {};


  orbitPlane.add(
    orbit,
  );


  /*
   * ------------------------------------------------------------
   * Moon geometry
   * ------------------------------------------------------------
   */

  const moonGeometry =
    new THREE.SphereGeometry(
      MOON_RADIUS,
      64,
      48,
    );


  /*
   * ------------------------------------------------------------
   * Procedural lunar material
   * ------------------------------------------------------------
   *
   * No external Moon texture dependency is introduced in the
   * foundation milestone.
   *
   * Surface variation is procedural while illumination remains
   * controlled by the canonical Project Astra Sun direction.
   */

  const moonMaterial =
    new THREE.ShaderMaterial({
      toneMapped:
        false,

      uniforms: {
        sunDir: {
          value:
            ASTRA_SUN_DIRECTION
              .clone()
              .normalize(),
        },

        earthPosition: {
          value:
            new THREE.Vector3(
              0,
              0,
              0,
            ),
        },
      },

      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying vec3 vObjectPosition;

        void main() {
          vObjectPosition =
            position;

          vec4 worldPosition =
            modelMatrix *
            vec4(
              position,
              1.0
            );

          vWorldPosition =
            worldPosition.xyz;

          vWorldNormal =
            normalize(
              mat3(modelMatrix) *
              normal
            );

          gl_Position =
            projectionMatrix *
            viewMatrix *
            worldPosition;
        }
      `,

      fragmentShader: `
        uniform vec3 sunDir;
        uniform vec3 earthPosition;

        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        varying vec3 vObjectPosition;


        float hash31(
          vec3 point
        ) {
          point =
            fract(
              point *
              0.1031
            );

          point +=
            dot(
              point,
              point.yzx +
              33.33
            );

          return
            fract(
              (
                point.x +
                point.y
              ) *
              point.z
            );
        }


        float valueNoise(
          vec3 point
        ) {
          vec3 cell =
            floor(point);

          vec3 local =
            fract(point);

          local =
            local *
            local *
            (
              3.0 -
              2.0 *
              local
            );


          float n000 =
            hash31(
              cell +
              vec3(
                0.0,
                0.0,
                0.0
              )
            );

          float n100 =
            hash31(
              cell +
              vec3(
                1.0,
                0.0,
                0.0
              )
            );

          float n010 =
            hash31(
              cell +
              vec3(
                0.0,
                1.0,
                0.0
              )
            );

          float n110 =
            hash31(
              cell +
              vec3(
                1.0,
                1.0,
                0.0
              )
            );

          float n001 =
            hash31(
              cell +
              vec3(
                0.0,
                0.0,
                1.0
              )
            );

          float n101 =
            hash31(
              cell +
              vec3(
                1.0,
                0.0,
                1.0
              )
            );

          float n011 =
            hash31(
              cell +
              vec3(
                0.0,
                1.0,
                1.0
              )
            );

          float n111 =
            hash31(
              cell +
              vec3(
                1.0,
                1.0,
                1.0
              )
            );


          float nx00 =
            mix(
              n000,
              n100,
              local.x
            );

          float nx10 =
            mix(
              n010,
              n110,
              local.x
            );

          float nx01 =
            mix(
              n001,
              n101,
              local.x
            );

          float nx11 =
            mix(
              n011,
              n111,
              local.x
            );


          float nxy0 =
            mix(
              nx00,
              nx10,
              local.y
            );

          float nxy1 =
            mix(
              nx01,
              nx11,
              local.y
            );


          return
            mix(
              nxy0,
              nxy1,
              local.z
            );
        }


        float fbm(
          vec3 point
        ) {
          float value =
            0.0;

          float amplitude =
            0.52;


          for (
            int octave = 0;
            octave < 5;
            octave += 1
          ) {
            value +=
              valueNoise(
                point
              ) *
              amplitude;

            point =
              point *
              2.03 +
              vec3(
                7.1,
                13.7,
                3.9
              );

            amplitude *=
              0.50;
          }


          return value;
        }


        void main() {
          vec3 normal =
            normalize(
              vWorldNormal
            );


          vec3 lightDirection =
            normalize(
              sunDir
            );


          vec3 viewDirection =
            normalize(
              cameraPosition -
              vWorldPosition
            );


          /*
           * --------------------------------------------------------
           * Direct sunlight
           * --------------------------------------------------------
           */

          float solarDot =
            dot(
              normal,
              lightDirection
            );


          float directLight =
            smoothstep(
              -0.035,
              0.12,
              solarDot
            );


          /*
           * --------------------------------------------------------
           * Earthshine approximation
           * --------------------------------------------------------
           *
           * The lunar hemisphere facing Earth receives a restrained
           * blue-grey secondary illumination.
           */

          vec3 directionToEarth =
            normalize(
              earthPosition -
              vWorldPosition
            );


          float earthFacing =
            max(
              dot(
                normal,
                directionToEarth
              ),
              0.0
            );


          float earthshine =
            earthFacing *
            (
              1.0 -
              directLight
            ) *
            0.115;


          /*
           * --------------------------------------------------------
           * Procedural lunar terrain
           * --------------------------------------------------------
           */

          vec3 samplePosition =
            normalize(
              vObjectPosition
            );


          float broadTerrain =
            fbm(
              samplePosition *
              5.8
            );


          float fineTerrain =
            fbm(
              samplePosition *
              18.0 +
              vec3(
                4.2,
                8.7,
                2.1
              )
            );


          float terrain =
            broadTerrain *
            0.72 +
            fineTerrain *
            0.28;


          /*
           * Darker maria-like regions.
           */

          float maria =
            smoothstep(
              0.54,
              0.73,
              broadTerrain
            );


          vec3 highlandColor =
            vec3(
              0.56,
              0.55,
              0.52
            );


          vec3 mariaColor =
            vec3(
              0.29,
              0.30,
              0.31
            );


          vec3 surfaceColor =
            mix(
              highlandColor,
              mariaColor,
              maria *
              0.72
            );


          surfaceColor *=
            0.82 +
            terrain *
            0.34;


          /*
           * --------------------------------------------------------
           * Sunlit lunar surface
           * --------------------------------------------------------
           */

          float sunlight =
            max(
              solarDot,
              0.0
            );


          vec3 daylight =
            surfaceColor *
            (
              0.24 +
              sunlight *
              1.34
            );


          /*
           * Very dark unilluminated hemisphere.
           */

          vec3 nightSurface =
            surfaceColor *
            0.018;


          /*
           * Restrained blue-grey Earthshine.
           */

          nightSurface +=
            vec3(
              0.20,
              0.29,
              0.43
            ) *
            earthshine;


          vec3 color =
            mix(
              nightSurface,
              daylight,
              directLight
            );


          /*
           * --------------------------------------------------------
           * Subtle limb shaping
           * --------------------------------------------------------
           */

          float viewDot =
            max(
              dot(
                normal,
                viewDirection
              ),
              0.0
            );


          color *=
            mix(
              0.68,
              1.0,
              smoothstep(
                0.0,
                0.42,
                viewDot
              )
            );


          gl_FragColor =
            vec4(
              color,
              1.0
            );
        }
      `,
    });


  /*
   * ------------------------------------------------------------
   * Moon mesh
   * ------------------------------------------------------------
   */

  const moon =
    new THREE.Mesh(
      moonGeometry,
      moonMaterial,
    );


  moon.name =
    "AstraMoon";


  orbitPlane.add(
    moon,
  );


  /*
   * ------------------------------------------------------------
   * Deterministic orbital clock
   * ------------------------------------------------------------
   *
   * The previous implementation used the page's absolute
   * performance clock directly.
   *
   * That meant:
   *
   * - updateMoonTransform(0) created the intended opening pose;
   * - then the first requestAnimationFrame immediately supplied
   *   performance.now();
   * - the Moon jumped to an arbitrary orbital position depending
   *   on how long the browser session had already existed.
   *
   * We instead establish a subsystem-relative clock here.
   */

  const orbitStartSeconds =
    performance.now() /
    1000;


  /*
   * Keep the visually verified opening phase.
   *
   * Because elapsed orbital time now starts from zero, the Moon
   * genuinely opens at this phase every time the scene is created.
   */
  const initialOrbitPhase =
    INITIAL_ORBIT_PHASE;


  function updateMoonTransform(
    elapsedSeconds: number,
    motionReduced: boolean,
  ) {
    /*
     * Convert the external absolute Astra animation clock into
     * elapsed time since THIS Moon system was created.
     */
    const elapsedSinceStart =
      Math.max(
        0,
        elapsedSeconds -
          orbitStartSeconds,
      );


    /*
     * Reduced-motion preserves essential astronomical movement.
     * It does not freeze the Moon.
     */
    const motionScale =
      motionReduced
        ? REDUCED_MOTION_SCALE
        : 1;


    const orbitalPhase =
      initialOrbitPhase +
      (
        elapsedSinceStart /
        MOON_ORBIT_PERIOD
      ) *
      Math.PI *
      2 *
      motionScale;


    /*
     * Moon and visible orbit use the exact same plane/radius.
     */
    moon.position.set(
      Math.cos(
        orbitalPhase,
      ) *
        MOON_ORBIT_RADIUS,

      0,

      Math.sin(
        orbitalPhase,
      ) *
        MOON_ORBIT_RADIUS,
    );


    /*
     * Approximate synchronous rotation.
     *
     * The same lunar hemisphere remains directed toward Earth.
     */
    moon.lookAt(
      0,
      0,
      0,
    );


    /*
     * SphereGeometry orientation correction after lookAt().
     */
    moon.rotateY(
      Math.PI,
    );
  }


  let currentReducedMotion =
    reducedMotion;


  /*
   * Establish the actual deterministic opening pose.
   *
   * Pass orbitStartSeconds rather than zero because the runtime
   * function now correctly expects the external absolute clock.
   */
  updateMoonTransform(
    orbitStartSeconds,
    currentReducedMotion,
  );


  return {
    root,
    moon,
    orbit,


    update(options = {}) {
      const elapsedSeconds =
        options.elapsedSeconds ??
        performance.now() /
          1000;


      currentReducedMotion =
        options.reducedMotion ??
        currentReducedMotion;


      updateMoonTransform(
        elapsedSeconds,
        currentReducedMotion,
      );
    },


    dispose() {
      scene.remove(
        root,
      );


      /*
       * Lunar orbital guide.
       */
      orbitGeometry.dispose();
      orbitMaterial.dispose();


      /*
       * Moon.
       */
      moonGeometry.dispose();
      moonMaterial.dispose();


      root.clear();
    },
  };
}