import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

function parseCloudinaryUrl(
  url?: string,
): { cloudName?: string; apiKey?: string; apiSecret?: string } | undefined {
  if (!url) return undefined;
  try {
    // cloudinary://<api_key>:<api_secret>@<cloud_name>
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^\/?#]+)/);
    if (!match) return undefined;
    const [, apiKey, apiSecret, cloudName] = match;
    return { cloudName, apiKey, apiSecret };
  } catch {
    return undefined;
  }
}

const parsedFromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
const CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_NAME ||
  parsedFromUrl?.cloudName;
const API_KEY = process.env.CLOUDINARY_API_KEY || parsedFromUrl?.apiKey;
const API_SECRET =
  process.env.CLOUDINARY_API_SECRET || parsedFromUrl?.apiSecret;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary is not fully configured" },
        { status: 500 },
      );
    }
    const body = await req.json().catch(() => ({}));
    const timestamp = Math.floor(Date.now() / 1000);
    const folder =
      (body?.folder as string) ||
      process.env.CLOUDINARY_UPLOAD_FOLDER ||
      "uploads";
    const tags = (body?.tags as string | undefined) || undefined;
    const public_id = (body?.public_id as string | undefined) || undefined;

    // Only include public parameters in the signature payload
    const paramsToSign: Record<string, string | number | undefined> = {
      timestamp,
      folder,
      tags,
      public_id,
    };
    // Remove undefined keys
    Object.keys(paramsToSign).forEach(
      (k) => paramsToSign[k] === undefined && delete paramsToSign[k],
    );

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      API_SECRET,
    );

    const result = {
      timestamp,
      folder,
      signature,
      cloudName: CLOUD_NAME,
      apiKey: API_KEY,
    } as const;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to sign upload" },
      { status: 500 },
    );
  }
}
