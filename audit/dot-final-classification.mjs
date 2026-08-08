import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const dotRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "dot"
);

const manifestPath = path.join(
  dotRoot,
  "manifests",
  "dot-assets.json"
);

const finalManifestPath = path.join(
  dotRoot,
  "manifests",
  "dot-final-assets.json"
);

const finalTextPath = path.join(
  dotRoot,
  "manifests",
  "dot-final-assets.txt"
);

const reportPath = path.join(
  dotRoot,
  "dot-final-classification-report.txt"
);

if (!fs.existsSync(manifestPath)) {
  console.error(`ERROR: Manifest not found:\n${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(manifestPath, "utf8")
);

if (!Array.isArray(manifest.assets) || manifest.assets.length !== 27) {
  console.error(
    `ERROR: Expected 27 DOT assets, found ${manifest.assets?.length ?? 0}.`
  );
  process.exit(1);
}

/*
============================================================
FINAL DOT CLASSIFICATION

This stage does NOT:
- modify source originals;
- modify prepared images;
- optimize images;
- move images into public assets;
- replace existing Gallery assets.

It locks the scientific/cinematic role of each prepared asset.
============================================================
*/

const classification = {
  "dot-site-approach-visit-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "VISIT_STORY"
    ],
    finalPriority: "medium",
    primaryUse: "Site approach, fencing, vegetation and visit context"
  },

  "dot-visit-mountain-overlook-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "VISIT_STORY",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "medium",
    primaryUse: "Personal Devasthal visit and mountain-overlook context"
  },

  "dot-visit-mountain-overlook-02.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "VISIT_STORY",
      "PUBLIC_CANDIDATE",
      "GALLERY_CANDIDATE"
    ],
    finalPriority: "high",
    primaryUse: "Preferred personal mountain-overlook storytelling frame"
  },

  "dot-terrain-forested-ridges-day-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "very-high",
    primaryUse: "Forested Himalayan terrain and atmospheric ridge depth"
  },

  "dot-terrain-forested-ridges-day-02.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "high",
    primaryUse: "Forest mass, ridge depth and terrain reconstruction"
  },

  "dot-lighting-sunset-ridges-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "very-high",
    primaryUse: "Primary DOT sunset lighting reference"
  },

  "dot-lighting-sunset-ridges-02.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "medium",
    primaryUse: "Secondary sunset progression reference"
  },

  "dot-lighting-sunset-ridges-03.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "high",
    primaryUse: "Sunset-to-dusk transition reference"
  },

  "dot-lighting-blue-hour-site-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "medium",
    primaryUse: "Blue-hour site ambience"
  },

  "dot-lighting-twilight-ridges-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "very-high",
    primaryUse: "Twilight mountain silhouette and horizon"
  },

  "dot-site-dusk-detail-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE"
    ],
    finalPriority: "medium",
    primaryUse: "Dusk site and architectural-detail reconstruction"
  },

  "dot-facility-dome-blue-hour-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE",
      "GALLERY_CANDIDATE"
    ],
    finalPriority: "very-high",
    primaryUse: "Primary blue-hour DOT dome reference"
  },

  "dot-facility-blue-hour-02.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "high",
    primaryUse: "Secondary DOT blue-hour facility angle"
  },

  "dot-site-blue-hour-layout-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "medium",
    primaryUse: "Support-building and blue-hour site layout"
  },

  "dot-site-entrance-dusk-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE"
    ],
    finalPriority: "medium",
    primaryUse: "Entrance and dusk architectural-detail reference"
  },

  "dot-lighting-night-ridges-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "medium",
    primaryUse: "Late twilight and night terrain reference"
  },

  "dot-site-road-forest-day-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "very-high",
    primaryUse: "Site road, slope, retaining structure and forest layout"
  },

  "dot-terrain-ridge-depth-day-03.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "very-high",
    primaryUse: "Primary multi-layer Himalayan ridge-depth reference"
  },

  "dot-terrain-ridge-depth-day-04.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "very-high",
    primaryUse: "Terrain layering and vegetation distribution"
  },

  "dot-site-approach-visit-02.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "VISIT_STORY"
    ],
    finalPriority: "medium",
    primaryUse: "Facility approach and visit-story context"
  },

  "dot-site-approach-visit-03.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "VISIT_STORY",
      "PUBLIC_CANDIDATE",
      "GALLERY_CANDIDATE"
    ],
    finalPriority: "high",
    primaryUse: "Preferred facility-approach visit-story frame"
  },

  "dot-facility-exterior-day-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "critical",
    primaryUse: "Primary daylight DOT facility geometry reference"
  },

  "dot-facility-exterior-day-02.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "critical",
    primaryUse: "Secondary facility geometry and terrain relationship"
  },

  "dot-terrain-valley-ridges-day-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE"
    ],
    finalPriority: "high",
    primaryUse: "Valley morphology, settlement context and ridge depth"
  },

  "dot-terrain-panoramic-ridges-day-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "very-high",
    primaryUse: "Wide Himalayan terrain composition and atmospheric depth"
  },

  "dot-lighting-golden-hour-ridges-01.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE"
    ],
    finalPriority: "very-high",
    primaryUse: "Primary golden-hour terrain and vegetation lighting"
  },

  "dot-lighting-golden-hour-ridges-02.jpg": {
    classes: [
      "RECONSTRUCTION_REFERENCE",
      "CINEMATIC_REFERENCE",
      "PUBLIC_CANDIDATE",
      "GALLERY_CANDIDATE"
    ],
    finalPriority: "very-high",
    primaryUse: "Preferred golden-hour cinematic and Gallery candidate"
  }
};

const existingGalleryAssets = [
  {
    id: "dot-existing-dfot-01",
    type: "EXISTING_GALLERY_ASSET",
    path:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dfot_13m_visit_01.jpg",
    telescope: "1.3-m DFOT",
    action: "KEEP_AND_REUSE",
    duplicateFromNewSet: false
  },
  {
    id: "dot-existing-36m-team-03",
    type: "EXISTING_GALLERY_ASSET",
    path:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dot_36m_observing_team_03.jpg",
    telescope: "3.6-m DOT",
    action: "KEEP_AND_REUSE",
    duplicateFromNewSet: false
  },
  {
    id: "dot-existing-36m-visit-02",
    type: "EXISTING_GALLERY_ASSET",
    path:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dot_36m_visit_02.jpg",
    telescope: "3.6-m DOT",
    action: "KEEP_AND_REUSE",
    duplicateFromNewSet: false
  }
];

const existingFacilityAsset = {
  id: "dot-existing-facility",
  type: "EXISTING_FACILITY_ASSET",
  path: "src/assets/facility-dot.jpg",
  action: "KEEP",
  replacementStatus: "NOT_REPLACED"
};

const finalAssets = manifest.assets.map((asset) => {
  const locked = classification[asset.preparedFile];

  if (!locked) {
    console.error(
      `ERROR: Missing final classification for ${asset.preparedFile}`
    );
    process.exit(1);
  }

  return {
    ...asset,

    finalClassification: locked.classes,

    finalPriority: locked.finalPriority,

    primaryUse: locked.primaryUse,

    assetState: "PREPARED_REFERENCE",

    productionPublicState:
      locked.classes.includes("PUBLIC_CANDIDATE")
        ? "CANDIDATE_NOT_APPROVED"
        : "REFERENCE_ONLY",

    galleryState:
      locked.classes.includes("GALLERY_CANDIDATE")
        ? "CANDIDATE_NOT_APPROVED"
        : "NOT_SELECTED",

    originalsProtected: true
  };
});

const countClass = (name) =>
  finalAssets.filter((asset) =>
    asset.finalClassification.includes(name)
  ).length;

const finalManifest = {
  schemaVersion: 1,

  observatory: {
    id: "dot",
    shortName: "DOT",
    fullName: "3.6-m Devasthal Optical Telescope",
    site: "Devasthal Observatory",
    institution: "ARIES",
    environmentIdentity: "Forested Himalayan",
    cinematicLightingIdentity:
      "Daylight / golden hour / sunset / blue hour / night"
  },

  preparationStatus: {
    sourceOriginalCount: 27,
    preparedAssetCount: 27,
    sourceOriginalsModified: false,
    semanticNamingCompleted: true,
    orientationNormalizationCompleted: true,
    finalClassificationCompleted: true,
    existingGalleryMappingCompleted: true,
    publicMigrationCompleted: false,
    publicApprovalCompleted: false,
    webOptimizationCompleted: false
  },

  policy: {
    preserveOriginals: true,
    noDuplicateExistingGalleryAssets: true,
    publicCandidateDoesNotMeanPublicApproved: true,
    referenceAssetsRemainOutsidePublicDelivery: true,
    productionOptimizationDeferredUntilNeeded: true
  },

  classSummary: {
    reconstructionReference:
      countClass("RECONSTRUCTION_REFERENCE"),

    cinematicReference:
      countClass("CINEMATIC_REFERENCE"),

    publicCandidate:
      countClass("PUBLIC_CANDIDATE"),

    galleryCandidate:
      countClass("GALLERY_CANDIDATE"),

    visitStory:
      countClass("VISIT_STORY")
  },

  existingFacilityAsset,

  existingGalleryAssets,

  assets: finalAssets
};

fs.writeFileSync(
  finalManifestPath,
  JSON.stringify(finalManifest, null, 2),
  "utf8"
);

/*
============================================================
Human-readable manifest
============================================================
*/

let text = "";

text += "============================================================\n";
text += "DIYA ASTRA - DOT FINAL ASSET MANIFEST\n";
text += "============================================================\n\n";

text += "OBSERVATORY:\n";
text += "3.6-m Devasthal Optical Telescope (DOT)\n\n";

text += "ENVIRONMENT:\n";
text += "Forested Himalayan\n\n";

text += "SOURCE ORIGINALS:\n";
text += "27 - PRESERVED / UNTOUCHED\n\n";

text += "PREPARED ASSETS:\n";
text += "27\n\n";

text += "CLASS SUMMARY\n";
text += "------------------------------------------------------------\n";

for (const [key, value] of Object.entries(
  finalManifest.classSummary
)) {
  text += `${key}: ${value}\n`;
}

text += "\n";

text += "EXISTING WEBSITE ASSETS\n";
text += "------------------------------------------------------------\n";
text += `${existingFacilityAsset.path} -> KEEP\n\n`;

for (const asset of existingGalleryAssets) {
  text += `${asset.path}\n`;
  text += `Action: ${asset.action}\n\n`;
}

text += "============================================================\n";
text += "27 PREPARED DOT ASSETS\n";
text += "============================================================\n\n";

finalAssets.forEach((asset, index) => {
  text += `${String(index + 1).padStart(2, "0")}. `;
  text += `${asset.preparedFile}\n`;

  text += `Source: ${asset.sourceFile}\n`;

  text +=
    `Classes: ${asset.finalClassification.join(", ")}\n`;

  text += `Priority: ${asset.finalPriority}\n`;

  text += `Primary use: ${asset.primaryUse}\n`;

  text +=
    `Public state: ${asset.productionPublicState}\n`;

  text +=
    `Gallery state: ${asset.galleryState}\n`;

  text += "\n";
});

text += "============================================================\n";
text += "DOT FINAL CLASSIFICATION LOCKED\n";
text += "============================================================\n";

fs.writeFileSync(
  finalTextPath,
  text,
  "utf8"
);

/*
============================================================
Verification report
============================================================
*/

let report = "";

report += "============================================================\n";
report += "DIYA ASTRA - DOT FINAL CLASSIFICATION REPORT\n";
report += "============================================================\n\n";

report += `Prepared assets verified: ${finalAssets.length}\n`;
report += `Source originals modified: NO\n\n`;

report += "CLASSIFICATION COUNTS\n";
report += "------------------------------------------------------------\n";

report +=
  `RECONSTRUCTION_REFERENCE: ` +
  `${countClass("RECONSTRUCTION_REFERENCE")}\n`;

report +=
  `CINEMATIC_REFERENCE: ` +
  `${countClass("CINEMATIC_REFERENCE")}\n`;

report +=
  `PUBLIC_CANDIDATE: ` +
  `${countClass("PUBLIC_CANDIDATE")}\n`;

report +=
  `GALLERY_CANDIDATE: ` +
  `${countClass("GALLERY_CANDIDATE")}\n`;

report +=
  `VISIT_STORY: ` +
  `${countClass("VISIT_STORY")}\n\n`;

report +=
  `Existing Gallery assets mapped: ` +
  `${existingGalleryAssets.length}\n`;

report +=
  `Existing facility assets mapped: 1\n\n`;

report += "PUBLIC MIGRATION:\n";
report += "NOT PERFORMED\n\n";

report += "PUBLIC APPROVAL:\n";
report += "NOT PERFORMED\n\n";

report += "WEB OPTIMIZATION:\n";
report += "DEFERRED UNTIL PRODUCTION CONSUMPTION\n\n";

report += "SOURCE ORIGINALS:\n";
report += "PROTECTED\n\n";

report += "============================================================\n";
report += "DOT PREPARATION STAGE 3 COMPLETE\n";
report += "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

console.log("");
console.log("==============================================");
console.log("DIYA ASTRA - DOT PREPARATION STAGE 3 COMPLETE");
console.log("==============================================");
console.log("");

console.log(`Prepared assets      : ${finalAssets.length}`);
console.log(
  `Reconstruction refs  : ${countClass("RECONSTRUCTION_REFERENCE")}`
);
console.log(
  `Cinematic refs       : ${countClass("CINEMATIC_REFERENCE")}`
);
console.log(
  `Public candidates    : ${countClass("PUBLIC_CANDIDATE")}`
);
console.log(
  `Gallery candidates   : ${countClass("GALLERY_CANDIDATE")}`
);
console.log(
  `Visit-story assets   : ${countClass("VISIT_STORY")}`
);

console.log("");
console.log(
  `Existing Gallery mapped: ${existingGalleryAssets.length}`
);
console.log("Existing facility mapped: 1");

console.log("");
console.log("Source originals modified: NO");
console.log("Public migration performed: NO");
console.log("");

console.log("Final JSON manifest:");
console.log(finalManifestPath);

console.log("");
console.log("Final text manifest:");
console.log(finalTextPath);

console.log("");
console.log("Report:");
console.log(reportPath);
console.log("");