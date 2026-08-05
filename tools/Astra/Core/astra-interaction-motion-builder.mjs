import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const currentFile =
  fileURLToPath(import.meta.url);

const repositoryRoot =
  path.resolve(
    path.dirname(currentFile),
    "..",
    "..",
    "..",
  );

const globePath =
  path.join(
    repositoryRoot,
    "src",
    "components",
    "observatory",
    "GlobeScene.tsx",
  );

const globeWrapperPath =
  path.join(
    repositoryRoot,
    "src",
    "components",
    "observatory",
    "ObservatoryNetworkGlobe.tsx",
  );

const compositionPath =
  path.join(
    repositoryRoot,
    "src",
    "components",
    "observatory",
    "astra",
    "composition.ts",
  );

const tessPath =
  path.join(
    repositoryRoot,
    "src",
    "components",
    "observatory",
    "astra",
    "tess-orbit-system.ts",
  );

const backupDirectory =
  path.join(
    repositoryRoot,
    ".astra-backup",
  );

function fail(message) {
  console.error(
    `\n[Astra Interaction Builder] ERROR: ${message}\n`,
  );

  process.exit(1);
}

function log(message) {
  console.log(
    `[Astra Interaction Builder] ${message}`,
  );
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n");
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
      `Could not find expected source block: ${description}`,
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
      `Expected exactly one source block for: ${description}`,
    );
  }

  return source.replace(
    searchValue,
    replacement,
  );
}

function replaceRegexExactlyOnce(
  source,
  pattern,
  replacement,
  description,
) {
  const matches = [
    ...source.matchAll(pattern),
  ];

  if (matches.length !== 1) {
    fail(
      `Expected exactly one regex match for ${description}, found ${matches.length}.`,
    );
  }

  return source.replace(
    pattern,
    replacement,
  );
}

function createTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-");
}

function createBackup(
  sourcePath,
  source,
  label,
  timestamp,
) {
  fs.mkdirSync(
    backupDirectory,
    {
      recursive: true,
    },
  );

  const backupPath =
    path.join(
      backupDirectory,
      `${label}.${timestamp}`,
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

function verifyRequiredFiles() {
  const requiredFiles = [
    globePath,
    globeWrapperPath,
    compositionPath,
    tessPath,
  ];

  for (const requiredFile of requiredFiles) {
    if (
      !fs.existsSync(requiredFile)
    ) {
      fail(
        `Required file was not found:\n${requiredFile}`,
      );
    }
  }
}

function updateComposition(source) {
  let updatedSource =
    source;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `    distance: 5.8,
    azimuth: -2.54,
    polar: 1.79,`,
      `    /*
     * Desktop opening calibration:
     *
     * - Earth remains the dominant visual subject;
     * - India and South Asia sit near the visual centre;
     * - the fixed Sun remains visible beyond Earth's limb;
     * - usable negative space remains for the future Moon.
     */
    distance: 5.05,
    azimuth: -2.54,
    polar: 1.35,`,
      "overview composition calibration",
    );

  return updatedSource;
}

function updateTessSystem(source) {
  let updatedSource =
    source;

  updatedSource =
    replaceRegexExactlyOnce(
      updatedSource,
      /  const initialProgress =\n\s+reducedMotion \? 0\.18 : 0;/g,
      `  /*
   * Opening orbital phase deliberately separates TESS
   * from the visible Sun in the canonical overview.
   */
  const initialProgress = 0.34;`,
      "TESS opening orbital phase",
    );

  return updatedSource;
}

function updateGlobeScene(source) {
  let updatedSource =
    source;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `export type GlobeSceneProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReady: () => void;
  onError: () => void;
  reducedMotion: boolean;
  active: boolean;
};`,
      `export type AstraInteractionMode =
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
};`,
      "GlobeScene interaction props",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `  reducedMotion,
  active,
}: GlobeSceneProps) {`,
      `  reducedMotion,
  active,
  interactionMode,
  restoreSignal,
}: GlobeSceneProps) {`,
      "GlobeScene prop destructuring",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `  const selectedRef = useRef<string | null>(selectedId);
  const activeRef = useRef(active);
  const onSelectRef = useRef(onSelect);`,
      `  const selectedRef =
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
    useRef(restoreSignal);`,
      "GlobeScene runtime refs",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `  selectedRef.current = selectedId;
  activeRef.current = active;
  onSelectRef.current = onSelect;`,
      `  selectedRef.current =
    selectedId;

  activeRef.current =
    active;

  onSelectRef.current =
    onSelect;

  interactionModeRef.current =
    interactionMode;`,
      "GlobeScene ref synchronization",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `    let spin = 0;
    const tmp = new THREE.Vector3();`,
      `    let spin = 0;

    /*
     * Manual Earth rotation is separate from automatic
     * scientific rotation and from whole-scene camera orbit.
     */
    let earthDragRotation = 0;

    let previousRestoreSignal =
      restoreSignalRef.current;

    const tmp =
      new THREE.Vector3();`,
      "Earth drag rotation state",
    );

  const currentDragBlock =
    `      if (dragging && prev) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) didDrag = true;
        cameraController.orbit(dx, dy);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        return;
      }`;

  const newDragBlock =
    `      if (
        dragging &&
        prev
      ) {
        const dx =
          e.clientX -
          prev.x;

        const dy =
          e.clientY -
          prev.y;

        if (
          Math.abs(dx) +
            Math.abs(dy) >
          3
        ) {
          didDrag = true;
        }

        if (
          interactionModeRef.current ===
          "earth"
        ) {
          /*
           * Default interaction: rotate Earth itself.
           * Observatory markers are children of earthGroup,
           * so they remain geographically attached.
           */
          earthDragRotation -=
            dx * 0.006;
        } else {
          /*
           * Explicit Orbit Scene mode:
           * move the camera around the complete system.
           */
          cameraController.orbit(
            dx,
            dy,
          );
        }

        pointers.set(
          e.pointerId,
          {
            x: e.clientX,
            y: e.clientY,
          },
        );

        return;
      }`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentDragBlock,
      newDragBlock,
      "Earth versus scene drag interaction",
    );

  const currentRotationBlock =
    `      /*
       * Continuous Earth rotation.
       *
       * Hover, selection, pointer movement and wheel zoom must not
       * stop the planet. Rotation pauses only while the user is
       * actively dragging the scene.
       */
      if (
        !reducedMotion &&
        !dragging &&
        reveal > 0.6
      ) {
        spin +=
          (dt / SPIN_PERIOD) *
          Math.PI *
          2;
      }

      earthGroup.rotation.y =
        overviewEarthRotation +
        spin;`;

  const newRotationBlock =
    `      /*
       * Essential scientific Earth motion.
       *
       * Performance or reduced-motion mode slows the rotation
       * but never freezes the astronomical system completely.
       * Rotation pauses only during an active Earth drag.
       */
      const essentialMotionScale =
        reducedMotion
          ? 0.28
          : 1;

      const earthDragActive =
        dragging &&
        interactionModeRef.current ===
          "earth";

      if (
        !earthDragActive &&
        reveal > 0.6
      ) {
        spin +=
          (dt / SPIN_PERIOD) *
          Math.PI *
          2 *
          essentialMotionScale;
      }

      earthGroup.rotation.y =
        overviewEarthRotation +
        earthDragRotation +
        spin;`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentRotationBlock,
      newRotationBlock,
      "essential continuous Earth rotation",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `      sunSystem.update({
        elapsedSeconds: now / 1000,
        reducedMotion,
      });

      reveal = Math.min(1, reveal + dt * 0.7);`,
      `      sunSystem.update({
        elapsedSeconds:
          now / 1000,
        reducedMotion,
      });

      /*
       * Restore requests originate from the visible React
       * control bar and are consumed once inside the scene.
       */
      if (
        restoreSignal !==
        previousRestoreSignal
      ) {
        previousRestoreSignal =
          restoreSignal;

        restoreSignalRef.current =
          restoreSignal;

        cameraController
          .restoreOverview();

        spin = 0;
        earthDragRotation = 0;
        dragging = false;
        didDrag = false;
        pointers.clear();
      }

      reveal =
        Math.min(
          1,
          reveal +
            dt *
              0.7,
        );`,
      "Restore Overview scene handling",
    );

  /*
   * restoreSignal is intentionally added to the effect
   * dependency so the scene consumes React restore requests.
   */
  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `  }, [reducedMotion]);`,
      `  }, [
    reducedMotion,
    restoreSignal,
  ]);`,
      "GlobeScene effect dependencies",
    );

  return updatedSource;
}

function updateGlobeWrapper(source) {
  let updatedSource =
    source;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `import { ArrowRight, Globe2, MapPin, Move3d, Satellite, X } from "lucide-react";`,
      `import {
  ArrowRight,
  Globe2,
  MapPin,
  Move3d,
  Orbit,
  Rotate3d,
  RotateCcw,
  Satellite,
  X,
} from "lucide-react";`,
      "Observatory interaction icons",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `const GlobeScene = lazy(() => import("./GlobeScene"));`,
      `const GlobeScene =
  lazy(
    () =>
      import("./GlobeScene"),
  );

type AstraInteractionMode =
  | "earth"
  | "scene";`,
      "interaction mode type",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `  const [reduced, setReduced] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);`,
      `  const [reduced, setReduced] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [
    interactionMode,
    setInteractionMode,
  ] =
    useState<AstraInteractionMode>(
      "earth",
    );

  const [
    restoreSignal,
    setRestoreSignal,
  ] =
    useState(0);`,
      "Observatory interaction state",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `                  reducedMotion={lowPower}
                  active={inView}
                />`,
      `                  reducedMotion={
                    lowPower
                  }
                  active={inView}
                  interactionMode={
                    interactionMode
                  }
                  restoreSignal={
                    restoreSignal
                  }
                />`,
      "GlobeScene interaction props",
    );

  const currentHintBlock =
    `          {ready && !hintDismissed && !failed && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[oklch(0.12_0.03_265/0.75)] px-3 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
              <Move3d className="mr-1 inline h-3 w-3" aria-hidden /> Drag to rotate · scroll or pinch to zoom
            </div>
          )}`;

  const newControlBlock =
    `          {ready && !failed && (
            <div
              className="absolute bottom-3 left-1/2 z-20 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.82)] p-1 text-[10px] shadow-lg backdrop-blur-md"
              role="toolbar"
              aria-label="Observatory interaction controls"
            >
              <button
                type="button"
                onClick={() => {
                  setInteractionMode(
                    "earth",
                  );
                  setHintDismissed(
                    true,
                  );
                }}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                  interactionMode ===
                    "earth"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
                aria-pressed={
                  interactionMode ===
                  "earth"
                }
                title="Drag to rotate Earth independently"
              >
                <Rotate3d
                  className="h-3 w-3"
                  aria-hidden
                />
                <span className="whitespace-nowrap">
                  Rotate Earth
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInteractionMode(
                    "scene",
                  );
                  setHintDismissed(
                    true,
                  );
                }}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                  interactionMode ===
                    "scene"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
                aria-pressed={
                  interactionMode ===
                  "scene"
                }
                title="Drag to orbit the complete astronomical scene"
              >
                <Orbit
                  className="h-3 w-3"
                  aria-hidden
                />
                <span className="whitespace-nowrap">
                  Orbit Scene
                </span>
              </button>

              <span
                className="mx-0.5 h-4 w-px bg-white/10"
                aria-hidden
              />

              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setInteractionMode(
                    "earth",
                  );
                  setRestoreSignal(
                    (value) =>
                      value + 1,
                  );
                  setHintDismissed(
                    true,
                  );
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                title="Restore the canonical India–Sun overview"
              >
                <RotateCcw
                  className="h-3 w-3"
                  aria-hidden
                />
                <span className="whitespace-nowrap">
                  Restore
                </span>
              </button>

              {!hintDismissed && (
                <span className="hidden items-center gap-1 px-1 text-muted-foreground sm:flex">
                  <Move3d
                    className="h-3 w-3"
                    aria-hidden
                  />
                  Drag · scroll or pinch
                </span>
              )}
            </div>
          )}`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentHintBlock,
      newControlBlock,
      "visible Observatory interaction bar",
    );

  return updatedSource;
}

function validateResult(
  globeSource,
  wrapperSource,
  compositionSource,
  tessSource,
) {
  const requiredGlobeFragments = [
    'interactionMode: AstraInteractionMode;',
    "restoreSignal: number;",
    "earthDragRotation",
    'interactionModeRef.current ===',
    '"earth"',
    "essentialMotionScale",
    "cameraController",
    ".restoreOverview();",
  ];

  for (
    const fragment
    of requiredGlobeFragments
  ) {
    if (
      !globeSource.includes(
        fragment,
      )
    ) {
      fail(
        `GlobeScene validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  const forbiddenGlobeFragments = [
    "!reducedMotion &&",
    "cameraController.orbit(dx, dy);",
  ];

  for (
    const fragment
    of forbiddenGlobeFragments
  ) {
    if (
      globeSource.includes(
        fragment,
      )
    ) {
      fail(
        `GlobeScene validation failed. Legacy fragment remains: ${fragment}`,
      );
    }
  }

  const requiredWrapperFragments = [
    "Rotate Earth",
    "Orbit Scene",
    "Restore",
    "interactionMode={",
    "restoreSignal={",
    "setRestoreSignal",
  ];

  for (
    const fragment
    of requiredWrapperFragments
  ) {
    if (
      !wrapperSource.includes(
        fragment,
      )
    ) {
      fail(
        `Observatory wrapper validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  const requiredCompositionFragments = [
    "distance: 5.05",
    "polar: 1.35",
  ];

  for (
    const fragment
    of requiredCompositionFragments
  ) {
    if (
      !compositionSource.includes(
        fragment,
      )
    ) {
      fail(
        `Composition validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  if (
    !tessSource.includes(
      "const initialProgress = 0.34;",
    )
  ) {
    fail(
      "TESS opening-phase validation failed.",
    );
  }
}

function main() {
  log(
    "Starting Project Astra Phase 4.2 interaction and motion correction.",
  );

  verifyRequiredFiles();

  const rawGlobeSource =
    fs.readFileSync(
      globePath,
      "utf8",
    );

  const rawWrapperSource =
    fs.readFileSync(
      globeWrapperPath,
      "utf8",
    );

  const rawCompositionSource =
    fs.readFileSync(
      compositionPath,
      "utf8",
    );

  const rawTessSource =
    fs.readFileSync(
      tessPath,
      "utf8",
    );

  const updatedGlobeSource =
    updateGlobeScene(
      normalizeLineEndings(
        rawGlobeSource,
      ),
    );

  const updatedWrapperSource =
    updateGlobeWrapper(
      normalizeLineEndings(
        rawWrapperSource,
      ),
    );

  const updatedCompositionSource =
    updateComposition(
      normalizeLineEndings(
        rawCompositionSource,
      ),
    );

  const updatedTessSource =
    updateTessSystem(
      normalizeLineEndings(
        rawTessSource,
      ),
    );

  validateResult(
    updatedGlobeSource,
    updatedWrapperSource,
    updatedCompositionSource,
    updatedTessSource,
  );

  const timestamp =
    createTimestamp();

  createBackup(
    globePath,
    rawGlobeSource,
    "GlobeScene.before-interaction-motion.tsx",
    timestamp,
  );

  createBackup(
    globeWrapperPath,
    rawWrapperSource,
    "ObservatoryNetworkGlobe.before-interaction-motion.tsx",
    timestamp,
  );

  createBackup(
    compositionPath,
    rawCompositionSource,
    "composition.before-interaction-motion.ts",
    timestamp,
  );

  createBackup(
    tessPath,
    rawTessSource,
    "tess-orbit-system.before-opening-phase.ts",
    timestamp,
  );

  fs.writeFileSync(
    globePath,
    updatedGlobeSource,
    "utf8",
  );

  fs.writeFileSync(
    globeWrapperPath,
    updatedWrapperSource,
    "utf8",
  );

  fs.writeFileSync(
    compositionPath,
    updatedCompositionSource,
    "utf8",
  );

  fs.writeFileSync(
    tessPath,
    updatedTessSource,
    "utf8",
  );

  log(
    "Phase 4.2 interaction and motion correction completed successfully.",
  );

  log(
    `Updated:\n${globePath}`,
  );

  log(
    `Updated:\n${globeWrapperPath}`,
  );

  log(
    `Updated:\n${compositionPath}`,
  );

  log(
    `Updated:\n${tessPath}`,
  );

  log(
    "No Git operation was performed.",
  );
}

main();