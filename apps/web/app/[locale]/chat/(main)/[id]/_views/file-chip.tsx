import { IoClose } from "react-icons/io5";
import { formatFileSize } from "./types";

export function FileChip({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-surface-2/70 px-2.5 py-1.5 text-[0.68rem]">
      <span className="max-w-40 truncate text-text-soft">{file.name}</span>
      <span className="shrink-0 font-mono text-[0.56rem] text-text-faint">
        {formatFileSize(file.size)}
      </span>
      <button
        type="button"
        title="remove file"
        aria-label="remove file"
        onClick={onRemove}
        className="shrink-0 text-text-muted transition-colors hover:text-danger"
      >
        <IoClose size={13} />
      </button>
    </div>
  );
}
