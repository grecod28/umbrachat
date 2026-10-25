"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { IoArrowBack } from "react-icons/io5";

export function ConfigBackButton() {
  const router = useRouter();
  const t = useTranslations("Config");

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="btn btn-ghost btn-sm"
    >
      <IoArrowBack size={16} />
      {t("back")}
    </button>
  );
}
