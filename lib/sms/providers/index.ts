import "server-only";

import type { SmsProvider } from "../types";
import { disabledProvider } from "./disabled";

/**
 * Registry of provider adapters, keyed by the value of SMS_PROVIDER.
 *
 * To connect an Iranian provider later (see docs/sms-integration.md):
 *   1. add lib/sms/providers/<name>.ts exporting an SmsProvider (read its API key from process.env inside send()),
 *   2. register it here: `kavenegar: () => kavenegarProvider`,
 *   3. set SMS_ENABLED=true and SMS_PROVIDER=<name> on the server.
 * No real provider is registered today, so nothing can be sent.
 */
const registry: Record<string, () => SmsProvider> = {};

export function resolveProvider(id: string): SmsProvider | null {
  const factory = registry[id];
  return factory ? factory() : null;
}

export { disabledProvider };
