let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  volume = 0.05,
  type: OscillatorType = "sine",
  startTime?: number, // Para el futuro
) {
  const c = getCtx();
  const t = startTime ?? c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t);

  // Envolvente: Ataque casi instantáneo y caída rápida
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(c.destination);

  osc.start(t);
  osc.stop(t + duration);
}

/**
 * Sonido de tecla tipo "Mechanical Tap".
 */
export function playKeySound() {
  // Frecuencia baja (entre 150Hz y 250Hz) para que sea un "tap" sordo
  const freq = 180 + Math.random() * 70;
  // Duración muy corta (30ms) para que no llegue a ser un tono musical
  playTone(freq, 0.03, 0.1, "sine");
}

/**
 * Sonido de envío (Submit): Dos notas rápidas armónicas.
 */
export function playSubmitSound() {
  const c = getCtx();
  const t = c.currentTime;
  playTone(440, 0.1, 0.04, "sine", t);
  playTone(659.25, 0.1, 0.03, "sine", t + 0.05);
}

/**
 * Sonido de éxito: Arpegio programado con precisión.
 */
export function playSuccessSound() {
  const c = getCtx();
  const t = c.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const noteTime = t + i * 0.07;
    playTone(freq, 0.2, 0.04, "sine", noteTime);
    // Capa de brillo sutil
    playTone(freq, 0.1, 0.01, "triangle", noteTime);
  });
}

export function playErrorSound() {
  const c = getCtx();
  const t = c.currentTime;
  playTone(150, 0.15, 0.05, "triangle", t);
  playTone(110, 0.2, 0.05, "triangle", t + 0.1);
}
