import {
  researchAreas,
  type ResearchArea,
} from "@/data/research";

import {
  GROUND_OBSERVATORY_IDS,
  getGroundObservatoryEntry,
  type GroundObservatoryId,
  type GroundObservatoryProfile,
} from "./observatory-registry";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Scientific Relationship Engine — Ground Observatory Foundation
 * ------------------------------------------------------------------
 *
 * This module does NOT duplicate the research database.
 *
 * The canonical scientific relationship remains:
 *
 * Observatory
 *      ↓
 * Telescope / Array
 *      ↓
 * Instrument / Backend
 *      ↓
 * Data Product
 *      ↓
 * Reduction / Analysis
 *      ↓
 * Research Area
 *
 * Existing src/data/research.ts remains authoritative for research
 * membership through each ResearchArea.facilities array.
 */


/*
 * ------------------------------------------------------------------
 * RELATIONSHIP TYPES
 * ------------------------------------------------------------------
 */

export type ObservatoryResearchRelationship = {
  observatoryId:
    GroundObservatoryId;

  profile:
    GroundObservatoryProfile;

  researchAreas:
    readonly ResearchArea[];
};


export type ObservatoryScienceChain = {
  observatoryId:
    GroundObservatoryId;

  facility:
    string;

  instrument:
    string;

  observingMode:
    string;

  dataProduct:
    string;

  reductionPath:
    readonly string[];

  researchAreas:
    readonly {
      id: string;
      slug: string;
      title: string;
      shortTitle: string;
    }[];

  researchTargets:
    readonly string[];

  scienceFocus:
    string;
};


/*
 * ------------------------------------------------------------------
 * RESEARCH LOOKUP
 * ------------------------------------------------------------------
 */

export function getResearchAreasForObservatory(
  observatoryId:
    GroundObservatoryId,
): ResearchArea[] {
  return researchAreas.filter(
    (researchArea) =>
      researchArea.facilities.includes(
        observatoryId,
      ),
  );
}


/*
 * ------------------------------------------------------------------
 * COMPLETE OBSERVATORY RELATIONSHIP
 * ------------------------------------------------------------------
 */

export function getObservatoryResearchRelationship(
  observatoryId:
    GroundObservatoryId,
): ObservatoryResearchRelationship {
  const {
    profile,
  } =
    getGroundObservatoryEntry(
      observatoryId,
    );

  return {
    observatoryId,

    profile,

    researchAreas:
      getResearchAreasForObservatory(
        observatoryId,
      ),
  };
}


/*
 * ------------------------------------------------------------------
 * SCIENTIFIC CHAIN
 * ------------------------------------------------------------------
 */

export function createObservatoryScienceChain(
  observatoryId:
    GroundObservatoryId,
): ObservatoryScienceChain {
  const relationship =
    getObservatoryResearchRelationship(
      observatoryId,
    );

  const {
    profile,
    researchAreas:
      connectedResearchAreas,
  } = relationship;


  /*
   * Target names are already stored in the canonical research
   * definitions. Build one unique ordered target list instead of
   * creating another hard-coded target registry here.
   */

  const researchTargets =
    Array.from(
      new Set(
        connectedResearchAreas.flatMap(
          (researchArea) =>
            researchArea.targets,
        ),
      ),
    );


  return {
    observatoryId,

    facility:
      profile.scientific
        .facilityLabel,

    instrument:
      profile.scientific
        .instrumentLabel,

    observingMode:
      profile.scientific
        .observingMode,

    dataProduct:
      profile.scientific
        .dataProduct,

    reductionPath:
      profile.scientific
        .reductionPath,

    researchAreas:
      connectedResearchAreas.map(
        (researchArea) => ({
          id:
            researchArea.id,

          slug:
            researchArea.slug,

          title:
            researchArea.title,

          shortTitle:
            researchArea.shortTitle,
        }),
      ),

    researchTargets,

    scienceFocus:
      profile.scientific
        .scienceFocus,
  };
}


/*
 * ------------------------------------------------------------------
 * COMPLETE GROUND-OBSERVATORY SCIENCE GRAPH
 * ------------------------------------------------------------------
 */

export const GROUND_OBSERVATORY_SCIENCE_GRAPH =
  Object.freeze(
    Object.fromEntries(
      GROUND_OBSERVATORY_IDS.map(
        (observatoryId) => [
          observatoryId,

          createObservatoryScienceChain(
            observatoryId,
          ),
        ],
      ),
    ),
  ) as Readonly<
    Record<
      GroundObservatoryId,
      ObservatoryScienceChain
    >
  >;


/*
 * ------------------------------------------------------------------
 * VALIDATION
 * ------------------------------------------------------------------
 *
 * This is intentionally lightweight.
 *
 * It protects the implementation from silently introducing a new
 * Observatory ID without:
 *
 * - geographic network data;
 * - scientific profile data;
 * - research relationships.
 */

export type ObservatoryRelationshipValidation = {
  valid: boolean;

  observatoryId:
    GroundObservatoryId;

  hasNetworkNode:
    boolean;

  hasResearchRelationship:
    boolean;

  researchAreaCount:
    number;
};


export function validateObservatoryRelationship(
  observatoryId:
    GroundObservatoryId,
): ObservatoryRelationshipValidation {
  const entry =
    getGroundObservatoryEntry(
      observatoryId,
    );

  const connectedResearch =
    getResearchAreasForObservatory(
      observatoryId,
    );

  const hasNetworkNode =
    Boolean(
      entry.networkNode,
    );

  const hasResearchRelationship =
    connectedResearch.length >
    0;


  return {
    valid:
      hasNetworkNode &&
      hasResearchRelationship,

    observatoryId,

    hasNetworkNode,

    hasResearchRelationship,

    researchAreaCount:
      connectedResearch.length,
  };
}


export function validateGroundObservatoryScienceGraph() {
  return GROUND_OBSERVATORY_IDS.map(
    (observatoryId) =>
      validateObservatoryRelationship(
        observatoryId,
      ),
  );
}