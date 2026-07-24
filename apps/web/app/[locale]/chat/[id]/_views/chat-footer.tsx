"use client";

import { useTranslations } from "next-intl";
import type { RefObject, ChangeEvent } from "react";
import { IoAttachOutline, IoSend } from "react-icons/io5";
import { useTypingSound } from "@/libs/hooks/use-typing-sound";
import { UploadStatusBanner } from "./upload-status-banner";
import { FileChip } from "./file-chip";
import { MAX_CHARS, type UploadStatus } from "./types";

interface ChatFooterProps {
  input: string;
  canSend: boolean;
  files: File[];
  uploadStatus: UploadStatus;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export function ChatFooter({
  input,
  canSend,
  files,
  uploadStatus,
  fileInputRef,
  onInputChange,
  onSend,
  onFileChange,
  onRemoveFile,
}: ChatFooterProps) {
  const t = useTranslations("ChatRoom");
  const { withSound } = useTypingSound();

  return (
    <footer className="shrink-0 border-t border-border bg-background p-3 flex flex-col gap-1">
      <UploadStatusBanner status={uploadStatus} />

      <div className="flex items-end gap-2">
        <button
          title="attach file"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:border-primary/60 transition-colors shrink-0"
        >
          <IoAttachOutline size={18} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileChange}
          className="hidden"
        />

        <textarea
          rows={1}
          value={input}
          maxLength={MAX_CHARS}
          onChange={withSound((e) => onInputChange(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={t("inputPlaceholder")}
          className="flex-1 resize-none px-4 py-2.5 rounded-xl bg-surface border border-border text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors max-h-32"
        />
        <button
          title="send message button"
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <IoSend size={18} />
        </button>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {files.map((file, i) => (
            <FileChip
              key={`${file.name}-${i}`}
              file={file}
              onRemove={() => onRemoveFile(i)}
            />
          ))}
        </div>
      )}

      <span
        className={`text-xs text-right px-1 ${
          input.length > MAX_CHARS
            ? "text-danger"
            : input.length > MAX_CHARS * 0.9
              ? "text-warning"
              : "text-text-muted"
        }`}
      >
        {input.length}/{MAX_CHARS}
      </span>
    </footer>
  );
}
