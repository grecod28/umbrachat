"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";
import {
  COLOR_OPTIONS,
  FONT_OPTIONS,
  SHAPE_STORAGE_KEY,
  SIZE_OPTIONS,
  THEME_OPTIONS,
  applyShape,
  DEFAULT_SHAPE,
  readStoredShape,
  type ShapeConfig,
} from "@/libs/constants/shape";
import {
  IoCheckmark,
  IoColorPaletteOutline,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";

function writeShape(config: ShapeConfig) {
  localStorage.setItem(SHAPE_STORAGE_KEY, JSON.stringify(config));
}

const colorSwatches: Record<string, string> = {
  purple: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  blue: "linear-gradient(135deg, #9dc0ff, #2f6fe4)",
};

export default function ConfigShapePage() {
  const t = useTranslations("ConfigShape");
  const [config, setConfig] = useState<ShapeConfig>(DEFAULT_SHAPE);

  useEffect(() => {
    // Hydrate the persisted theme after mount to keep SSR deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(readStoredShape());
  }, []);

  const update = (partial: Partial<ShapeConfig>) => {
    const next = { ...config, ...partial };
    setConfig(next);
    writeShape(next);
    applyShape(next);
  };

  const fontOptions = FONT_OPTIONS.map((value) => ({
    value,
    label: value === "sans" ? "Geist Sans" : "Geist Mono",
  }));

  const sizeOptions = SIZE_OPTIONS.map((value) => ({
    value,
    label: t(`sizeOptions.${value}`),
  }));

  return (
    <div className="space-y-4">
      <section className="panel p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <IoColorPaletteOutline size={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-text">{t("title")}</h2>
            <p className="mt-0.5 text-xs text-text-muted">{t("description")}</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <p className="field-label">{t("theme")}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {THEME_OPTIONS.map((theme) => {
                const active = config.theme === theme;
                const Icon = theme === "dark" ? IoMoonOutline : IoSunnyOutline;
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => update({ theme })}
                    aria-pressed={active}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? "border-accent/40 bg-accent/10"
                        : "border-border bg-surface/50 hover:border-border-strong"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                        active
                          ? "border-accent/30 bg-accent/10 text-accent"
                          : "border-border bg-surface-2 text-text-muted"
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium text-text">
                      {t(`themeOptions.${theme}`)}
                    </span>
                    {active && (
                      <IoCheckmark size={16} className="shrink-0 text-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label={t("font")}
              options={fontOptions}
              value={config.font}
              onChange={(value) =>
                update({ font: value as ShapeConfig["font"] })
              }
            />
            <Select
              label={t("size")}
              options={sizeOptions}
              value={config.size}
              onChange={(value) =>
                update({ size: value as ShapeConfig["size"] })
              }
            />
          </div>

          <div>
            <p className="field-label">{t("color")}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {COLOR_OPTIONS.map((color) => {
                const active = config.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update({ color })}
                    aria-pressed={active}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      active
                        ? "border-accent/40 bg-accent/10"
                        : "border-border bg-surface/50 hover:border-border-strong"
                    }`}
                  >
                    <span
                      className="h-7 w-7 shrink-0 rounded-full border border-white/15"
                      style={{ backgroundImage: colorSwatches[color] }}
                    />
                    <span className="min-w-0 flex-1 text-sm font-medium text-text">
                      {t(`colorOptions.${color}`)}
                    </span>
                    {active && (
                      <IoCheckmark size={16} className="shrink-0 text-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="mono-label text-accent">{t("preview")}</p>
          <span className="status-line">
            <span className="status-dot" />
            24H
          </span>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 shrink-0 rounded-full border border-border bg-surface-2" />
            <span className="font-mono text-[0.58rem] tracking-[0.12em] text-text-faint uppercase">
              {t("previewMeta")}
            </span>
          </div>
          <div className="mt-3 flex justify-end">
            <div className="max-w-[88%] rounded-2xl rounded-br-md border border-primary/30 bg-primary/15 px-3.5 py-2.5 text-sm leading-relaxed text-text">
              {t("previewMessage")}
            </div>
          </div>
          <p className="mt-2 text-right font-mono text-[0.54rem] text-text-faint">
            23:41
          </p>
        </div>
      </section>
    </div>
  );
}
