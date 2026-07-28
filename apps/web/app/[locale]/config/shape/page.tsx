"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import {
  FONT_OPTIONS,
  SIZE_OPTIONS,
  COLOR_OPTIONS,
  SHAPE_STORAGE_KEY,
} from "@/libs/constants/shape";
import { IoColorPaletteOutline } from "react-icons/io5";

type ShapeConfig = {
  font: string;
  size: string;
  color: string;
};

function readShape(): ShapeConfig {
  try {
    const saved = localStorage.getItem(SHAPE_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return { font: "sans", size: "md", color: "purple" };
}

function writeShape(config: ShapeConfig) {
  localStorage.setItem(SHAPE_STORAGE_KEY, JSON.stringify(config));
}

function applyShape(config: ShapeConfig) {
  const root = document.documentElement;
  if (config.font) root.setAttribute("data-font", config.font);
  if (config.size) root.setAttribute("data-size", config.size);
  if (config.color) root.setAttribute("data-color", config.color);
}

export default function ConfigShapePage() {
  const t = useTranslations("ConfigShape");
  const [config, setConfig] = useState<ShapeConfig>({
    font: "sans",
    size: "md",
    color: "purple",
  });

  useEffect(() => {
    setConfig(readShape());
  }, []);

  const handleChange = (key: keyof ShapeConfig) => (value: string) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    writeShape(next);
    applyShape(next);
  };

  const fontOptions = FONT_OPTIONS.map((v) => ({
    value: v,
    label: v === "sans" ? "Geist Sans" : "Geist Mono",
  }));

  const sizeOptions = SIZE_OPTIONS.map((v) => ({
    value: v,
    label: t(`sizeOptions.${v}`),
  }));

  const colorOptions = COLOR_OPTIONS.map((v) => ({
    value: v,
    label: t(`colorOptions.${v}`),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IoColorPaletteOutline size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">{t("title")}</h2>
          <p className="text-sm text-text-muted">{t("description")}</p>
        </div>
      </div>

      <div className="space-y-5">
        <Select
          label={t("font")}
          options={fontOptions}
          value={config.font}
          onChange={handleChange("font")}
        />

        <Select
          label={t("size")}
          options={sizeOptions}
          value={config.size}
          onChange={handleChange("size")}
        />

        <Select
          label={t("color")}
          options={colorOptions}
          value={config.color}
          onChange={handleChange("color")}
        />
      </div>
    </div>
  );
}
