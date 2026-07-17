"use client";

import { useState } from "react";
import { requestPresignedUrl } from "@/actions/payments/payments.actions";

export type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "success"; publicUrl: string }
  | { status: "error"; message: string };

interface UseProofUploadOptions {
  paymentId: number;
  guestAccessToken?: string;
  onSuccess?: (publicUrl: string) => void;
}

export function useProofUpload({
  paymentId,
  guestAccessToken,
  onSuccess,
}: UseProofUploadOptions) {
  const [state, setState] = useState<UploadState>({ status: "idle" });

  async function upload(file: File) {
    setState({ status: "uploading", progress: 0 });

    try {
      const res = await requestPresignedUrl({
        paymentId,
        contentType: file.type,
        sizeBytes: file.size,
        guestAccessToken,
      });

      if (!res.success) {
        throw new Error(
          res.error.message || res.error.code || "Erro ao obter URL de upload",
        );
      }

      const { uploadUrl, publicUrl, headers } = res.data;

      setState({ status: "uploading", progress: 30 });

      // 2. PUT directly to R2 via presigned URL (no bytes through Next.js)
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers,
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
