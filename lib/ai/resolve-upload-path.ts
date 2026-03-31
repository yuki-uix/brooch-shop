import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "custom");

/**
 * Returns an absolute filesystem path for a stored custom upload, or null if unsafe/missing.
 */
export function resolveCustomUploadPath(imageUrl: string | null): string | null {
  if (!imageUrl?.startsWith("/uploads/custom/")) {
    return null;
  }
  const rel = imageUrl.replace(/^\/+/, "");
  const abs = path.normalize(path.join(process.cwd(), "public", rel));
  if (!abs.startsWith(UPLOAD_ROOT)) {
    return null;
  }
  return abs;
}
