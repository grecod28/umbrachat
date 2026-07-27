"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, useEffect, type RefObject, type ChangeEvent } from "react";
import {
  IoAttachOutline,
  IoSend,
  IoDocumentOutline,
  IoImageOutline,
  IoCameraOutline,
  IoClose,
} from "react-icons/io5";
import { useTypingSound } from "@/libs/hooks/use-typing-sound";
import { UploadStatusBanner } from "./upload-status-banner";
import { FileChip } from "./file-chip";
import { MAX_CHARS, type UploadStatus } from "./types";

interface ChatFooterProps {
  input: string;
  canSend: boolean;
  files: File[];
  uploadStatus: UploadStatus;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const menuOptions = [
  {
    key: "document",
    icon: IoDocumentOutline,
    accept: "*",
    labelKey: "attachDocument" as const,
  },
  {
    key: "media",
    icon: IoImageOutline,
    accept: "image/*,video/*",
    labelKey: "attachMedia" as const,
  },
  {
    key: "camera",
    icon: IoCameraOutline,
    accept: "image/*",
    capture: true,
    labelKey: "attachCamera" as const,
  },
] as const;

export function ChatFooter({
  input,
  canSend,
  files,
  uploadStatus,
  onInputChange,
  onSend,
  onFileChange,
  onRemoveFile,
}: ChatFooterProps) {
  const t = useTranslations("ChatRoom");
  const { withSound } = useTypingSound();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const inputRefs: Record<string, RefObject<HTMLInputElement | null>> = {
    document: documentRef,
    media: mediaRef,
    camera: cameraRef,
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFileChange(e);
    e.target.value = "";
    setMenuOpen(false);
  };

  const handleMenuOption = (key: string) => {
    inputRefs[key]?.current?.click();
  };

  return (
    <footer className="shrink-0 border-t border-border bg-background p-3 flex flex-col gap-1">
      <UploadStatusBanner status={uploadStatus} />

      <div className="flex items-end gap-2">
        <div ref={menuRef} className="relative shrink-0">
          <button
            title="attach file"
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text hover:border-primary/60 transition-colors"
          >
            {menuOpen ? <IoClose size={18} /> : <IoAttachOutline size={18} />}
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
              {menuOptions.map(({ key, icon: Icon, labelKey }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMenuOption(key)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-text hover:bg-primary/10 transition-colors"
                >
                  <Icon size={20} className="text-primary shrink-0" />
                  <span>{t(labelKey)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          ref={documentRef}
          type="file"
          multiple
          accept="*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={mediaRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
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
