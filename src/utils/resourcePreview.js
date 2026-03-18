const DEFAULT_MINIO_PUBLIC_BASE_URL =
  import.meta.env.VITE_MINIO_PUBLIC_BASE_URL || "http://localhost:9000";
const DEFAULT_MINIO_BUCKET =
  import.meta.env.VITE_MINIO_BUCKET || "building-management";

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".avif",
];

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const resolveImageUrl = (url, options = {}) => {
  if (!url) return null;
  const raw = String(url).trim();
  if (!raw) return null;
  if (raw.startsWith("blob:")) return raw;

  const publicBase = trimTrailingSlash(
    options.publicBaseUrl || DEFAULT_MINIO_PUBLIC_BASE_URL
  );
  const bucket = options.bucket || DEFAULT_MINIO_BUCKET;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (parsed.hostname === "minio") {
        const publicParsed = new URL(publicBase);
        parsed.protocol = publicParsed.protocol;
        parsed.hostname = publicParsed.hostname;
        parsed.port = publicParsed.port;
      }
      return parsed.toString();
    } catch {
      return raw;
    }
  }

  const cleaned = raw.startsWith("/") ? raw.slice(1) : raw;
  if (cleaned.startsWith(`${bucket}/`)) return `${publicBase}/${cleaned}`;
  return `${publicBase}/${bucket}/${cleaned}`;
};

export const isImageResource = (resource) => {
  const type = String(resource?.resourceType || "").toUpperCase();
  if (type === "IMAGE") return true;

  const url = String(resource?.url || "").toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => url.includes(ext));
};

export const mapResourcePreview = (resource) => {
  const resolvedUrl = resolveImageUrl(resource?.url);
  const role = String(resource?.uploadedByRole || "").toUpperCase();
  return {
    ...resource,
    resolvedUrl,
    isImage: isImageResource(resource),
    uploaderRole: role === "STAFF" || role === "RESIDENT" ? role : "UNKNOWN",
    uploaderName: resource?.uploadedByName || null,
  };
};
