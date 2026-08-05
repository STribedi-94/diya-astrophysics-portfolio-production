import * as THREE from "three";

/**
 * Canonical Project Astra overview composition.
 *
 * This object is the single authoritative source for:
 *
 * - initial Observatory framing;
 * - Restore Overview;
 * - future Moon-ready scene composition;
 * - future guided camera transitions.
 *
 * Earth remains centred at the world origin.
 * The camera is positioned so India is presented in the opening view
 * while the fixed world-space Sun remains visible beyond Earth's limb.
 */
export const ASTRA_OVERVIEW_CAMERA =
  Object.freeze({
    /*
     * Desktop opening calibration:
     *
     * - Earth remains the dominant visual subject;
     * - India and South Asia sit near the visual centre;
     * - the fixed Sun remains visible beyond Earth's limb;
     * - usable negative space remains for the future Moon.
     */
    /*
     * Refined cinematic opening:
     *
     * - Earth retains its increased prominence;
     * - India remains immediately identifiable;
     * - the fixed world-space Sun is projected inside
     *   the initial camera frame beyond Earth's limb;
     * - negative space remains available for the Moon.
     */
    /*
     * Final Phase 4.2 opening-balance calibration.
     *
     * The camera is moved slightly closer and nearer to
     * Earth's equatorial plane. This keeps the fixed Sun
     * inside the frame while presenting India farther from
     * the northern limb and at a more readable scale.
     */
    distance: 4.85,
    azimuth: -2.54,
    polar: 1.60,
    minDistance: 3.2,
    maxDistance: 8.5,
  });

/**
 * The canonical overview target currently remains Earth-centred.
 *
 * This function intentionally returns a new vector so camera systems
 * never share or mutate one global THREE.Vector3 instance.
 */
export function createAstraOverviewTarget() {
  return new THREE.Vector3(
    0,
    0,
    0,
  );
}
