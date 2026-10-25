export const FONT_OPTIONS = ["sans", "mono"] as const;
export const SIZE_OPTIONS = ["sm", "md", "lg"] as const;
export const COLOR_OPTIONS = ["purple", "blue"] as const;
export const THEME_OPTIONS = ["dark", "light"] as const;

export type FontOption = (typeof FONT_OPTIONS)[number];
export type SizeOption = (typeof SIZE_OPTIONS)[number];
export type ColorOption = (typeof COLOR_OPTIONS)[number];
export type ThemeOption = (typeof THEME_OPTIONS)[number];

export type ShapeConfig = {
  font: FontOption;
  size: SizeOption;
  color: ColorOption;
  theme: ThemeOption;
};

export const SHAPE_STORAGE_KEY = "umbra-shape";

export const DEFAULT_SHAPE: ShapeConfig = {
  font: "sans",
  size: "md",
  color: "purple",
  theme: "dark",
};

function isOneOf<T extends readonly string[]>(
  options: T,
  value: unknown,
): value is T[number] {
  return typeof value === "string" && options.includes(value);
}

export function normalizeShape(value: unknown): ShapeConfig {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<Record<keyof ShapeConfig, unknown>>)
      : {};

  return {
    font: isOneOf(FONT_OPTIONS, candidate.font)
      ? candidate.font
      : DEFAULT_SHAPE.font,
    size: isOneOf(SIZE_OPTIONS, candidate.size)
      ? candidate.size
      : DEFAULT_SHAPE.size,
    color: isOneOf(COLOR_OPTIONS, candidate.color)
      ? candidate.color
      : DEFAULT_SHAPE.color,
    theme: isOneOf(THEME_OPTIONS, candidate.theme)
      ? candidate.theme
      : DEFAULT_SHAPE.theme,
  };
}

export function readStoredShape(): ShapeConfig {
  if (typeof window === "undefined") return DEFAULT_SHAPE;

  try {
    const raw = window.localStorage.getItem(SHAPE_STORAGE_KEY);
    if (!raw) return DEFAULT_SHAPE;
    return normalizeShape(JSON.parse(raw));
  } catch {
    return DEFAULT_SHAPE;
  }
}

export function applyShape(config: ShapeConfig) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.font = config.font;
  root.dataset.size = config.size;
  root.dataset.color = config.color;
  root.classList.toggle("light", config.theme === "light");
  root.style.colorScheme = config.theme;
}
