import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../supabase";

WebBrowser.maybeCompleteAuthSession();

const redirectTo = makeRedirectUri({
  scheme: "mobileapp",
  path: "auth/callback",
});

export type GoogleSignInResult =
  | { status: "success" }
  | { status: "cancelled" }
  | { status: "error"; message: string };

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return {
      status: "error",
      message: error?.message ?? "No fue posible iniciar sesión con Google.",
    };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "cancel" || result.type === "dismiss") {
    return { status: "cancelled" };
  }

  if (result.type !== "success") {
    return {
      status: "error",
      message: "No fue posible completar la autenticación con Google.",
    };
  }

  const { params, errorCode } = QueryParams.getQueryParams(result.url);

  if (errorCode) {
    return { status: "error", message: errorCode };
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    return {
      status: "error",
      message: "Google no devolvió una sesión válida.",
    };
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    return { status: "error", message: sessionError.message };
  }

  return { status: "success" };
}
