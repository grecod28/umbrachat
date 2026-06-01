import { useCallback, useRef } from "react";
import { playKeySound } from "@/libs/functions/sounds";

export function useTypingSound() {
  const lastSound = useRef(0);

  const withSound = useCallback(
    <T>(handler?: (e: T) => void) =>
      (e: T) => {
        const now = Date.now();
        if (now - lastSound.current > 50) {
          playKeySound();
          lastSound.current = now;
        }
        handler?.(e);
      },
    [],
  );

  return { withSound };
}
