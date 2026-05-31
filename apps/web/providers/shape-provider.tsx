"use client";

import React, { useEffect } from "react";
import { SHAPE_STORAGE_KEY } from "@/libs/constants/shape";

export function ShapeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem(SHAPE_STORAGE_KEY);
    if (!saved) return;

    try {
      const config = JSON.parse(saved);
      const root = document.documentElement;

      if (config.font) root.setAttribute("data-font", config.font);
      if (config.size) root.setAttribute("data-size", config.size);
      if (config.color) root.setAttribute("data-color", config.color);
    } catch {
      // Ignore malformed data
    }
  }, []);

  return children;
}
