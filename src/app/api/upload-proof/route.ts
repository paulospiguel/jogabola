/**
 * POST /api/upload-proof
 *
 * Returns a short-lived presigned PUT URL so the client can upload a payment
 * proof image directly to Cloudflare R2 without routing the bytes through our
 * Next.js server.
 *
 * Body (JSON): { paymentId: number; contentType: string; sizeBytes: number }
 * Response:    { uploadUrl: string; publicUrl: string; key: string }
 */
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

const requestSchema = z.object({
  paymentId: z.number().int().positive(),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    // Parse & validate body
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { paymentId, contentType, sizeBytes } = parsed.data;

    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Tipo de ficheiro não permitido. Use JPEG, PNG ou WebP." },
        { status: 400 },
      );
    }

    if (sizeBytes > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Ficheiro demasiado grande. Máximo 8 MB." },
        { status: 400 },
      );
    }

    // Auth check: guests (no session) are also allowed to upload proofs —
    // they were redirected here immediately after the payment flow.
    const session = await auth.api.getSession({ headers: await headers() });
    const uploaderLabel = session?.user?.id ?? "guest";

    // Unique object key
    const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const key = `payment-proofs/${paymentId}/${uploaderLabel}-${Date.now()}.${ext}`;

    // Generate presigned URL (valid 5 minutes)
    const r2 = getR2Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: sizeBytes,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("[upload-proof]", err);
    return NextResponse.json(
      { error: "Erro interno. Tenta novamente." },
      { status: 500 },
    );
  }
}
