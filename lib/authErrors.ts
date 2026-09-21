import type { AuthError } from "@supabase/supabase-js";

const AUTH_ERROR_KEYS: Record<string, string> = {
  invalid_credentials: "errors.invalidCredentials",
  email_not_confirmed: "errors.emailNotConfirmed",
  user_already_exists: "errors.userExists",
  over_email_send_rate_limit: "errors.rateLimit",
};

// Devuelve una clave i18n. Códigos no mapeados caen en el mensaje genérico.
export function authErrorKey(error: AuthError): string {
  const key = error.code ? AUTH_ERROR_KEYS[error.code] : undefined;
  if (!key) console.error("Unmapped auth error:", error.code, error.message);
  return key ?? "errors.generic";
}
