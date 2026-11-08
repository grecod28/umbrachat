import { API_URL } from "@/libs/constants/api";

export const ANONYMOUS_SESSION_HEADER = "x-umbra-session";

const STORAGE_KEY = "umbra-anonymous-session";
const EXPIRY_SKEW_MS = 60_000;

type StoredSession = {
  token: string;
  expiresAt: string;
};

let pendingSession: Promise<string> | null = null;

function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<StoredSession>;

    if (
      typeof value.token !== "string" ||
      typeof value.expiresAt !== "string"
    ) {
      return null;
    }

    return { token: value.token, expiresAt: value.expiresAt };
  } catch {
    return null;
  }
}

function isUsable(session: StoredSession): boolean {
  return new Date(session.expiresAt).getTime() > Date.now() + EXPIRY_SKEW_MS;
}

async function issueSession(): Promise<string> {
  const response = await fetch(`${API_URL}/session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la sesión anónima");
  }

  const data = (await response.json()) as Partial<StoredSession>;

  if (typeof data.token !== "string" || typeof data.expiresAt !== "string") {
    throw new Error("Respuesta de sesión anónima inválida");
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: data.token, expiresAt: data.expiresAt }),
  );

  return data.token;
}

export async function getAnonymousSessionToken(
  forceRefresh = false,
): Promise<string> {
  if (!forceRefresh) {
    const stored = readStoredSession();
    if (stored && isUsable(stored)) return stored.token;
  }

  if (!pendingSession) {
    pendingSession = issueSession().finally(() => {
      pendingSession = null;
    });
  }

  return pendingSession;
}

export async function getAnonymousSessionHeaders(): Promise<
  Record<string, string>
> {
  return {
    [ANONYMOUS_SESSION_HEADER]: await getAnonymousSessionToken(),
  };
}

export function clearAnonymousSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
