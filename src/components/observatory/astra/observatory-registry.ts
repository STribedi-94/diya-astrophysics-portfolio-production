import {
  groundNodes,
  type NetworkNode,
} from "@/data/observatory-network";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Canonical Ground Observatory Registry
 * ------------------------------------------------------------------
 *
 * Purpose:
 *
 * Keep the existing geographic Observatory Network responsible for:
 *
 * - real latitude / longitude;
 * - geographic labels;
 * - globe markers;
 * - guided Earth focus.
 *
 * This registry adds the scientific and cinematic identity required by
 * Project Astra Implementation Chat 1.
 *
 * Do not move geographic coordinates into this file.
 */


export type GroundObservatoryId =
  | "ugmrt"
  | "hct"
  | "dot";


export type ObservatoryEnvironmentKind =
  | "radio-array"
  | "cold-desert"
  | "forested-himalayan";


export type ObservatoryFacilityKind =
  | "interferometric-array"
  | "optical-telescope";


export type ObservatoryScientificProfile = {
  facilityLabel: string;

  instrumentLabel: string;

  observingMode: string;

  dataProduct: string;

  reductionPath: readonly string[];

  scienceFocus: string;

  researchConnections: readonly string[];
};


export type ObservatoryDestinationProfile = {
  environmentKind:
    ObservatoryEnvironmentKind;

  environmentLabel: string;

  environmentCues:
    readonly string[];

  facilityKind:
    ObservatoryFacilityKind;

  facilityVisualIdentity: string;
};


export type GroundObservatoryProfile = {
  id: GroundObservatoryId;

  networkNodeId: GroundObservatoryId;

  scientific:
    ObservatoryScientificProfile;

  destination:
    ObservatoryDestinationProfile;
};


/*
 * ------------------------------------------------------------------
 * CANONICAL REGISTRY
 * ------------------------------------------------------------------
 */

export const GROUND_OBSERVATORY_REGISTRY =
  Object.freeze({

    /*
     * ==============================================================
     * uGMRT
     * ==============================================================
     */

    ugmrt: {
      id: "ugmrt",

      networkNodeId: "ugmrt",

      scientific: {
        facilityLabel:
          "30 × 45-m uGMRT antenna array",

        instrumentLabel:
          "GMRT Wideband Backend (GWB)",

        observingMode:
          "Low-frequency radio interferometry",

        dataProduct:
          "Interferometric visibilities",

        reductionPath: [
          "Common calibration workflow",
          "AIPS",
          "CASA",
        ],

        scienceFocus:
          "Radio magnetic activity, coherent-emission searches and star–planet interaction constraints",

        researchConnections: [
          "GJ 1151",
          "GJ 398",
          "AD Leo",
        ],
      },

      destination: {
        environmentKind:
          "radio-array",

        environmentLabel:
          "Rural Maharashtra radio-interferometer landscape",

        environmentCues: [
          "Distributed 45-m antennas",
          "Compact central array",
          "Three extended Y-shaped arms",
          "Open rural terrain",
          "Large physical array scale",
        ],

        facilityKind:
          "interferometric-array",

        facilityVisualIdentity:
          "The distributed antenna array is the facility identity, not a single isolated dish.",
      },
    },


    /*
     * ==============================================================
     * HCT / HANLE
     * ==============================================================
     */

    hct: {
      id: "hct",

      networkNodeId: "hct",

      scientific: {
        facilityLabel:
          "2.01-m Himalayan Chandra Telescope",

        instrumentLabel:
          "HFOSC",

        observingMode:
          "Optical spectroscopy",

        dataProduct:
          "Reduced optical spectra",

        reductionPath: [
          "IRAF",
          "Specutils",
          "Equivalent-width analysis",
        ],

        scienceFocus:
          "Chromospheric and magnetic activity through time-series optical spectroscopy",

        researchConnections: [
          "AD Leo",
        ],
      },

      destination: {
        environmentKind:
          "cold-desert",

        environmentLabel:
          "High-altitude Hanle cold-desert observatory",

        environmentCues: [
          "Sparse rocky terrain",
          "Dry mountain landscape",
          "High-altitude plateau",
          "Large open sky",
          "Remote observatory setting",
        ],

        facilityKind:
          "optical-telescope",

        facilityVisualIdentity:
          "HCT dome and observatory plateau within the sparse Hanle high-altitude landscape.",
      },
    },


    /*
     * ==============================================================
     * DOT / DEVASTHAL
     * ==============================================================
     */

    dot: {
      id: "dot",

      networkNodeId: "dot",

      scientific: {
        facilityLabel:
          "3.6-m Devasthal Optical Telescope",

        instrumentLabel:
          "TANSPEC",

        observingMode:
          "Cross-dispersed optical / near-infrared spectroscopy",

        dataProduct:
          "Calibrated optical / near-infrared spectra",

        reductionPath: [
          "TANSPEC / PyTANSPEC",
          "IRAF cross-check",
          "Specutils",
        ],

        scienceFocus:
          "Chromospheric diagnostics and magnetic-activity spectroscopy of M-dwarfs",

        researchConnections: [
          "28 M-dwarf spectroscopy programme",
        ],
      },

      destination: {
        environmentKind:
          "forested-himalayan",

        environmentLabel:
          "Forested Himalayan Devasthal Observatory",

        environmentCues: [
          "Forested mountain slopes",
          "Multiple Himalayan ridge layers",
          "Deep valleys",
          "Atmospheric distance haze",
          "Observatory mountain site",
          "Daylight-to-blue-hour lighting identity",
        ],

        facilityKind:
          "optical-telescope",

        facilityVisualIdentity:
          "3.6-m DOT within the layered forested Himalayan Devasthal environment.",
      },
    },

  } satisfies Record<
    GroundObservatoryId,
    GroundObservatoryProfile
  >);


/*
 * ------------------------------------------------------------------
 * LOOKUP HELPERS
 * ------------------------------------------------------------------
 */

export function isGroundObservatoryId(
  value: string,
): value is GroundObservatoryId {
  return (
    value === "ugmrt" ||
    value === "hct" ||
    value === "dot"
  );
}


export function getGroundObservatoryProfile(
  id: GroundObservatoryId,
): GroundObservatoryProfile {
  return GROUND_OBSERVATORY_REGISTRY[id];
}


export function getGroundObservatoryNetworkNode(
  id: GroundObservatoryId,
): NetworkNode | undefined {
  return groundNodes.find(
    (node) =>
      node.id === id,
  );
}


export function getGroundObservatoryEntry(
  id: GroundObservatoryId,
) {
  return {
    profile:
      getGroundObservatoryProfile(id),

    networkNode:
      getGroundObservatoryNetworkNode(id),
  };
}


export const GROUND_OBSERVATORY_IDS =
  Object.freeze(
    [
      "ugmrt",
      "hct",
      "dot",
    ] as const,
  );