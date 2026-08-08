import type {
  ObservatoryEnvironmentSystem,
} from "./observatory-environment-system";

import type {
  ObservatoryLightingPhase,
} from "./observatory-destinations";

import type {
  GroundObservatoryId,
} from "./observatory-registry";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Ground Observatory Journey Controller
 * ------------------------------------------------------------------
 *
 * Purpose:
 *
 * Own the runtime relationship between:
 *
 * Earth Observatory selection
 *        ↓
 * geographic guided focus
 *        ↓
 * local Observatory destination
 *
 * This controller deliberately does NOT own:
 *
 * - React selectedId;
 * - Earth rotation;
 * - geographic coordinates;
 * - AstraCameraController;
 * - TESS;
 * - the final cinematic camera path.
 *
 * Those integrations are added separately so the existing accepted
 * Project Astra scene remains stable.
 */


/*
 * ------------------------------------------------------------------
 * TYPES
 * ------------------------------------------------------------------
 */

export type ObservatoryJourneyPhase =
  | "idle"
  | "earth-focus"
  | "destination-ready"
  | "destination-active"
  | "returning";


export type ObservatoryJourneyState = {
  phase:
    ObservatoryJourneyPhase;

  observatoryId:
    GroundObservatoryId | null;
};


export type ObservatoryJourneyControllerOptions = {
  ugmrt:
    ObservatoryEnvironmentSystem;

  hct:
    ObservatoryEnvironmentSystem;

  dot:
    ObservatoryEnvironmentSystem;
};


export type ObservatoryJourneyController = {
  getState():
    ObservatoryJourneyState;

  beginEarthFocus(
    observatoryId:
      GroundObservatoryId,
  ): void;

  markDestinationReady(
    observatoryId:
      GroundObservatoryId,
  ): void;

  activateDestination(
    observatoryId:
      GroundObservatoryId,
  ): void;

  setLightingPhase(
    phase:
      ObservatoryLightingPhase,
  ): void;

  beginReturn(): void;

  reset(): void;

  dispose(): void;
};


/*
 * ------------------------------------------------------------------
 * FACTORY
 * ------------------------------------------------------------------
 */

export function createObservatoryJourneyController({
  ugmrt,
  hct,
  dot,
}: ObservatoryJourneyControllerOptions): ObservatoryJourneyController {
  const environmentSystems =
    {
      ugmrt,
      hct,
      dot,
    } satisfies Record<
      GroundObservatoryId,
      ObservatoryEnvironmentSystem
    >;


  let state:
    ObservatoryJourneyState =
    {
      phase:
        "idle",

      observatoryId:
        null,
    };


  let disposed =
    false;


  /*
   * --------------------------------------------------------------
   * VISIBILITY OWNERSHIP
   * --------------------------------------------------------------
   *
   * This is the single authoritative place controlling local
   * Observatory-environment visibility.
   *
   * Never allow two destination worlds to be visible simultaneously.
   */

  const hideAllDestinations =
    () => {
      environmentSystems
        .ugmrt
        .setVisible(
          false,
        );

      environmentSystems
        .hct
        .setVisible(
          false,
        );

      environmentSystems
        .dot
        .setVisible(
          false,
        );
    };


  const showOnlyDestination =
    (
      observatoryId:
        GroundObservatoryId,
    ) => {
      hideAllDestinations();

      environmentSystems[
        observatoryId
      ].setVisible(
        true,
      );
    };


  /*
   * Start from a guaranteed hidden state.
   */

  hideAllDestinations();


  return {

    /*
     * ------------------------------------------------------------
     * STATE
     * ------------------------------------------------------------
     */

    getState() {
      return {
        ...state,
      };
    },


    /*
     * ------------------------------------------------------------
     * EARTH FOCUS
     * ------------------------------------------------------------
     *
     * Called when uGMRT / HCT / DOT has been selected and the current
     * geographic Earth-focus transition begins.
     *
     * The destination remains hidden throughout that transition.
     */

    beginEarthFocus(
      observatoryId,
    ) {
      if (disposed) {
        return;
      }


      hideAllDestinations();


      state = {
        phase:
          "earth-focus",

        observatoryId,
      };
    },


    /*
     * ------------------------------------------------------------
     * DESTINATION READY
     * ------------------------------------------------------------
     *
     * Called only after the geographic Observatory approach has
     * completed successfully.
     *
     * Environment remains hidden at this stage. This gives the later
     * cinematic journey system an explicit handoff point.
     */

    markDestinationReady(
      observatoryId,
    ) {
      if (disposed) {
        return;
      }


      if (
        state.observatoryId !==
        observatoryId
      ) {
        return;
      }


      state = {
        phase:
          "destination-ready",

        observatoryId,
      };
    },


    /*
     * ------------------------------------------------------------
     * ACTIVATE LOCAL DESTINATION
     * ------------------------------------------------------------
     */

    activateDestination(
      observatoryId,
    ) {
      if (disposed) {
        return;
      }


      if (
        state.observatoryId !==
        observatoryId
      ) {
        state = {
          phase:
            "destination-ready",

          observatoryId,
        };
      }


      showOnlyDestination(
        observatoryId,
      );


      state = {
        phase:
          "destination-active",

        observatoryId,
      };
    },


    /*
     * ------------------------------------------------------------
     * LIGHTING
     * ------------------------------------------------------------
     */

    setLightingPhase(
      phase,
    ) {
      if (
        disposed ||
        state.observatoryId ==
          null
      ) {
        return;
      }


      environmentSystems[
        state.observatoryId
      ].setLightingPhase(
        phase,
      );
    },


    /*
     * ------------------------------------------------------------
     * RETURN
     * ------------------------------------------------------------
     */

    beginReturn() {
      if (disposed) {
        return;
      }


      hideAllDestinations();


      state = {
        phase:
          "returning",

        observatoryId:
          state.observatoryId,
      };
    },


    /*
     * ------------------------------------------------------------
     * RESET
     * ------------------------------------------------------------
     */

    reset() {
      if (disposed) {
        return;
      }


      hideAllDestinations();


      state = {
        phase:
          "idle",

        observatoryId:
          null,
      };
    },


    /*
     * ------------------------------------------------------------
     * DISPOSAL
     * ------------------------------------------------------------
     *
     * Environment-system resources are disposed independently by
     * GlobeScene's existing disposables lifecycle.
     *
     * This controller therefore owns state/visibility only.
     */

    dispose() {
      if (disposed) {
        return;
      }


      hideAllDestinations();


      state = {
        phase:
          "idle",

        observatoryId:
          null,
      };


      disposed =
        true;
    },
  };
}