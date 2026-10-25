import Image from "next/image";

export function BrandMark({
  size = 34,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black shadow-[0_0_0_1px_rgba(240,195,122,0.08),0_10px_30px_-14px_rgba(139,92,246,0.7)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/images/favicon-512.png"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full scale-[1.04] object-cover"
      />
      <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
    </span>
  );
}
