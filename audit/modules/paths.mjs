import path from "node:path";

export const PATHS = {
  projectRoot: process.cwd(),

  src: path.resolve("src"),

  public: path.resolve("public"),

  publicAssets: path.resolve("public/assets"),

  documents: path.resolve("public/assets/documents"),

  images: path.resolve("public/assets/images"),

  metadata: path.resolve("public/assets/metadata"),

  thumbnails: path.resolve("public/assets/thumbnails"),

  thumbnailCv: path.resolve("public/assets/thumbnails/cv"),

  thumbnailThesis: path.resolve("public/assets/thumbnails/thesis"),

  thumbnailDocuments: path.resolve("public/assets/thumbnails"),


  previews: path.resolve("public/assets/previews"),

  previewCv: path.resolve("public/assets/previews/cv"),

  previewThesis: path.resolve("public/assets/previews/thesis"),

  previewDocuments: path.resolve("public/assets/previews"),
  

  audit: path.resolve("audit"),

  auditModules: path.resolve("audit/modules"),

  dist: path.resolve("dist"),

  workingAssets: path.resolve(
    "E:/Diya Portfolio Website/04 - Assets/02 - Working Assets"
  ),

  auditReports: path.resolve(
    "E:/Diya Portfolio Website/05 - Documents/Asset Audit"
  ),
};