"use client";

import React, { useEffect } from "react";
import { applyShape, readStoredShape } from "@/libs/constants/shape";

export function ShapeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyShape(readStoredShape());
  }, []);

  return children;
}
