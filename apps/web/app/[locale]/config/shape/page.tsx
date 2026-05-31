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
    <div className="flex flex-col items-center mt-16 px-4 w-full">
      <div className="animate-fade-in w-full max-w-xs space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {t("title")}
          </h1>
          <p className="text-sm text-text-muted">{t("description")}</p>
        </div>

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
