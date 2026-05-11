"use client";

import { useState } from "react";

export type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success"; publicUrl: string }
  | { status: "error"; message: string };

interface UseProofUploadOptions {
  paymentId: number;
  onSuccess?: (publicUrl: string) => void;
}

export function useProofUpload({ paymentId, onSuccess }: UseProofUploadOptions) {
  const [state, setState] = useState<UploadState>({ status: "idle" });

  async function upload(file: File) {
    setState({ status: "uploading", progress: 0 });

    try {
      // 1. Get presigned URL from our API
      const res = await fetch("/api/upload-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          (json as { error?: string }).error ?? "Erro ao obter URL de upload",
        );
      }

      const { uploadUrl, publicUrl } = (await res.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };

      setState({ status: "uploading", progress: 30 });

      // 2. PUT directly to R2 via presigned URL (no bytes through Next.js)
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("Erro ao enviar ficheiro para o storage");
      }

      setState({ status: "success", publicUrl });
      onSuccess?.(publicUrl);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  function reset() {
    setState({ status: "idle" });
  }

  return { state, upload, reset };
}
