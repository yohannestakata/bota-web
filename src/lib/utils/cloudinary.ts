export function buildCloudinaryUrl(
  publicIdOrUrl: string,
  opts?: { w?: number; h?: number; crop?: string },
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicIdOrUrl;
  // If a full URL was passed, try to inject transforms; else build from public_id
  const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const t = [`f_auto`, `q_auto`];
  if (opts?.crop) t.push(`c_${opts.crop}`);
  if (opts?.w) t.push(`w_${opts.w}`);
  if (opts?.h) t.push(`h_${opts.h}`);
  const transforms = t.join(",");
  if (publicIdOrUrl.startsWith("http")) {
    // naive: replace "/upload/" with "/upload/<transforms>/"
    return publicIdOrUrl.replace("/upload/", `/upload/${transforms}/`);
  }
  return `${base}/${transforms}/${publicIdOrUrl}`;
}
