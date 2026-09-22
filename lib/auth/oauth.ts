import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../supabase";
import { authErrorKey } from "../authErrors";

WebBrowser.maybeCompleteAuthSession();

// Único redirect de la app; debe estar cubierto por `mobileapp://**` en
// Supabase (Authentication > URL Configuration > Redirect URLs).
const redirectTo = makeRedirectUri({
  scheme: "mobileapp",
  path: "auth/callback",
});

export type OAuthProvider = "google" | "apple" | "facebook";

export type OAuthResult =
  | { status: "success" }
  | { status: "cancelled" }
  | { status: "error"; errorKey: string };

// Flujo PKCE completo para un proveedor de Supabase: pide la URL de
// autorización, la abre en un navegador seguro, y canjea el `code` de
// retorno por sesión con exchangeCodeForSession (nunca viajan tokens en la
// URL, a diferencia del flujo implicit anterior en google-oauth.ts).
export async function signInWithProvider(provider: OAuthProvider): Promise<OAuthResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  console.log("[DEBUG][oauth] signInWithOAuth() resolved:", {
    provider,
    hasUrl: !!data?.url,
    errorCode: error?.code,
  });

  if (error) {
    return { status: "error", errorKey: authErrorKey(error) };
  }
  if (!data.url) {
    console.error("[oauth] Supabase no devolvió una URL de autorización");
    return { status: "error", errorKey: "errors.generic" };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  console.log("[DEBUG][oauth] openAuthSessionAsync() resolved:", { type: result.type });

  if (result.type === "cancel" || result.type === "dismiss") {
    return { status: "cancelled" };
  }
  if (result.type !== "success") {
    console.error("[oauth] resultado inesperado del navegador:", result.type);
    return { status: "error", errorKey: "errors.generic" };
  }

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode || !params.code) {
    console.error("[oauth] callback sin code:", { errorCode, url: result.url });
    return { status: "error", errorKey: "errors.generic" };
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
  console.log("[DEBUG][oauth] exchangeCodeForSession() resolved:", {
    errorCode: exchangeError?.code,
  });
  if (exchangeError) {
    return { status: "error", errorKey: authErrorKey(exchangeError) };
  }

  return { status: "success" };
}
