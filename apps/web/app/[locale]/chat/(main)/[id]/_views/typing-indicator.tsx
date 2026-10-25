export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2"
        aria-hidden="true"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary/80 shadow-[0_0_10px_var(--primary)]" />
      </span>
      <div className="rounded-2xl rounded-bl-md border border-border bg-surface/90 px-3.5 py-3">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
