import { useCallback } from "react";
import { playKeySound } from "@/libs/functions/sounds";

// Module-level timestamp: the typing sound is a global UI effect, not per-input
// state. Avoiding a ref here also keeps the handler safe during render.
let lastSound = 0;

export function useTypingSound() {
  const playTypingSound = useCallback(() => {
    const now = Date.now();
    if (now - lastSound > 50) {
      playKeySound();
      lastSound = now;
    }
  }, []);

  return { playTypingSound };
}
