import type { SmsProvider } from "../types";

// Used whenever SMS is turned off or no real provider is registered: it never contacts any network.
export const disabledProvider: SmsProvider = {
  id: "disabled",
  async send() {
    return { status: "skipped", reason: "disabled" };
  },
};
