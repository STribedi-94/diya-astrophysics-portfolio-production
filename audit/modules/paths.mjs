import path from "node:path";

export const PATHS = {
  projectRoot: process.cwd(),

  workingAssets: path.resolve(
    "E:/Diya Portfolio Website/04 - Assets/02 - Working Assets"
  ),

  publicAssets: path.resolve("public/assets"),

  documents: path.resolve("public/assets/documents"),

  images: path.resolve("public/assets/images"),

  metadata: path.resolve("public/assets/metadata"),

  auditReports: path.resolve(
    "E:/Diya Portfolio Website/05 - Documents/Asset Audit"
  ),
};