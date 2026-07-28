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
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs">
      <span className="text-text truncate max-w-40">{file.name}</span>
      <span className="text-text-muted shrink-0">
        {formatFileSize(file.size)}
      </span>
      <button
        type="button"
        title="remove file"
        onClick={onRemove}
        className="text-text-muted hover:text-danger transition-colors shrink-0"
      >
        <IoClose size={14} />
      </button>
    </div>
  );
}
