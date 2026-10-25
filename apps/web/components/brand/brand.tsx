import { Link } from "@/i18n/navigation";
import { BrandMark } from "./brand-mark";

export function Brand({
  size = 34,
  showTagline = true,
  href = "/",
  className = "",
}: {
  size?: number;
  showTagline?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-w-0 items-center gap-2.5 ${className}`}
      aria-label="UmbraChat"
    >
      <BrandMark size={size} priority />
      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-mono text-[0.92rem] font-semibold tracking-[0.26em] text-text">
          UMBRA<span className="text-accent">.</span>
        </span>
        {showTagline && (
          <span className="mt-1 font-mono text-[0.46rem] tracking-[0.3em] text-text-faint uppercase">
            private chat
          </span>
        )}
      </span>
    </Link>
  );
}
