"use client";

import { useTranslations } from "next-intl";
import { useRef, type RefObject, type ChangeEvent } from "react";
import {
  IoAttachOutline,
  IoSend,
  IoDocumentOutline,
  IoImageOutline,
  IoCameraOutline,
  IoClose,
} from "react-icons/io5";
import { useTypingSound } from "@/libs/hooks/use-typing-sound";
import { Dropdown } from "@/components/ui/dropdown";
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
];

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
  const { playTypingSound } = useTypingSound();
  const documentRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const inputRefs: Record<string, RefObject<HTMLInputElement | null>> = {
    document: documentRef,
    media: mediaRef,
    camera: cameraRef,
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event);
    event.target.value = "";
  };

  const handleMenuOption = (key: string) => {
    inputRefs[key]?.current?.click();
  };

  const showCounter = input.length > MAX_CHARS * 0.85;

  return (
    <footer className="safe-bottom px-3 pt-1.5 md:px-4">
      <UploadStatusBanner status={uploadStatus} />

      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((file, index) => (
            <FileChip
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => onRemoveFile(index)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-1.5 rounded-2xl border border-border bg-surface/80 p-1.5 shadow-lift backdrop-blur transition-colors focus-within:border-primary/45">
        <Dropdown
          side="top"
          align="left"
          trigger={(open) => (
            <button
              title={t("attachDocument")}
              type="button"
              aria-label={t("attachDocument")}
              className="btn-icon h-10 w-10 shrink-0 border-transparent bg-transparent"
            >
              {open ? <IoClose size={18} /> : <IoAttachOutline size={18} />}
            </button>
          )}
        >
          <div className="p-1">
            {menuOptions.map(({ key, icon: Icon, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleMenuOption(key)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-text transition-colors hover:bg-surface-2"
              >
                <Icon size={18} className="shrink-0 text-accent" />
                <span>{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </Dropdown>

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

        <div className="relative min-w-0 flex-1">
          <textarea
            rows={1}
            value={input}
            maxLength={MAX_CHARS}
            onChange={(event) => {
              playTypingSound();
              onInputChange(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={t("inputPlaceholder")}
            aria-label={t("inputPlaceholder")}
            className="composer-input w-full resize-none bg-transparent px-1.5 py-2.5 text-[0.9rem] leading-relaxed text-text outline-none placeholder:text-text-faint"
          />
          {showCounter && (
            <span
              className={`pointer-events-none absolute right-1 -bottom-0.5 font-mono text-[0.55rem] ${
                input.length > MAX_CHARS
                  ? "text-danger"
                  : input.length > MAX_CHARS * 0.9
                    ? "text-warning"
                    : "text-text-faint"
              }`}
            >
              {input.length}/{MAX_CHARS}
            </span>
          )}
        </div>

        <button
          title={t("send")}
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label={t("send")}
          className="btn btn-accent h-10 w-10 shrink-0 rounded-xl p-0"
        >
          <IoSend size={17} />
        </button>
      </div>
    </footer>
  );
}
