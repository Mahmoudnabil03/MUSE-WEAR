export const META_PIXEL_ID = "1407537767984552";

type MetaPixelParameters = Record<string, string | number | string[] | undefined>;
type PendingMetaEvent = [event: string, parameters?: MetaPixelParameters, eventId: string];

const pendingEvents: PendingMetaEvent[] = [];

declare global {
  interface Window {
    fbq?: (command: "track", event: string, parameters?: MetaPixelParameters, options?: { eventID?: string }) => void;
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function generateEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function sendCapiEvent(event: string, eventId: string, parameters?: MetaPixelParameters) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      eventName: event,
      eventId,
      eventTime: Math.floor(Date.now() / 1000),
      eventSourceUrl: window.location.href,
      customData: parameters || {},
      userData: {
        fbc: getCookie("_fbc"),
        fbp: getCookie("_fbp"),
      },
    });
    // fire-and-forget; keepalive for page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/meta/capi", blob);
    } else {
      fetch("/api/meta/capi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}

export function trackMetaEvent(event: string, parameters?: MetaPixelParameters) {
  if (typeof window === "undefined") return;
  const eventId = generateEventId();
  // Always attempt CAPI (server holds token, browser never sees it)
  sendCapiEvent(event, eventId, parameters);
  if (!window.fbq) {
    pendingEvents.push([event, parameters, eventId]);
    return;
  }
  window.fbq("track", event, parameters, { eventID: eventId });
}

export function flushMetaEvents() {
  if (typeof window === "undefined" || !window.fbq) return;
  pendingEvents.splice(0).forEach(([event, parameters, eventId]) => {
    window.fbq?.("track", event, parameters, { eventID: eventId });
  });
}
