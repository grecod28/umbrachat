"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import Chip from "@/components/ui/chip";

interface NavChipProps {
  href?: string;
  param: string;
  value: string;
  children: ReactNode;
}

export default function NavChip({
  href,
  param,
  value,
  children,
}: NavChipProps) {
  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const pathname = href ?? currentPathname;
  const current = searchParams.get(param);
  const active = current === value || (!current && value === "");

  const query = value ? { [param]: value } : undefined;

  return (
    <Link href={query ? { pathname, query } : pathname}>
      <Chip active={active}>{children}</Chip>
    </Link>
  );
}
