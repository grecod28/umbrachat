"use client";

import { useTranslations } from "next-intl";
import type { UploadStatus } from "./types";

export function UploadStatusBanner({ status }: { status: UploadStatus }) {
  const t = useTranslations("ChatRoom");

  if (status === "idle") return null;

  const isUploading = status === "uploading";
  const isSuccess = status === "success";
  const isSize = status === "sizeError";

  return (
    <div
      className={`mb-2 rounded-lg border px-3 py-1.5 text-center font-mono text-[0.6rem] tracking-[0.08em] ${
        isUploading
          ? "border-primary/25 bg-primary/10 text-primary"
          : isSuccess
            ? "border-signal/25 bg-signal/10 text-signal"
            : isSize
              ? "border-warning/25 bg-warning/10 text-warning"
              : "border-danger/25 bg-danger/10 text-danger"
      }`}
      role="status"
    >
      {isUploading && t("uploadingFiles")}
      {isSuccess && t("uploadSuccess")}
      {status === "error" && t("uploadError")}
      {isSize && t("fileSizeError")}
    </div>
  );
}
