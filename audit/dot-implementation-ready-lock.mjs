import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const dotRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "dot"
);

const finalManifestPath = path.join(
  dotRoot,
  "manifests",
  "dot-final-assets.json"
);

const implementationManifestPath = path.join(
  dotRoot,
  "manifests",
  "dot-implementation-ready.json"
);

const implementationTextPath = path.join(
  dotRoot,
  "manifests",
  "dot-implementation-ready.txt"
);

const reportPath = path.join(
  dotRoot,
  "dot-implementation-ready-report.txt"
);

if (!fs.existsSync(finalManifestPath)) {
  console.error(`ERROR: Missing final DOT manifest:\n${finalManifestPath}`);
  process.exit(1);
}

const finalManifest = JSON.parse(
  fs.readFileSync(finalManifestPath, "utf8")
);

if (!Array.isArray(finalManifest.assets) || finalManifest.assets.length !== 27) {
  console.error("ERROR: DOT final manifest does not contain 27 assets.");
  process.exit(1);
}

const selectedNewAssets = [
  {
    file: "dot-terrain-panoramic-ridges-day-01.jpg",
    role: "CINEMATIC_LANDSCAPE_HANDOFF",
    section: "DOT_CINEMATIC_JOURNEY",
    order: 1,
    productionSelected: true,
    gallerySelected: false
  },
  {
    file: "dot-lighting-golden-hour-ridges-02.jpg",
    role: "GOLDEN_HOUR_TRANSITION",
    section: "DOT_CINEMATIC_JOURNEY",
    order: 2,
    productionSelected: true,
    gallerySelected: true
  },
  {
    file: "dot-lighting-sunset-ridges-01.jpg",
    role: "SUNSET_TRANSITION",
    section: "DOT_CINEMATIC_JOURNEY",
    order: 3,
    productionSelected: true,
    gallerySelected: false
  },
  {
    file: "dot-lighting-twilight-ridges-01.jpg",
    role: "TWILIGHT_TRANSITION",
    section: "DOT_CINEMATIC_JOURNEY",
    order: 4,
    productionSelected: true,
    gallerySelected: false
  },
  {
    file: "dot-facility-exterior-day-01.jpg",
    role: "FACILITY_DAYLIGHT_REVEAL",
    section: "DOT_CINEMATIC_JOURNEY",
    order: 5,
    productionSelected: true,
    gallerySelected: false
  },
  {
    file: "dot-facility-dome-blue-hour-01.jpg",
    role: "FACILITY_BLUE_HOUR_REVEAL",
    section: "DOT_CINEMATIC_JOURNEY",
    order: 6,
    productionSelected: true,
    gallerySelected: true
  },
  {
    file: "dot-visit-mountain-overlook-02.jpg",
    role: "DIYA_VISIT_STORY",
    section: "DOT_GALLERY_STORY",
    order: 7,
    productionSelected: true,
    gallerySelected: true
  },
  {
    file: "dot-site-approach-visit-03.jpg",
    role: "DIYA_FACILITY_APPROACH_STORY",
    section: "DOT_GALLERY_STORY",
    order: 8,
    productionSelected: true,
    gallerySelected: true
  }
];

const existingGallerySequence = [
  {
    order: 1,
    path:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dfot_13m_visit_01.jpg",
    role: "DFOT_VISIT_CONTEXT",
    sourceType: "EXISTING_GALLERY_ASSET"
  },
  {
    order: 2,
    path:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dot_36m_visit_02.jpg",
    role: "DOT_VISIT_DOCUMENTARY",
    sourceType: "EXISTING_GALLERY_ASSET"
  },
  {
    order: 3,
    path:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dot_36m_observing_team_03.jpg",
    role: "DOT_OBSERVING_TEAM_DOCUMENTARY",
    sourceType: "EXISTING_GALLERY_ASSET"
  }
];

const finalGalleryStory = [
  {
    order: 1,
    source: "NEW_PREPARED",
    file: "dot-terrain-panoramic-ridges-day-01.jpg",
    role: "ENVIRONMENT_ESTABLISHING_SHOT"
  },
  {
    order: 2,
    source: "NEW_PREPARED",
    file: "dot-site-approach-visit-03.jpg",
    role: "ARRIVAL_AND_APPROACH"
  },
  {
    order: 3,
    source: "NEW_PREPARED",
    file: "dot-visit-mountain-overlook-02.jpg",
    role: "DIYA_AT_DEVASTHAL"
  },
  {
    order: 4,
    source: "EXISTING_GALLERY",
    file:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dfot_13m_visit_01.jpg",
    role: "DFOT_CONTEXT"
  },
  {
    order: 5,
    source: "EXISTING_GALLERY",
    file:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dot_36m_visit_02.jpg",
    role: "DOT_VISIT"
  },
  {
    order: 6,
    source: "EXISTING_GALLERY",
    file:
      "public/assets/images/gallery/" +
      "research_facility_aries_devasthal_dot_36m_observing_team_03.jpg",
    role: "OBSERVING_TEAM"
  },
  {
    order: 7,
    source: "NEW_PREPARED",
    file: "dot-facility-dome-blue-hour-01.jpg",
    role: "BLUE_HOUR_FACILITY_HANDOFF"
  },
  {
    order: 8,
    source: "NEW_PREPARED",
    file: "dot-lighting-golden-hour-ridges-02.jpg",
    role: "CINEMATIC_CLOSING_FRAME"
  }
];

const cinematicSequence = [
  "dot-terrain-panoramic-ridges-day-01.jpg",
  "dot-lighting-golden-hour-ridges-02.jpg",
  "dot-lighting-sunset-ridges-01.jpg",
  "dot-lighting-twilight-ridges-01.jpg",
  "dot-facility-exterior-day-01.jpg",
  "dot-facility-dome-blue-hour-01.jpg"
];

const selectedNames = new Set(
  selectedNewAssets.map((item) => item.file)
);

for (const selected of selectedNewAssets) {
  const match = finalManifest.assets.find(
    (asset) => asset.preparedFile === selected.file
  );

  if (!match) {
    console.error(`ERROR: Selected DOT asset missing: ${selected.file}`);
    process.exit(1);
  }
}

const lockedAssets = finalManifest.assets.map((asset) => {
  const selected = selectedNewAssets.find(
    (item) => item.file === asset.preparedFile
  );

  if (selected) {
    return {
      ...asset,
      implementationState: "SELECTED_FOR_IMPLEMENTATION",
      productionSelected: true,
      gallerySelected: selected.gallerySelected,
      implementationRole: selected.role,
      implementationSection: selected.section,
      implementationOrder: selected.order,
      optimizationState: "REQUIRED_BEFORE_PUBLIC_DELIVERY",
      referenceAvailability: "KEEP"
    };
  }

  return {
    ...asset,
    implementationState: "REFERENCE_ONLY",
    productionSelected: false,
    gallerySelected: false,
    implementationRole: null,
    implementationSection: null,
    implementationOrder: null,
    optimizationState: "NOT_REQUIRED_FOR_V1_PUBLIC_DELIVERY",
    referenceAvailability: "KEEP"
  };
});

const counts = {
  totalPrepared: lockedAssets.length,
  selectedForImplementation: lockedAssets.filter(
    (a) => a.productionSelected
  ).length,
  referenceOnly: lockedAssets.filter(
    (a) => !a.productionSelected
  ).length,
  selectedForGallery: lockedAssets.filter(
    (a) => a.gallerySelected
  ).length,
  existingGalleryReused: existingGallerySequence.length
};

const implementationManifest = {
  schemaVersion: 1,

  observatory: finalManifest.observatory,

  status: {
    implementationAssetPlanningComplete: true,
    majorAssetClassificationDecisionsRemaining: false,
    sourceOriginalsProtected: true,
    selectedNewPublicAssets: counts.selectedForImplementation,
    referenceOnlyAssets: counts.referenceOnly,
    existingGalleryAssetsReused: counts.existingGalleryReused,
    finalGalleryStoryLocked: true,
    cinematicImageSequenceLocked: true,
    optimizationStillRequired: true,
    productionMigrationStillRequired: true
  },

  implementationContract: {
    doNotReplanDuringImplementationChats: true,
    useThisManifestAsAuthoritativeDOTAssetMap: true,
    referenceOnlyAssetsAreForDesignAndReconstruction: true,
    selectedAssetsAreTheOnlyNewDOTImagesPlannedForV1PublicDelivery: true,
    existingGalleryAssetsMustBeReusedNotDuplicated: true
  },

  cinematicSequence,

  selectedNewAssets,

  existingGallerySequence,

  finalGalleryStory,

  assets: lockedAssets
};

fs.writeFileSync(
  implementationManifestPath,
  JSON.stringify(implementationManifest, null, 2),
  "utf8"
);

let text = "";

text += "============================================================\n";
text += "DIYA ASTRA - DOT IMPLEMENTATION READY ASSET LOCK\n";
text += "============================================================\n\n";

text += "STATUS\n";
text += "------------------------------------------------------------\n";
text += "Major DOT asset planning decisions remaining: NO\n";
text += "Source originals protected: YES\n";
text += "DOT implementation asset plan locked: YES\n\n";

text += "COUNTS\n";
text += "------------------------------------------------------------\n";
text += `Prepared assets: ${counts.totalPrepared}\n`;
text += `Selected new implementation assets: ${counts.selectedForImplementation}\n`;
text += `Reference-only assets: ${counts.referenceOnly}\n`;
text += `New Gallery-selected assets: ${counts.selectedForGallery}\n`;
text += `Existing Gallery assets reused: ${counts.existingGalleryReused}\n\n`;

text += "CINEMATIC SEQUENCE\n";
text += "------------------------------------------------------------\n";

cinematicSequence.forEach((file, index) => {
  text += `${index + 1}. ${file}\n`;
});

text += "\nFINAL GALLERY STORY\n";
text += "------------------------------------------------------------\n";

finalGalleryStory.forEach((entry) => {
  text += `${entry.order}. ${entry.role}\n`;
  text += `   ${entry.file}\n`;
  text += `   Source: ${entry.source}\n\n`;
});

text += "SELECTED NEW V1 PUBLIC ASSETS\n";
text += "------------------------------------------------------------\n";

selectedNewAssets.forEach((entry) => {
  text += `${entry.order}. ${entry.file}\n`;
  text += `   Role: ${entry.role}\n`;
  text += `   Section: ${entry.section}\n`;
  text += `   Gallery selected: ${entry.gallerySelected ? "YES" : "NO"}\n\n`;
});

text += "REFERENCE-ONLY DOT ASSETS\n";
text += "------------------------------------------------------------\n";

lockedAssets
  .filter((asset) => !selectedNames.has(asset.preparedFile))
  .forEach((asset) => {
    text += `${asset.preparedFile}\n`;
  });

text += "\n============================================================\n";
text += "DOT IMPLEMENTATION ASSET PLANNING COMPLETE\n";
text += "============================================================\n";

fs.writeFileSync(
  implementationTextPath,
  text,
  "utf8"
);

let report = "";

report += "============================================================\n";
report += "DIYA ASTRA - DOT IMPLEMENTATION READY REPORT\n";
report += "============================================================\n\n";

report += `Total prepared DOT assets: ${counts.totalPrepared}\n`;
report += `Selected new V1 implementation assets: ${counts.selectedForImplementation}\n`;
report += `Reference-only DOT assets: ${counts.referenceOnly}\n`;
report += `New Gallery-selected assets: ${counts.selectedForGallery}\n`;
report += `Existing Gallery assets reused: ${counts.existingGalleryReused}\n\n`;

report += "CINEMATIC SEQUENCE LOCKED: YES\n";
report += "FINAL GALLERY STORY LOCKED: YES\n";
report += "MAJOR ASSET DECISIONS REMAINING: NO\n\n";

report += "SOURCE ORIGINALS MODIFIED: NO\n";
report += "REFERENCE LIBRARY PRESERVED: YES\n";
report += "EXISTING GALLERY DUPLICATION REQUIRED: NO\n\n";

report += "NEXT DOT ASSET TASK:\n";
report += "GENERATE FINAL WEB-OPTIMIZED DERIVATIVES FOR THE 8 SELECTED NEW ASSETS\n\n";

report += "============================================================\n";
report += "DOT PREPARATION STAGE 4 COMPLETE\n";
report += "============================================================\n";

fs.writeFileSync(reportPath, report, "utf8");

console.log("");
console.log("==============================================");
console.log("DIYA ASTRA - DOT PREPARATION STAGE 4 COMPLETE");
console.log("==============================================");
console.log("");

console.log(`Total prepared assets          : ${counts.totalPrepared}`);
console.log(`Selected new V1 assets         : ${counts.selectedForImplementation}`);
console.log(`Reference-only assets          : ${counts.referenceOnly}`);
console.log(`New Gallery-selected assets    : ${counts.selectedForGallery}`);
console.log(`Existing Gallery assets reused : ${counts.existingGalleryReused}`);

console.log("");
console.log("Cinematic sequence locked      : YES");
console.log("Final Gallery story locked     : YES");
console.log("Major asset decisions remaining: NO");
console.log("Source originals modified      : NO");

console.log("");
console.log("Implementation JSON:");
console.log(implementationManifestPath);

console.log("");
console.log("Implementation text manifest:");
console.log(implementationTextPath);

console.log("");
console.log("Report:");
console.log(reportPath);
console.log("");