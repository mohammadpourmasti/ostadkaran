import "server-only";

// SMS settings come ONLY from server-side environment variables. Nothing here is exposed to the browser:
// no NEXT_PUBLIC_ prefix, and this module is marked server-only so a Client Component cannot import it.

export type SmsConfig = {
  enabled: boolean;
  /** Provider id from SMS_PROVIDER (lower-case), or "" when unset. */
  provider: string;
};

export function readSmsConfig(env: NodeJS.ProcessEnv = process.env): SmsConfig {
  return {
    enabled: env.SMS_ENABLED === "true",
    provider: (env.SMS_PROVIDER ?? "").trim().toLowerCase(),
  };
}

/**
 * Provider credentials are read by the provider adapter itself, at send time, from process.env
 * (for example SMS_API_KEY and SMS_SENDER_NUMBER). They are never copied into this config object,
 * so they cannot end up in a log line that prints the config.
 */
