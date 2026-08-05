import * as THREE from "three";
import type { NetworkNode } from "@/data/observatory-network";

const ORBIT_A = 2.625;
const ORBIT_E = 0.4857;
const ORBIT_B =
  ORBIT_A * Math.sqrt(1 - ORBIT_E * ORBIT_E);

export const TESS_ORBIT_PERIOD = 45;

export type TessOrbitSystem = {
  group: THREE.Group;
  spacecraft: THREE.Group;
  glow: THREE.Mesh;
  pathMaterial: THREE.LineBasicMaterial;
  bodyMaterial: THREE.MeshStandardMaterial;
  panelMaterial: THREE.MeshStandardMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
  update(options: {
    deltaSeconds: number;
    reveal: number;
    reducedMotion: boolean;
    selected: boolean;
    hovered: boolean;
  }): void;
  dispose(): void;
};

function orbitPoint(
  eccentricAnomaly: number,
): THREE.Vector3 {
  return new THREE.Vector3(
    ORBIT_A *
      (Math.cos(eccentricAnomaly) - ORBIT_E),
    0,
    ORBIT_B * Math.sin(eccentricAnomaly),
  );
}

function solveKepler(
  meanAnomaly: number,
): number {
  let eccentricAnomaly = meanAnomaly;

  for (
    let iteration = 0;
    iteration < 6;
    iteration++
  ) {
    eccentricAnomaly -=
      (
        eccentricAnomaly -
        ORBIT_E * Math.sin(eccentricAnomaly) -
        meanAnomaly
      ) /
      (
        1 -
        ORBIT_E * Math.cos(eccentricAnomaly)
      );
  }

  return eccentricAnomaly;
}

function addSolarCellGrid(options: {
  panel: THREE.Group;
  panelWidth: number;
  panelHeight: number;
  lineMaterial: THREE.Material;
  disposables: Array<{ dispose(): void }>;
}) {
  const {
    panel,
    panelWidth,
    panelHeight,
    lineMaterial,
    disposables,
  } = options;

  const railGeometry = new THREE.BoxGeometry(
    0.004,
    0.004,
    panelHeight,
  );

  for (const x of [-0.08, 0, 0.08]) {
    const rail = new THREE.Mesh(
      railGeometry,
      lineMaterial,
    );

    rail.position.set(x, 0.006, 0);
    panel.add(rail);
  }

  const crossGeometry = new THREE.BoxGeometry(
    panelWidth,
    0.004,
    0.004,
  );

  for (const z of [-0.045, 0, 0.045]) {
    const crossRail = new THREE.Mesh(
      crossGeometry,
      lineMaterial,
    );

    crossRail.position.set(0, 0.006, z);
    panel.add(crossRail);
  }

  disposables.push(
    railGeometry,
    crossGeometry,
  );
}

export function createTessOrbitSystem(options: {
  scene: THREE.Scene;
  node: NetworkNode;
  reducedMotion: boolean;
}): TessOrbitSystem {
  const {
    scene,
    node,
    reducedMotion,
  } = options;

  const ownedDisposables:
    Array<{ dispose(): void }> = [];

  /*
   * Orbit
   */

  const group = new THREE.Group();

  group.rotation.set(
    0.42,
    0.55,
    0.22,
  );

  scene.add(group);
    const pathPoints: THREE.Vector3[] = [];

  for (
    let index = 0;
    index <= 240;
    index++
  ) {
    pathPoints.push(
      orbitPoint(
        (index / 240) *
          Math.PI *
          2,
      ),
    );
  }

  const pathGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(pathPoints);

  const pathMaterial =
    new THREE.LineBasicMaterial({
      color: new THREE.Color(node.color),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

  group.add(
    new THREE.Line(
      pathGeometry,
      pathMaterial,
    ),
  );

  ownedDisposables.push(
    pathGeometry,
    pathMaterial,
  );

  /*
   * Spacecraft root
   */

  const spacecraft = new THREE.Group();

  /*
   * Central spacecraft bus
   */

  const bodyGeometry =
    new THREE.BoxGeometry(
      0.16,
      0.13,
      0.22,
    );

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xded9cb,
      roughness: 0.52,
      metalness: 0.28,
      transparent: true,
      opacity: 0,
    });

  const body = new THREE.Mesh(
    bodyGeometry,
    bodyMaterial,
  );

  spacecraft.add(body);

  /*
   * Gold thermal side panels
   */

  const thermalGeometry =
    new THREE.BoxGeometry(
      0.166,
      0.136,
      0.012,
    );

  const thermalMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xb99142,
      roughness: 0.48,
      metalness: 0.5,
      transparent: true,
      opacity: 0,
    });

  const thermalFront =
    new THREE.Mesh(
      thermalGeometry,
      thermalMaterial,
    );

  thermalFront.position.z = 0.112;

  const thermalBack =
    thermalFront.clone();

  thermalBack.position.z = -0.112;

  spacecraft.add(
    thermalFront,
    thermalBack,
  );

  /*
   * Telescope barrel and aperture
   */

  const barrelGeometry =
    new THREE.CylinderGeometry(
      0.055,
      0.065,
      0.14,
      24,
    );

  const barrelMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xe5e4df,
      roughness: 0.38,
      metalness: 0.42,
      transparent: true,
      opacity: 0,
    });

  const barrel = new THREE.Mesh(
    barrelGeometry,
    barrelMaterial,
  );

  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = -0.17;

  spacecraft.add(barrel);

  const apertureGeometry =
    new THREE.CylinderGeometry(
      0.043,
      0.043,
      0.012,
      24,
    );

  const apertureMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x080b12,
      roughness: 0.12,
      metalness: 0.18,
      transparent: true,
      opacity: 0,
    });

  const aperture = new THREE.Mesh(
    apertureGeometry,
    apertureMaterial,
  );

  aperture.rotation.x = Math.PI / 2;
  aperture.position.z = -0.244;

  spacecraft.add(aperture);

  /*
   * Solar-array supports
   */

  const supportGeometry =
    new THREE.BoxGeometry(
      0.11,
      0.018,
      0.018,
    );

  const supportMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x9a8562,
      roughness: 0.45,
      metalness: 0.55,
      transparent: true,
      opacity: 0,
    });

  const leftSupport = new THREE.Mesh(
    supportGeometry,
    supportMaterial,
  );

  leftSupport.position.x = -0.13;

  const rightSupport =
    leftSupport.clone();

  rightSupport.position.x = 0.13;

  spacecraft.add(
    leftSupport,
    rightSupport,
  );

  /*
   * Broad segmented solar arrays
   */

  const panelWidth = 0.28;
  const panelHeight = 0.15;

  const panelGeometry =
    new THREE.BoxGeometry(
      panelWidth,
      0.009,
      panelHeight,
    );

  const panelMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x2359a8,
      roughness: 0.3,
      metalness: 0.36,
      emissive: new THREE.Color(0x071d48),
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0,
    });

  const gridMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd2ad4d,
      roughness: 0.42,
      metalness: 0.62,
      transparent: true,
      opacity: 0,
    });

  const leftPanelGroup =
    new THREE.Group();

  const leftPanel = new THREE.Mesh(
    panelGeometry,
    panelMaterial,
  );

  leftPanelGroup.add(leftPanel);

  addSolarCellGrid({
    panel: leftPanelGroup,
    panelWidth,
    panelHeight,
    lineMaterial: gridMaterial,
    disposables: ownedDisposables,
  });

  leftPanelGroup.position.x = -0.32;

  const rightPanelGroup =
    new THREE.Group();

  const rightPanel = new THREE.Mesh(
    panelGeometry,
    panelMaterial,
  );

  rightPanelGroup.add(rightPanel);

  addSolarCellGrid({
    panel: rightPanelGroup,
    panelWidth,
    panelHeight,
    lineMaterial: gridMaterial,
    disposables: ownedDisposables,
  });

  rightPanelGroup.position.x = 0.32;

  spacecraft.add(
    leftPanelGroup,
    rightPanelGroup,
  );

  /*
   * Upper antenna assembly
   */

  const mastGeometry =
    new THREE.CylinderGeometry(
      0.008,
      0.008,
      0.09,
      10,
    );

  const mastMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xb8b3a9,
      roughness: 0.4,
      metalness: 0.55,
      transparent: true,
      opacity: 0,
    });

  const mast = new THREE.Mesh(
    mastGeometry,
    mastMaterial,
  );

  mast.position.y = 0.105;

  spacecraft.add(mast);

  const dishGeometry =
    new THREE.CylinderGeometry(
      0.045,
      0.012,
      0.018,
      20,
    );

  const dishMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd6d1c5,
      roughness: 0.36,
      metalness: 0.5,
      transparent: true,
      opacity: 0,
    });

  const dish = new THREE.Mesh(
    dishGeometry,
    dishMaterial,
  );

  dish.position.y = 0.155;

  spacecraft.add(dish);

  /*
   * Whole-spacecraft glow and picking target
   */

  const glowGeometry =
    new THREE.SphereGeometry(
      0.28,
      20,
      14,
    );

  const glowMaterial =
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(node.color),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

  const glow = new THREE.Mesh(
    glowGeometry,
    glowMaterial,
  );

  glow.scale.set(
    2.15,
    0.9,
    0.9,
  );

  spacecraft.add(glow);
  group.add(spacecraft);

  ownedDisposables.push(
    bodyGeometry,
    bodyMaterial,
    thermalGeometry,
    thermalMaterial,
    barrelGeometry,
    barrelMaterial,
    apertureGeometry,
    apertureMaterial,
    supportGeometry,
    supportMaterial,
    panelGeometry,
    panelMaterial,
    gridMaterial,
    mastGeometry,
    mastMaterial,
    dishGeometry,
    dishMaterial,
    glowGeometry,
    glowMaterial,
  );

  /*
   * Absolute-time orbital clock.
   *
   * The position is derived from elapsed time instead
   * of depending only on accumulated animation deltas.
   * Selection, hover and temporary inactivity therefore
   * cannot permanently stop the orbit.
   */

  const initialProgress =
    reducedMotion ? 0.18 : 0;

  const orbitStartTime =
    performance.now() -
    initialProgress *
      TESS_ORBIT_PERIOD *
      1000;

  return {
    group,
    spacecraft,
    glow,
    pathMaterial,
    bodyMaterial,
    panelMaterial,
    glowMaterial,

    update({
      reveal,
      selected,
      hovered,
    }) {
      const orbitReveal =
        THREE.MathUtils.clamp(
          (reveal - 0.7) / 0.3,
          0,
          1,
        );

      pathMaterial.opacity =
        orbitReveal * 0.4;

           /*
       * The orbital position always follows the absolute simulation
       * clock. Reduced-motion and performance modes may simplify
       * decorative animation later, but they must never stop the
       * scientifically meaningful orbital journey.
       */
      const orbitProgress =
        (
          (
            performance.now() -
            orbitStartTime
          ) /
          1000 /
          TESS_ORBIT_PERIOD
        ) %
        1;

      const eccentricAnomaly =
        solveKepler(
          orbitProgress *
            Math.PI *
            2,
        );

      spacecraft.position.copy(
        orbitPoint(eccentricAnomaly),
      );

      spacecraft.lookAt(0, 0, 0);

      const mainOpacity = orbitReveal;

      bodyMaterial.opacity = mainOpacity;
      thermalMaterial.opacity = mainOpacity;
      barrelMaterial.opacity = mainOpacity;
      apertureMaterial.opacity = mainOpacity;
      supportMaterial.opacity = mainOpacity;
      panelMaterial.opacity = mainOpacity;
      gridMaterial.opacity = mainOpacity;
      mastMaterial.opacity = mainOpacity;
      dishMaterial.opacity = mainOpacity;

      glowMaterial.opacity =
        orbitReveal *
        (
          selected
            ? 0.2
            : hovered
              ? 0.13
              : 0.045
        );

      glow.scale.set(
        selected ? 2.35 : 2.15,
        selected ? 1 : 0.9,
        selected ? 1 : 0.9,
      );

      spacecraft.scale.setScalar(
        selected
          ? 1.12
          : hovered
            ? 1.06
            : 1,
      );
    },

    dispose() {
      scene.remove(group);

      for (
        const disposable
        of ownedDisposables
      ) {
        disposable.dispose();
      }

      group.clear();
    },
  };
}