import type { ReactNode } from "react";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={`${centered ? "mx-auto max-w-2xl text-center" : ""} ${className}`}
    >
      {eyebrow && (
        <p className={`eyebrow ${centered ? "justify-center" : ""}`}>
          {eyebrow}
        </p>
      )}
      <h1 className="display page-heading mt-4 text-text">{title}</h1>
      {description && (
        <p
          className={`mt-4 text-[0.975rem] leading-relaxed text-text-muted ${
            centered ? "mx-auto max-w-xl" : "max-w-2xl"
          }`}
        >
          {description}
        </p>
      )}
      {actions && (
        <div
          className={`mt-7 flex flex-wrap items-center gap-3 ${
            centered ? "justify-center" : ""
          }`}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
