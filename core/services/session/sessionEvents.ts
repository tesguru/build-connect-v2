export type SessionEndReason = "idle" | "expired" | "manual";

type SessionEndedListener = (reason: SessionEndReason) => void;

const listeners = new Set<SessionEndedListener>();

export function onSessionEnded(listener: SessionEndedListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSessionEnded(reason: SessionEndReason): void {
  listeners.forEach((listener) => {
    try {
      listener(reason);
    } catch {
      // A broken listener must not block the rest of the logout flow.
    }
  });
}
