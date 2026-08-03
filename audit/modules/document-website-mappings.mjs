/**
 * Document Website Mappings
 *
 * Authoritative bridge between physical AMP-managed PDF files and the
 * website/scientific records that consume them.
 *
 * These mappings were verified from the actual PDF contents and the
 * existing website publication records.
 *
 * Keep folder-level configuration in document-groups.mjs.
 * Keep per-document website relationships in this module.
 */

const DOCUMENT_WEBSITE_MAPPINGS = new Map([
  [
    "diya-ram-cv.pdf",
    {
      recordId: "cv",
      publicationId: null,
      access: "preview-download",
      downloadName: "diya_ram_curriculum_vitae.pdf",
    },
  ],

  [
    "thesis - understanding stellar activity in m-dwarfs.pdf",
    {
      recordId: "thesis",
      publicationId: null,

      // The thesis file exists locally, but the approved website state
      // remains metadata-only until public access is explicitly approved.
      access: "metadata-only",
      downloadName:
        "diya_ram_thesis_understanding_stellar_activity_in_m_dwarfs.pdf",
    },
  ],

  [
    "magnetic activities of ad leonis flares in tess data and optical spectra.pdf",
    {
      recordId: "adleo",
      publicationId: "adleo",
      access: "preview-download",
      downloadName: "diya_ram_ad_leonis_flares_spectra_2025.pdf",
    },
  ],

  [
    "magnetic activities of gj 1151 flares in tess data and radio observation in ugmrt.pdf",
    {
      recordId: "gj1151",
      publicationId: "gj1151",
      access: "preview-download",
      downloadName: "diya_ram_gj1151_magnetic_activity_2025.pdf",
    },
  ],

  [
    "magnetic activities of wolf 359 starspot distribution and quasiperiodic pulsation using tess data.pdf",
    {
      recordId: "wolf359",
      publicationId: "wolf359",
      access: "preview-download",
      downloadName: "diya_ram_wolf359_starspots_qpp_2025.pdf",
    },
  ],

  [
    "probing the magnetic activity of gj 398 through tess flare detection and ugmrt radio observations.pdf",
    {
      recordId: "gj398",
      publicationId: "gj398",
      access: "preview-download",
      downloadName: "diya_ram_gj398_flares_radio_2026.pdf",
    },
  ],

  [
    "diyaram_collaborative_paper_01.pdf",
    {
      recordId: "taurus-brown-dwarfs",
      publicationId: "taurus-brown-dwarfs",
      access: "preview-download",
      downloadName: "tess_young_brown_dwarfs_taurus_2023.pdf",
    },
  ],

  [
    "diyaram_collaborative_paper_02.pdf",
    {
      recordId: "two-young-mstars",
      publicationId: "two-young-mstars",
      access: "preview-download",
      downloadName: "starspots_flares_two_young_mstars_2025.pdf",
    },
  ],

  [
    "diyaram_collaborative_paper_03.pdf",
    {
      recordId: "tic272272592",
      publicationId: "tic272272592",
      access: "preview-download",
      downloadName: "tic272272592_starspots_2025.pdf",
    },
  ],

  [
    "understanding the magnetic activity of m dwarfs optical and near-infrared spectroscopic studies.pdf",
    {
      recordId: "proc-mdwarf-spectro",
      publicationId: "proc-mdwarf-spectro",
      access: "preview-download",
      downloadName: "diya_ram_mdwarf_spectroscopy_proceeding_2024.pdf",
    },
  ],

  [
    "diyaram_collaborative_conference_proceding.pdf",
    {
      recordId: "proc-young-bd-superflares",
      publicationId: "proc-young-bd-superflares",
      access: "preview-download",
      downloadName:
        "young_brown_dwarf_superflares_proceeding_2024.pdf",
    },
  ],
]);

/**
 * Normalizes physical filenames for deterministic mapping.
 *
 * Some migrated files retain repeated extensions such as ".pdf.pdf".
 * The physical files are not renamed during this milestone.
 */
export function normalizeDocumentWebsiteFilename(fileName) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/(?:\.pdf)+$/i, ".pdf");
}

/**
 * Returns the verified website mapping for one physical document.
 */
export function getDocumentWebsiteMapping(fileName) {
  const normalizedFileName =
    normalizeDocumentWebsiteFilename(fileName);

  return DOCUMENT_WEBSITE_MAPPINGS.get(normalizedFileName);
}

/**
 * Validates that the mapping register contains no malformed or duplicate
 * website/scientific identities.
 */
export function validateDocumentWebsiteMappings() {
  const errors = [];
  const recordIds = new Set();
  const publicationIds = new Set();

  for (const [fileName, mapping] of DOCUMENT_WEBSITE_MAPPINGS) {
    if (!fileName) {
      errors.push("A document website mapping has no filename.");
    }

    if (!mapping.recordId) {
      errors.push(`Mapping "${fileName}" has no recordId.`);
    } else if (recordIds.has(mapping.recordId)) {
      errors.push(
        `Duplicate website recordId: ${mapping.recordId}`,
      );
    } else {
      recordIds.add(mapping.recordId);
    }

    if (mapping.publicationId) {
      if (publicationIds.has(mapping.publicationId)) {
        errors.push(
          `Duplicate publicationId: ${mapping.publicationId}`,
        );
      } else {
        publicationIds.add(mapping.publicationId);
      }
    }

    if (!mapping.access) {
      errors.push(`Mapping "${fileName}" has no access state.`);
    }

    if (!mapping.downloadName) {
      errors.push(`Mapping "${fileName}" has no download name.`);
    }
  }

  return {
    valid: errors.length === 0,
    mappings: DOCUMENT_WEBSITE_MAPPINGS.size,
    errors,
  };
}