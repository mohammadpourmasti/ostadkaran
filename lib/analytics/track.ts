// Provider-agnostic conversion events. No analytics tool is configured yet (see README), so this only dispatches a
// DOM CustomEvent that a future provider script can listen to. Payloads carry NO phone numbers, names or other
// personal data: only the event name and a coarse page type.
export type TrackEventName = "call_click" | "repair_request_success";

export const TRACK_EVENT = "ostadkaran:track";

export function pageTypeFromPath(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/services")) return "service";
  if (pathname.startsWith("/error-codes")) return "error_code";
  if (pathname.startsWith("/repair-request")) return "repair_request";
  return "other";
}

export function trackEvent(name: TrackEventName) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(TRACK_EVENT, { detail: { event: name, page_type: pageTypeFromPath(window.location.pathname) } }),
    );
  } catch {
    // Tracking must never break the page.
  }
}
