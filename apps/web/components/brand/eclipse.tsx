export function Eclipse({
  className = "",
  strokeWidth = 1,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="120"
        cy="120"
        r="112"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="120"
        cy="120"
        r="92"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth={strokeWidth}
        strokeDasharray="2 9"
      />
      <circle
        cx="120"
        cy="120"
        r="68"
        stroke="currentColor"
        strokeOpacity="0.38"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="120"
        cy="120"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth={strokeWidth}
      />
      <path
        d="M120 4v14M120 222v14M4 120h14M222 120h14"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
