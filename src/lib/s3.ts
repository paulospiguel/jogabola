import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

let r2Client: S3Client | null = null;

function getR2Client() {
  r2Client ??= new S3Client({
    region: "auto",
    endpoint: normalizeBaseUrl(requireEnv("R2_ENDPOINT")),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  return r2Client;
}

export function getR2PublicUrl(key: string) {
  const baseUrl = normalizeBaseUrl(requireEnv("R2_PUBLIC_URL"));
  const safeKey = key
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/${safeKey}`;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 300,
) {
  const expiresInSeconds = Math.min(Math.max(expiresIn, 1), 3600);

  return getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: expiresInSeconds },
  );
}
