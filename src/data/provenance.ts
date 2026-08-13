/*
 * ------------------------------------------------------------------
 * DIYA ASTROPHYSICS PORTFOLIO
 * Website-wide Provenance & AI Transparency Registry
 * ------------------------------------------------------------------
 *
 * Purpose:
 *
 * Establish one shared provenance language for the entire website.
 *
 * This system distinguishes:
 *
 * - Diya Ram's original material;
 * - externally sourced material;
 * - AI-assisted scientific visualisations;
 * - AI-generated visual material;
 * - procedural scientific simulations;
 * - AI-assisted editorial presentation;
 * - scientific content derived from verified project records.
 *
 * IMPORTANT SCIENTIFIC RULE:
 *
 * AI must never be represented as the scientific source of a claim.
 *
 * Scientific claims continue to derive from verified:
 *
 * - research records;
 * - publications;
 * - facility records;
 * - observing records;
 * - documents;
 * - institutional sources;
 * - mission data;
 * - other explicitly credited scientific sources.
 *
 * Provenance describes HOW material was created or presented separately
 * from WHERE the underlying scientific information originated.
 * ------------------------------------------------------------------
 */


export type ProvenanceKind =
  | "original-diya"
  | "external-source"
  | "ai-assisted-scientific-visualization"
  | "ai-generated-visual"
  | "procedural-simulation"
  | "ai-assisted-editorial"
  | "derived-scientific-content";


export type ProvenanceScope =
  | "image"
  | "3d-environment"
  | "simulation"
  | "diagram"
  | "scientific-content"
  | "editorial-content"
  | "document"
  | "gallery"
  | "website";


export type ProvenanceRecord = {
  id:
    string;

  kind:
    ProvenanceKind;

  label:
    string;

  shortLabel:
    string;

  scopes:
    readonly ProvenanceScope[];

  description:
    string;

  sourceLabel?:
    string;

  sourceUrl?:
    string;

  credit?:
    string;

  method?:
    string;

  disclaimer?:
    string;
};


/*
 * ------------------------------------------------------------------
 * WEBSITE-WIDE STANDARD PROVENANCE RECORDS
 * ------------------------------------------------------------------
 */

export const WEBSITE_PROVENANCE =
  Object.freeze({

    /*
     * --------------------------------------------------------------
     * DIYA ORIGINAL
     * --------------------------------------------------------------
     *
     * Use for Diya's own photographs, observing material, documents,
     * research records or other original material where Diya is the
     * actual source.
     */

    originalDiya: {
      id:
        "original-diya",

      kind:
        "original-diya",

      label:
        "Original Material — Diya Ram",

      shortLabel:
        "Diya Ram · Original",

      scopes: [
        "image",
        "document",
        "gallery",
        "scientific-content",
      ],

      description:
        "Original material from Diya Ram's personal, academic or research archive.",

      sourceLabel:
        "Diya Ram — Personal Research Archive",
    },


    /*
     * --------------------------------------------------------------
     * EXTERNAL SOURCE
     * --------------------------------------------------------------
     *
     * This is a classification only.
     *
     * Every individual external asset must continue to retain its
     * specific source / institutional / creator / licence attribution.
     */

    externalSource: {
      id:
        "external-source",

      kind:
        "external-source",

      label:
        "External Source Material",

      shortLabel:
        "External Source",

      scopes: [
        "image",
        "document",
        "scientific-content",
        "gallery",
      ],

      description:
        "Material originating from an external institution, publication, mission, observatory or other credited source.",

      disclaimer:
        "This provenance classification does not replace the specific source, credit or licence attached to the original material.",
    },


    /*
     * --------------------------------------------------------------
     * AI-ASSISTED SCIENTIFIC VISUALISATION
     * --------------------------------------------------------------
     *
     * Primary Project Astra disclosure.
     *
     * Used for reconstructed DOT / HCT / uGMRT environments and future
     * scientific visualisations built through a comparable workflow.
     */

    aiAssistedScientificVisualization: {
      id:
        "ai-assisted-scientific-visualization",

      kind:
        "ai-assisted-scientific-visualization",

      label:
        "AI-Assisted Scientific Visualization",

      shortLabel:
        "AI-Assisted Visualization",

      scopes: [
        "3d-environment",
        "simulation",
        "diagram",
      ],

      description:
        "A scientific visualization created with AI-assisted design and engineering using verified project information, reference material and manually reviewed implementation.",

      method:
        "AI-assisted design, source-informed modelling, procedural or 3D reconstruction, engineering implementation and manual visual review.",

      disclaimer:
        "This visualization is an interpretive scientific reconstruction. It is not a survey-grade digital twin, exact geographic model or photographic representation unless explicitly stated otherwise.",
    },


    /*
     * --------------------------------------------------------------
     * AI-GENERATED VISUAL
     * --------------------------------------------------------------
     *
     * Use where the visual itself was substantially produced through
     * an AI image-generation process.
     */

    aiGeneratedVisual: {
      id:
        "ai-generated-visual",

      kind:
        "ai-generated-visual",

      label:
        "AI-Generated Visual",

      shortLabel:
        "AI-Generated",

      scopes: [
        "image",
        "diagram",
      ],

      description:
        "Visual material generated using an artificial-intelligence image-generation system.",

      disclaimer:
        "This visual is illustrative and must not be interpreted as original observational evidence, a documentary photograph or an exact scientific representation unless separately verified.",
    },


    /*
     * --------------------------------------------------------------
     * PROCEDURAL SCIENTIFIC SIMULATION
     * --------------------------------------------------------------
     *
     * Use for software-generated simulations where AI generation is
     * not itself the defining provenance characteristic.
     */

    proceduralSimulation: {
      id:
        "procedural-simulation",

      kind:
        "procedural-simulation",

      label:
        "Procedural Scientific Simulation",

      shortLabel:
        "Scientific Simulation",

      scopes: [
        "3d-environment",
        "simulation",
        "diagram",
      ],

      description:
        "A computer-generated simulation constructed from programmed geometry, rendering systems or scientific visualization rules.",

      disclaimer:
        "The simulation communicates scientific or environmental context and should not be interpreted as an exact physical replica unless explicitly stated.",
    },


    /*
     * --------------------------------------------------------------
     * AI-ASSISTED EDITORIAL PRESENTATION
     * --------------------------------------------------------------
     *
     * This identifies AI involvement in presentation / explanation.
     *
     * It does NOT identify AI as the scientific source.
     */

    aiAssistedEditorial: {
      id:
        "ai-assisted-editorial",

      kind:
        "ai-assisted-editorial",

      label:
        "AI-Assisted Editorial Presentation",

      shortLabel:
        "AI-Assisted Editorial",

      scopes: [
        "editorial-content",
        "scientific-content",
        "website",
      ],

      description:
        "Presentation wording was developed with AI assistance from verified project records and source material.",

      method:
        "AI-assisted organisation, summarisation or explanatory wording with project-level scientific review.",

      disclaimer:
        "AI assistance describes the presentation process, not the scientific source. Scientific claims must remain supported by the underlying verified records.",
    },


    /*
     * --------------------------------------------------------------
     * DERIVED SCIENTIFIC CONTENT
     * --------------------------------------------------------------
     *
     * Use when website content is assembled or synthesised directly
     * from existing canonical scientific records.
     */

    derivedScientificContent: {
      id:
        "derived-scientific-content",

      kind:
        "derived-scientific-content",

      label:
        "Derived from Verified Scientific Records",

      shortLabel:
        "Verified Record Synthesis",

      scopes: [
        "scientific-content",
        "website",
      ],

      description:
        "Information assembled or derived from verified scientific records already represented within the portfolio.",

      disclaimer:
        "The underlying publication, research, facility, observing or document records remain the authoritative scientific sources.",
    },

  } satisfies Record<
    string,
    ProvenanceRecord
  >);


/*
 * ------------------------------------------------------------------
 * PROVENANCE LOOKUP
 * ------------------------------------------------------------------
 */

const PROVENANCE_BY_ID =
  new Map<
    string,
    ProvenanceRecord
  >(
    Object.values(
      WEBSITE_PROVENANCE,
    ).map(
      (record) => [
        record.id,
        record,
      ],
    ),
  );


export function getProvenanceRecord(
  id:
    string,
): ProvenanceRecord | undefined {
  return PROVENANCE_BY_ID.get(
    id,
  );
}


/*
 * ------------------------------------------------------------------
 * PROJECT ASTRA — OBSERVATORY VISUALISATION STANDARD
 * ------------------------------------------------------------------
 *
 * DOT, HCT and uGMRT are real scientific facilities.
 *
 * Their Project Astra destination environments are reconstructed
 * visualisations.
 *
 * Therefore this provenance record describes the representation,
 * NOT the existence or scientific authenticity of the facility.
 * ------------------------------------------------------------------
 */

export const ASTRA_OBSERVATORY_SIMULATION_PROVENANCE =
  WEBSITE_PROVENANCE
    .aiAssistedScientificVisualization;