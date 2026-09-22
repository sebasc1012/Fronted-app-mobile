import { renderHook, waitFor, act } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../AuthContext";
import { supabase } from "../../lib/supabase";
import { signInWithProvider } from "../../lib/auth/oauth";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// signInWithOAuth ya no llama a Supabase directo — delega el flujo PKCE
// completo (browser + exchangeCodeForSession) a lib/auth/oauth.ts.
jest.mock("../../lib/auth/oauth", () => ({
  signInWithProvider: jest.fn(),
}));

const mockSupabase = supabase as unknown as {
  auth: {
    getSession: jest.Mock;
    onAuthStateChange: jest.Mock;
    signInWithPassword: jest.Mock;
    signUp: jest.Mock;
    signOut: jest.Mock;
  };
};
const mockSignInWithProvider = signInWithProvider as jest.Mock;

const fakeSession = { access_token: "t", user: { id: "u1" } } as any;

function setup() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  mockSupabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
});

describe("AuthProvider", () => {
  it("starts loading, then resolves the session once Supabase answers", async () => {
    let resolveSession: (value: unknown) => void = () => {};
    mockSupabase.auth.getSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );
    const { result } = await setup();

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSession({ data: { session: fakeSession } });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.session).toBe(fakeSession);
    expect(result.current.user).toBe(fakeSession.user);
  });

  it("updates session when Supabase reports an auth state change", async () => {
    let capturedCallback: (event: string, session: any) => void = () => {};
    mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    const { result } = await setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      capturedCallback("SIGNED_IN", fakeSession);
    });

    expect(result.current.session).toBe(fakeSession);
  });

  describe("signIn", () => {
    it("returns no error on success", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signIn("a@b.co", "123456"));
      expect(response).toEqual({ error: null });
    });

    it("maps invalid_credentials to its i18n key", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { code: "invalid_credentials", message: "Invalid login credentials" },
      });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signIn("a@b.co", "wrong"));
      expect(response).toEqual({ error: "errors.invalidCredentials" });
    });

    it("falls back to the generic key for unmapped error codes", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { code: "some_unmapped_code", message: "boom" },
      });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signIn("a@b.co", "123456"));
      expect(response).toEqual({ error: "errors.generic" });
    });
  });

  describe("signUp", () => {
    it("flags needsEmailConfirmation when Supabase returns no session", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signUp("a@b.co", "123456"));
      expect(response).toEqual({ error: null, needsEmailConfirmation: true });
    });

    it("does not flag needsEmailConfirmation when Supabase returns a session", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { session: fakeSession }, error: null });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signUp("a@b.co", "123456"));
      expect(response).toEqual({ error: null, needsEmailConfirmation: false });
    });

    it("maps signup errors and does not flag needsEmailConfirmation", async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { session: null },
        error: { code: "user_already_exists", message: "already registered" },
      });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Refleja el código real: `needsEmailConfirmation = !error && !data.session`,
      // así que un error SIEMPRE da false, aunque no haya sesión.
      const response = await act(() => result.current.signUp("a@b.co", "123456"));
      expect(response).toEqual({ error: "errors.userExists", needsEmailConfirmation: false });
    });
  });

  describe("signOut", () => {
    it("calls supabase.auth.signOut", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.signOut());
      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe("signInWithOAuth", () => {
    it("returns no error on success (session already set by exchangeCodeForSession)", async () => {
      mockSignInWithProvider.mockResolvedValue({ status: "success" });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signInWithOAuth("google"));
      expect(response).toEqual({ error: null });
    });

    it("returns cancelled without an error when the user closes the browser", async () => {
      mockSignInWithProvider.mockResolvedValue({ status: "cancelled" });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signInWithOAuth("google"));
      expect(response).toEqual({ error: null, cancelled: true });
    });

    it("forwards the mapped error key on failure", async () => {
      mockSignInWithProvider.mockResolvedValue({
        status: "error",
        errorKey: "errors.providerDisabled",
      });
      const { result } = await setup();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const response = await act(() => result.current.signInWithOAuth("apple"));
      expect(response).toEqual({ error: "errors.providerDisabled" });
    });
  });
});
