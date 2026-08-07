/**
 * GlobeScene — WebGL Earth for the Observatory Network section.
 *
 * Rendered client-side only, lazily imported by ObservatoryNetworkGlobe.
 * Textures: NASA Visible Earth "Blue Marble" (public domain), downsampled and
 * stored as project CDN assets.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePerf } from "@/lib/performance";
import { groundNodes, spaceNode } from "@/data/observatory-network";
import { AstraCameraController } from "./astra/camera-controller";
import {
  createEarthSystem,
  EARTH_RADIUS,
} from "./astra/earth-system";
import {
  createObservatoryFocusPose,
  createObservatorySystem,
  latLonToVec3,
} from "./astra/observatory-system";
import {
  createTessOrbitSystem,
} from "./astra/tess-orbit-system";
import {
  createAstraSunSystem,
} from "./astra/sun";
import {
  ASTRA_OVERVIEW_CAMERA,
} from "./astra/composition";


const SPIN_PERIOD = 240; // seconds per full Earth rotation

/** Earth spin offset that puts the given longitude in front of the camera (+Z). */
function facingRotation(lon: number) {
  const v = latLonToVec3(0, lon, 1);
  return -Math.atan2(v.x, v.z);
}


export type AstraInteractionMode =
  | "earth"
  | "scene";


export type GlobeSceneProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReady: () => void;
  onError: () => void;
  reducedMotion: boolean;
  active: boolean;
  interactionMode: AstraInteractionMode;
  restoreSignal: number;
};


export default function GlobeScene({
  selectedId,
  onSelect,
  onReady,
  onError,
  reducedMotion,
  active,
  interactionMode,
  restoreSignal,
}: GlobeSceneProps) {
  const { maxPixelRatio } = usePerf();

  const hostRef =
    useRef<HTMLDivElement>(null);

  const labelRef =
    useRef<HTMLDivElement>(null);

  const selectedRef =
    useRef<string | null>(
      selectedId,
    );

  const activeRef =
    useRef(active);

  const onSelectRef =
    useRef(onSelect);

  const interactionModeRef =
    useRef<AstraInteractionMode>(
      interactionMode,
    );

  const restoreSignalRef =
    useRef(restoreSignal);


  selectedRef.current =
    selectedId;

  activeRef.current =
    active;

  onSelectRef.current =
    onSelect;

  interactionModeRef.current =
    interactionMode;

  restoreSignalRef.current =
    restoreSignal;


  useEffect(() => {
    const host =
      hostRef.current;

    const labelHost =
      labelRef.current;

    if (
      !host ||
      !labelHost
    ) {
      return;
    }


    /*
     * ------------------------------------------------------------
     * Renderer
     * ------------------------------------------------------------
     */

    let renderer:
      THREE.WebGLRenderer;

    try {
      renderer =
        new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
    } catch {
      onError();
      return;
    }

    if (!renderer.getContext()) {
      onError();
      return;
    }


    let disposed = false;

    const disposables:
      Array<{
        dispose: () => void;
      }> = [];


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        maxPixelRatio,
      ),
    );

    renderer.setSize(
      host.clientWidth,
      host.clientHeight,
      false,
    );

    renderer.domElement.style.width =
      "100%";

    renderer.domElement.style.height =
      "100%";

    renderer.domElement.style.display =
      "block";

    renderer.domElement.style.touchAction =
      "pan-y";

    renderer.domElement.setAttribute(
      "aria-hidden",
      "true",
    );

    host.appendChild(
      renderer.domElement,
    );


    /*
     * ------------------------------------------------------------
     * Scene + Camera
     * ------------------------------------------------------------
     */

    const scene =
      new THREE.Scene();

    const camera =
      new THREE.PerspectiveCamera(
        38,
        1,
        0.1,
        100,
      );


    /*
     * ------------------------------------------------------------
     * Project Diya Astra Camera Controller
     * ------------------------------------------------------------
     */

    const cameraController =
      new AstraCameraController(
        camera,
        {
          initialDistance:
            ASTRA_OVERVIEW_CAMERA.distance,

          initialAzimuth:
            ASTRA_OVERVIEW_CAMERA.azimuth,

          initialPolar:
            ASTRA_OVERVIEW_CAMERA.polar,

          minDistance:
            ASTRA_OVERVIEW_CAMERA.minDistance,

          maxDistance:
            ASTRA_OVERVIEW_CAMERA.maxDistance,
        },
      );


    /*
     * Formal Project Astra runtime state.
     *
     * The Camera Controller now owns the canonical interaction
     * state while React continues to provide current UI intent.
     */
    cameraController.setInteractionState({
      mode: "overview",

      selectedId:
        selectedRef.current,

      inputOwner:
        interactionModeRef.current ===
        "earth"
          ? "earth"
          : "camera",
    });


    /*
     * ------------------------------------------------------------
     * Project Diya Astra Sun System
     * ------------------------------------------------------------
     */

    const sunSystem =
      createAstraSunSystem({
        scene,
        camera,
        reducedMotion,
      });

    disposables.push(
      sunSystem,
    );


    /*
     * ------------------------------------------------------------
     * Deep-space star foundation
     * ------------------------------------------------------------
     */

    let seed = 20260729;

    const rnd = () => {
      seed =
        (
          seed * 1664525 +
          1013904223
        ) %
        4294967296;

      return (
        seed /
        4294967296
      );
    };


    const starCount =
      host.clientWidth < 640
        ? 600
        : 1100;


    const starPos =
      new Float32Array(
        starCount * 3,
      );

    const starCol =
      new Float32Array(
        starCount * 3,
      );


    for (
      let index = 0;
      index < starCount;
      index++
    ) {
      const u =
        rnd() * 2 - 1;

      const theta =
        rnd() *
        Math.PI *
        2;

      const spherical =
        Math.sqrt(
          1 - u * u,
        );

      const radius =
        40 +
        rnd() * 20;


      starPos.set(
        [
          radius *
            spherical *
            Math.cos(theta),

          radius *
            u,

          radius *
            spherical *
            Math.sin(theta),
        ],

        index * 3,
      );


      const brightness =
        0.35 +
        rnd() * 0.65;


      starCol.set(
        [
          brightness,

          brightness,

          brightness *
            (
              0.92 +
              rnd() * 0.08
            ),
        ],

        index * 3,
      );
    }


    const starGeometry =
      new THREE.BufferGeometry();


    starGeometry.setAttribute(
      "position",

      new THREE.BufferAttribute(
        starPos,
        3,
      ),
    );


    starGeometry.setAttribute(
      "color",

      new THREE.BufferAttribute(
        starCol,
        3,
      ),
    );


    const starMaterial =
      new THREE.PointsMaterial({
        size: 0.22,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });


    scene.add(
      new THREE.Points(
        starGeometry,
        starMaterial,
      ),
    );


    disposables.push(
      starGeometry,
      starMaterial,
    );


    /*
     * ------------------------------------------------------------
     * Project Diya Astra Earth System
     * ------------------------------------------------------------
     */

    const earthSystem =
      createEarthSystem({
        scene,
        renderer,
        onReady,
        isDisposed:
          () => disposed,
      });


    const earthGroup =
      earthSystem.group;

    const earthUniforms =
      earthSystem.uniforms;

    const atmosphereMaterial =
      earthSystem
        .atmosphereMaterial;


    /*
     * India-first canonical overview orientation.
     *
     * facingRotation(78) aligns India's approximate longitude
     * with the original positive-Z overview camera.
     *
     * The canonical camera azimuth is added so India remains
     * aligned with the real Project Astra opening camera.
     */

    const overviewEarthRotation =
      facingRotation(78) +
      ASTRA_OVERVIEW_CAMERA.azimuth;


    earthGroup.rotation.y =
      overviewEarthRotation;


    disposables.push(
      earthSystem,
    );


    /*
     * ------------------------------------------------------------
     * Project Diya Astra Observatory System
     * ------------------------------------------------------------
     */

    const observatorySystem =
      createObservatorySystem({
        earthGroup,
        nodes: groundNodes,
        disposables,
      });


    const markers =
      observatorySystem.markers;


    /*
     * ------------------------------------------------------------
     * Project Diya Astra TESS Orbit System
     * ------------------------------------------------------------
     */

    const tessSystem =
      createTessOrbitSystem({
        scene,
        node: spaceNode,
        reducedMotion,
      });


    disposables.push(
      tessSystem,
    );


    /*
     * ------------------------------------------------------------
     * DOM Labels
     * ------------------------------------------------------------
     */

    const labelEls =
      new Map<
        string,
        HTMLSpanElement
      >();


    [
      ...groundNodes,
      spaceNode,
    ].forEach(
      (node) => {
        const label =
          document.createElement(
            "span",
          );


        label.textContent =
          node.shortName;


        label.className =
          "pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide backdrop-blur-sm transition-opacity duration-300";


        label.style.borderColor =
          `${node.color}55`;


        label.style.background =
          "oklch(0.12 0.03 265 / 0.72)";


        label.style.color =
          node.color;


        label.style.opacity =
          "0";


        label.setAttribute(
          "aria-hidden",
          "true",
        );


        labelHost.appendChild(
          label,
        );


        labelEls.set(
          node.id,
          label,
        );
      },
    );


    /*
     * ------------------------------------------------------------
     * Interaction
     * ------------------------------------------------------------
     */

    const raycaster =
      new THREE.Raycaster();


    raycaster.params.Points = {
      threshold: 0.1,
    };


    const pointer =
      new THREE.Vector2();


    let hoverId:
      string | null =
      null;


    let dragging =
      false;


    let didDrag =
      false;


    const pointers =
      new Map<
        number,
        {
          x: number;
          y: number;
        }
      >();


    let pinchStart =
      0;


    let pinchDistance =
      0;


    const canvas =
      renderer.domElement;


    /*
     * ------------------------------------------------------------
     * Picking
     * ------------------------------------------------------------
     */

    function pick(
      clientX: number,
      clientY: number,
    ) {
      const bounds =
        canvas.getBoundingClientRect();


      pointer.set(
        (
          (
            clientX -
            bounds.left
          ) /
          bounds.width
        ) *
          2 -
          1,

        -(
          (
            clientY -
            bounds.top
          ) /
          bounds.height
        ) *
          2 +
          1,
      );


      raycaster.setFromCamera(
        pointer,
        camera,
      );


      const targets:
        Array<{
          id: string;
          obj: THREE.Object3D;
        }> =
        markers.map(
          (marker) => ({
            id:
              marker.node.id,

            obj:
              marker.core,
          }),
        );


      targets.push({
        id:
          spaceNode.id,

        obj:
          tessSystem.glow,
      });


      let best:
        {
          id: string;
          d: number;
        } |
        null =
        null;


      for (
        const target of
        targets
      ) {
        const hits =
          raycaster.intersectObject(
            target.obj,
            true,
          );


        if (
          hits.length &&
          (
            !best ||
            hits[0].distance <
              best.d
          )
        ) {
          best = {
            id:
              target.id,

            d:
              hits[0].distance,
          };
        }
      }


      /*
       * Screen-space fallback keeps small markers easy to
       * select, particularly HCT and DOT.
       */

      if (!best) {
        const fallbackBounds =
          canvas
            .getBoundingClientRect();


        let bestPixel:
          {
            id: string;
            d: number;
          } |
          null =
          null;


        const fallbackTargets = [
          ...markers.map(
            (marker) => ({
              id:
                marker.node.id,

              obj:
                marker.core,
            }),
          ),

          {
            id:
              spaceNode.id,

            obj:
              tessSystem.glow,
          },
        ];


        for (
          const target of
          fallbackTargets
        ) {
          const worldPosition =
            target.obj
              .getWorldPosition(
                new THREE.Vector3(),
              );


          const occluded =
            target.id !==
              spaceNode.id &&
            worldPosition
              .clone()
              .sub(
                camera.position,
              )
              .normalize()
              .dot(
                worldPosition
                  .clone()
                  .normalize(),
              ) >
              0;


          if (occluded) {
            continue;
          }


          worldPosition.project(
            camera,
          );


          const screenX =
            (
              (
                worldPosition.x +
                1
              ) /
              2
            ) *
            fallbackBounds.width;


          const screenY =
            (
              (
                1 -
                worldPosition.y
              ) /
              2
            ) *
            fallbackBounds.height;


          const distance =
            Math.hypot(
              screenX -
                (
                  clientX -
                  fallbackBounds.left
                ),

              screenY -
                (
                  clientY -
                  fallbackBounds.top
                ),
            );


          if (
            distance < 22 &&
            (
              !bestPixel ||
              distance <
                bestPixel.d
            )
          ) {
            bestPixel = {
              id:
                target.id,

              d:
                distance,
            };
          }
        }


        if (bestPixel) {
          return bestPixel.id;
        }
      }


            return best
        ? (best as { id: string; d: number }).id
        : null;
    }


    /*
     * ------------------------------------------------------------
     * Pointer Down
     * ------------------------------------------------------------
     */

    const onPointerDown =
      (
        event:
          PointerEvent,
      ) => {
        pointers.set(
          event.pointerId,
          {
            x:
              event.clientX,

            y:
              event.clientY,
          },
        );


        /*
         * Current toolbar ownership is recorded before the gesture
         * begins. This keeps React intent and the formal Astra
         * controller synchronized.
         */

        cameraController
          .setInteractionState({
            selectedId:
              selectedRef.current,

            inputOwner:
              interactionModeRef
                .current ===
              "earth"
                ? "earth"
                : "camera",
          });


        if (
          pointers.size === 2
        ) {
          const [
            first,
            second,
          ] =
            [
              ...pointers
                .values(),
            ];


          pinchDistance =
            Math.hypot(
              first.x -
                second.x,

              first.y -
                second.y,
            );


          pinchStart =
            cameraController
              .getDistance();
        }


        dragging =
          true;


        didDrag =
          false;


        canvas
          .setPointerCapture?.(
            event.pointerId,
          );
      };


    /*
     * ------------------------------------------------------------
     * Pointer Move
     * ------------------------------------------------------------
     */

    const onPointerMove =
      (
        event:
          PointerEvent,
      ) => {
        const previous =
          pointers.get(
            event.pointerId,
          );


        /*
         * Two-pointer pinch zoom manipulates the camera regardless
         * of the normal single-pointer Earth/scene drag mode.
         */

        if (
          previous &&
          pointers.size === 2
        ) {
          pointers.set(
            event.pointerId,
            {
              x:
                event.clientX,

              y:
                event.clientY,
            },
          );


          const [
            first,
            second,
          ] =
            [
              ...pointers
                .values(),
            ];


          const distance =
            Math.hypot(
              first.x -
                second.x,

              first.y -
                second.y,
            );


          if (
            pinchDistance >
            0
          ) {
            cameraController
              .setInteractionState({
                mode:
                  "sceneOrbit",

                selectedId:
                  selectedRef.current,

                inputOwner:
                  "camera",
              });


            cameraController
              .zoomToDistance(
                pinchStart *
                  (
                    pinchDistance /
                    distance
                  ),
              );
          }


          didDrag =
            true;


          return;
        }


        /*
         * Single-pointer interaction.
         */

        if (
          dragging &&
          previous
        ) {
          const deltaX =
            event.clientX -
            previous.x;


          const deltaY =
            event.clientY -
            previous.y;


          if (
            Math.abs(
              deltaX,
            ) +
              Math.abs(
                deltaY,
              ) >
            3
          ) {
            didDrag =
              true;
          }


          if (
            interactionModeRef
              .current ===
            "earth"
          ) {
            /*
             * Default direct-manipulation mode.
             *
             * Earth rotates independently while the camera remains
             * in its current framing. Observatory markers remain
             * geographically attached because they are children of
             * earthGroup.
             */

            cameraController
              .setInteractionState({
                mode:
                  "earthInteraction",

                selectedId:
                  selectedRef.current,

                inputOwner:
                  "earth",
              });


            earthDragRotation +=
              deltaX *
              0.006;
          } else {
            /*
             * Explicit Orbit Scene mode.
             *
             * AstraCameraController owns whole-scene camera orbit.
             */

            cameraController
              .orbit(
                deltaX,
                deltaY,
              );
          }


          pointers.set(
            event.pointerId,
            {
              x:
                event.clientX,

              y:
                event.clientY,
            },
          );


          return;
        }


        /*
         * Hover picking.
         */

        if (
          event.pointerType ===
          "mouse"
        ) {
          const id =
            pick(
              event.clientX,
              event.clientY,
            );


          hoverId =
            id;


          canvas.style.cursor =
            id
              ? "pointer"
              : "grab";
        }
      };


    /*
     * ------------------------------------------------------------
     * Pointer End
     * ------------------------------------------------------------
     */

    const endPointer =
      (
        event:
          PointerEvent,
      ) => {
        const wasDrag =
          didDrag;


        pointers.delete(
          event.pointerId,
        );


        if (
          pointers.size < 2
        ) {
          pinchDistance =
            0;
        }


        if (
          pointers.size === 0
        ) {
          dragging =
            false;
        }


        if (
          !wasDrag &&
          event.type ===
            "pointerup"
        ) {
          const id =
            pick(
              event.clientX,
              event.clientY,
            );


          const nextSelectedId =
            id &&
            id ===
              selectedRef.current
              ? null
              : id;


          /*
           * Selection is mirrored into the formal runtime
           * state immediately, while React remains responsible
           * for the visible information panel.
           */

                    /*
           * --------------------------------------------------------
           * Guided Ground-Observatory Focus
           * --------------------------------------------------------
           *
           * Selecting uGMRT, HCT or DOT now creates a live
           * world-space camera pose from the marker's current
           * position on the rotating Earth.
           *
           * TESS remains untouched here because its guided
           * spacecraft/sector navigation belongs to the dedicated
           * TESS camera stage.
           */

          const selectedMarker =
            nextSelectedId
              ? markers.find(
                  (marker) =>
                    marker.node.id ===
                    nextSelectedId,
                )
              : undefined;


          if (selectedMarker) {
            const focusPose =
              createObservatoryFocusPose(
                selectedMarker,
              );


            cameraController.transitionTo(
              focusPose,
              {
                duration: 1.25,

                mode:
                  "observatoryApproach",

                inputOwner:
                  "guided",

                selectedId:
                  nextSelectedId,

                onComplete: () => {
                  const currentState =
                    cameraController
                      .getInteractionState();


                  if (
                    currentState
                      .selectedId ===
                    nextSelectedId &&
                    currentState
                      .inputOwner ===
                    "guided"
                  ) {
                    cameraController
                      .setInteractionState({
                        mode:
                          "observatoryFocus",

                        inputOwner:
                          "earth",
                      });
                  }
                },
              },
            );
          } else {
            cameraController
              .setInteractionState({
                selectedId:
                  nextSelectedId,
              });
          }


          onSelectRef.current(
            nextSelectedId,
          );
        }
      };


    /*
     * ------------------------------------------------------------
     * Wheel Zoom
     * ------------------------------------------------------------
     */

    const onWheel =
      (
        event:
          WheelEvent,
      ) => {
        event.preventDefault();


        cameraController
          .setInteractionState({
            mode:
              "sceneOrbit",

            selectedId:
              selectedRef.current,

            inputOwner:
              "camera",
          });


        cameraController
          .zoomByWheel(
            event.deltaY,
          );
      };


    canvas.addEventListener(
      "pointerdown",
      onPointerDown,
    );

    canvas.addEventListener(
      "pointermove",
      onPointerMove,
    );

    canvas.addEventListener(
      "pointerup",
      endPointer,
    );

    canvas.addEventListener(
      "pointercancel",
      endPointer,
    );

    canvas.addEventListener(
      "pointerleave",
      endPointer,
    );

    canvas.addEventListener(
      "wheel",
      onWheel,
      {
        passive: false,
      },
    );


    canvas.style.cursor =
      "grab";


    /*
     * ------------------------------------------------------------
     * Resize
     * ------------------------------------------------------------
     */

    const resize = () => {
      const width =
        host.clientWidth;

      const height =
        host.clientHeight;


      if (
        !width ||
        !height
      ) {
        return;
      }


      renderer.setSize(
        width,
        height,
        false,
      );


      camera.aspect =
        width /
        height;


      camera
        .updateProjectionMatrix();
    };


    resize();


    const resizeObserver =
      new ResizeObserver(
        resize,
      );


    resizeObserver.observe(
      host,
    );


    /*
     * ------------------------------------------------------------
     * Animation State
     * ------------------------------------------------------------
     */

    let lastTime =
      performance.now();

    let animationFrame =
      0;

    let reveal =
      0;

    let spin =
      0;


    /*
     * Manual Earth rotation remains separate from:
     *
     * - automatic scientific Earth rotation;
     * - whole-scene camera orbit.
     */

    let earthDragRotation =
      0;


    /*
     * Restore requests are now consumed through the live ref.
     *
     * This prevents Restore from rebuilding the complete WebGL
     * scene just because React changed restoreSignal.
     */

    let previousRestoreSignal =
      restoreSignalRef.current;


    /*
     * Tracks toolbar ownership changes without rebuilding
     * the Three.js scene.
     */

    let previousInteractionMode =
      interactionModeRef.current;


    const temporaryVector =
      new THREE.Vector3();


    /*
     * ------------------------------------------------------------
     * Main Astra Runtime Loop
     * ------------------------------------------------------------
     */

    const tick = () => {
      animationFrame =
        requestAnimationFrame(
          tick,
        );


      const now =
        performance.now();


      const deltaSeconds =
        Math.min(
          (
            now -
            lastTime
          ) /
            1000,

          0.05,
        );


            lastTime =
        now;


      if (
        !activeRef.current ||
        document.hidden
      ) {
        return;
      }


      /*
       * ----------------------------------------------------------
       * Project Astra Camera Transition Runtime
       * ----------------------------------------------------------
       *
       * Guided camera transitions are advanced from the same
       * canonical animation clock as the rest of the scene.
       *
       * Manual orbit, wheel zoom and pinch zoom can cancel an
       * active transition through AstraCameraController.
       */

      cameraController.update(
        deltaSeconds,
      );


      /*
       * Sun runtime.
       */

      sunSystem.update({
        elapsedSeconds:
          now /
          1000,

        reducedMotion,
      });


      /*
       * ----------------------------------------------------------
       * Formal Interaction-State Synchronization
       * ----------------------------------------------------------
       *
       * React continues to own visible UI state.
       *
       * AstraCameraController owns runtime interaction state.
       *
       * These values are synchronized without reconstructing
       * the scene.
       */

      if (
        interactionModeRef
          .current !==
        previousInteractionMode
      ) {
        previousInteractionMode =
          interactionModeRef.current;


        cameraController
          .setInteractionState({
            selectedId:
              selectedRef.current,

            inputOwner:
              interactionModeRef
                .current ===
              "earth"
                ? "earth"
                : "camera",
          });
      } else if (
        cameraController
          .getInteractionState()
          .selectedId !==
        selectedRef.current
      ) {
        /*
         * React selection may also change through Escape,
         * information-panel close or Restore.
         */

        cameraController
          .setInteractionState({
            selectedId:
              selectedRef.current,
          });
      }


      /*
       * ----------------------------------------------------------
       * Restore Overview
       * ----------------------------------------------------------
       *
       * Restore is now a real runtime signal rather than an
       * effect dependency that reconstructs the scene.
       */

      if (
        restoreSignalRef
          .current !==
        previousRestoreSignal
      ) {
        previousRestoreSignal =
          restoreSignalRef.current;


        cameraController
          .restoreOverview();


        spin =
          0;


        earthDragRotation =
          0;


        dragging =
          false;


        didDrag =
          false;


        pointers.clear();
      }


      /*
       * ----------------------------------------------------------
       * Scene Reveal
       * ----------------------------------------------------------
       */

      reveal =
        Math.min(
          1,

          reveal +
            deltaSeconds *
              0.7,
        );


      earthUniforms
        .reveal
        .value =
        reveal;


      atmosphereMaterial
        .uniforms
        .reveal
        .value =
        reveal;


      /*
       * ----------------------------------------------------------
       * Essential Scientific Earth Motion
       * ----------------------------------------------------------
       *
       * Performance/reduced-motion mode slows the rotation but
       * does not freeze the astronomical system completely.
       *
       * Automatic rotation pauses only while Earth itself is
       * being directly dragged.
       */

      const essentialMotionScale =
        reducedMotion
          ? 0.9
          : 3.0;


      const earthDragActive =
        dragging &&
        interactionModeRef
          .current ===
          "earth";


      if (
        !earthDragActive &&
        reveal >
          0.6
      ) {
        spin +=
          (
            deltaSeconds /
            SPIN_PERIOD
          ) *
          Math.PI *
          2 *
          essentialMotionScale;
      }


      earthGroup.rotation.y =
        overviewEarthRotation +
        earthDragRotation +
        spin;


      /*
       * ----------------------------------------------------------
       * Observatory Markers
       * ----------------------------------------------------------
       */

      const pulse =
        reducedMotion
          ? 0.5
          : (
              Math.sin(
                performance.now() /
                  1400,
              ) +
              1
            ) /
            2;


      markers.forEach(
        (
          marker,
          index,
        ) => {
          const local =
            THREE.MathUtils.clamp(
              (
                reveal -
                0.35 -
                index *
                  0.08
              ) /
                0.3,

              0,
              1,
            );


          const selected =
            selectedRef.current ===
            marker.node.id;


          const hovered =
            hoverId ===
            marker.node.id;


          const emphasis =
            selected
              ? 1
              : hovered
                ? 0.8
                : 0.55;


          (
            marker.core
              .material as
              THREE.MeshBasicMaterial
          ).opacity =
            local *
            (
              0.75 +
              emphasis *
                0.25
            );


          (
            marker.halo
              .material as
              THREE.MeshBasicMaterial
          ).opacity =
            local *
            (
              0.18 +
              pulse *
                0.18 +
              (
                selected
                  ? 0.28
                  : 0
              )
            );


          marker.halo.scale
            .setScalar(
              1 +
                pulse *
                  0.28 +
                (
                  selected
                    ? 0.35
                    : 0
                ),
            );


          marker.core.scale
            .setScalar(
              selected
                ? 1.45
                : hovered
                  ? 1.25
                  : 1,
            );


          (
            marker.beacon
              .material as
              THREE.MeshBasicMaterial
          ).opacity =
            local *
            (
              selected
                ? 0.55
                : 0.22
            );
        },
      );


      /*
       * ----------------------------------------------------------
       * TESS Orbit + Spacecraft
       * ----------------------------------------------------------
       */

      const orbitReveal =
        THREE.MathUtils.clamp(
          (
            reveal -
            0.7
          ) /
            0.3,

          0,
          1,
        );


      tessSystem.update({
        deltaSeconds,

        reveal,

        reducedMotion,

        selected:
          selectedRef.current ===
          spaceNode.id,

        hovered:
          hoverId ===
          spaceNode.id,
      });


      /*
       * ----------------------------------------------------------
       * Labels
       * ----------------------------------------------------------
       */

      const canvasBounds =
        canvas
          .getBoundingClientRect();


      const labelTargets:
        Array<{
          id: string;
          obj: THREE.Object3D;
          ground: boolean;
        }> =
        markers.map(
          (marker) => ({
            id:
              marker.node.id,

            obj:
              marker.core,

            ground:
              true,
          }),
        );


      labelTargets.push({
        id:
          spaceNode.id,

        obj:
          tessSystem.spacecraft,

        ground:
          false,
      });


      const compact =
        canvasBounds.width <
        560;


      labelTargets.forEach(
        (
          target,
        ) => {
          const label =
            labelEls.get(
              target.id,
            );


          if (!label) {
            return;
          }


          target.obj
            .getWorldPosition(
              temporaryVector,
            );


          const worldPosition =
            temporaryVector
              .clone();


          const facing =
            target.ground
              ? worldPosition
                  .clone()
                  .normalize()
                  .dot(
                    camera.position
                      .clone()
                      .sub(
                        worldPosition,
                      )
                      .normalize(),
                  ) >
                0.05
              : true;


          temporaryVector.project(
            camera,
          );


          const screenX =
            (
              (
                temporaryVector.x +
                1
              ) /
              2
            ) *
            canvasBounds.width;


          const screenY =
            (
              (
                1 -
                temporaryVector.y
              ) /
              2
            ) *
            canvasBounds.height;


          label.style.transform =
            `translate3d(${Math.round(
              screenX + 10,
            )}px, ${Math.round(
              screenY - 10,
            )}px, 0)`;


          const selected =
            selectedRef.current ===
            target.id;


          const hovered =
            hoverId ===
            target.id;


          const show =
            facing &&
            orbitReveal >
              0.2 &&
            (
              selected ||
              hovered ||
              !compact
            );


          label.style.opacity =
            show
              ? selected ||
                hovered
                ? "1"
                : "0.72"
              : "0";
        },
      );


      /*
       * ----------------------------------------------------------
       * Render
       * ----------------------------------------------------------
       */

      renderer.render(
        scene,
        camera,
      );
    };


    animationFrame =
      requestAnimationFrame(
        tick,
      );


    /*
     * ------------------------------------------------------------
     * WebGL Context Recovery
     * ------------------------------------------------------------
     */

    const onContextLost =
      (
        event:
          Event,
      ) => {
        event.preventDefault();
        onError();
      };


    canvas.addEventListener(
      "webglcontextlost",
      onContextLost,
    );


    /*
     * ------------------------------------------------------------
     * Cleanup
     * ------------------------------------------------------------
     */

    return () => {
      disposed =
        true;


      cancelAnimationFrame(
        animationFrame,
      );


      resizeObserver
        .disconnect();


      canvas.removeEventListener(
        "pointerdown",
        onPointerDown,
      );


      canvas.removeEventListener(
        "pointermove",
        onPointerMove,
      );


      canvas.removeEventListener(
        "pointerup",
        endPointer,
      );


      canvas.removeEventListener(
        "pointercancel",
        endPointer,
      );


      canvas.removeEventListener(
        "pointerleave",
        endPointer,
      );


      canvas.removeEventListener(
        "wheel",
        onWheel,
      );


      canvas.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );


      labelEls.forEach(
        (
          label,
        ) =>
          label.remove(),
      );


      disposables.forEach(
        (
          disposable,
        ) =>
          disposable.dispose(),
      );


      renderer.dispose();


      if (
        canvas.parentNode
      ) {
        canvas.parentNode
          .removeChild(
            canvas,
          );
      }
    };


    /*
     * Scene is deliberately persistent.
     *
     * selectedId, interactionMode, active and restoreSignal are
     * live through refs and therefore must not recreate WebGL.
     */

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reducedMotion,
  ]);


  return (
    <div className="absolute inset-0">
      <div
        ref={hostRef}
        className="absolute inset-0"
      />

      <div
        ref={labelRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      />
    </div>
  );
}