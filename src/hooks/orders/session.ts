// Session management for guest cart operations
const SESSION_ID_KEY = "shopifake.sessionId";

export function getSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(SESSION_ID_KEY);
}

export function setSessionId(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(SESSION_ID_KEY, sessionId);
}

export function clearSessionId(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(SESSION_ID_KEY);
}

