"use client";

import { useTranslations } from "next-intl";
import type { UploadStatus } from "./types";

export function UploadStatusBanner({ status }: { status: UploadStatus }) {
  const t = useTranslations("ChatRoom");

  if (status === "idle") return null;

  const isUploading = status === "uploading";
  const isSuccess = status === "success";

  return (
    <div
      className={`text-xs px-3 py-1.5 rounded-lg text-center ${
        isUploading
          ? "bg-primary/10 text-primary"
          : isSuccess
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
      }`}
    >
      {status === "uploading" && t("uploadingFiles")}
      {status === "success" && t("uploadSuccess")}
      {status === "error" && t("uploadError")}
      {status === "sizeError" && t("fileSizeError")}
    </div>
  );
}
