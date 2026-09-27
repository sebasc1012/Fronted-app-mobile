import * as WebBrowser from "expo-web-browser";
import { signInWithProvider } from "../oauth";
import { supabase } from "../../supabase";

jest.mock("expo-auth-session", () => ({ makeRedirectUri: () => "mobileapp://auth/callback" }));
jest.mock("expo-auth-session/build/QueryParams", () => ({ getQueryParams: jest.fn() }));
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(async () => ({ type: "cancel" })),
}));
jest.mock("../../supabase", () => ({
  supabase: { auth: { signInWithOAuth: jest.fn(async () => ({ data: { url: "https://auth" }, error: null })) } },
}));

const signInWithOAuth = supabase.auth.signInWithOAuth as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
});

describe("signInWithProvider", () => {
  it("asks Google to show the account picker and opens an ephemeral browser session", async () => {
    await signInWithProvider("google");

    expect(signInWithOAuth.mock.calls[0][0].options.queryParams).toEqual({ prompt: "select_account" });
    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith("https://auth", "mobileapp://auth/callback", {
      preferEphemeralSession: true,
    });
  });

  it("does not send the Google-only prompt to other providers", async () => {
    await signInWithProvider("facebook");

    expect(signInWithOAuth.mock.calls[0][0].options.queryParams).toBeUndefined();
  });
});
