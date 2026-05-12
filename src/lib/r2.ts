/**
 * Cloudflare R2 client (S3-compatible)
 * Credentials live in .env.local — never exposed to the client bundle.
 */
import { S3Client } from "@aws-sdk/client-s3";

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

/** Singleton R2 client, created once per Node.js process */
let _r2: S3Client | null = null;

export function getR2Client(): S3Client {
  if (_r2) return _r2;

  _r2 = new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return _r2;
}

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "jogabola-proofs";

/**
 * Public base URL for reading objects (CDN or r2.dev public bucket URL).
 * Example: https://pub-<hash>.r2.dev   or   https://proofs.jogabola.app
 */
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";
