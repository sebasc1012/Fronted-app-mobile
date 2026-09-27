import { renderHook, waitFor, act } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../AuthContext";
import { supabase } from "../../lib/supabase";
import { signInWithProvider } from "../../lib/auth/oauth";
import { queryClient } from "../../lib/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Image } from "expo-image";

jest.mock("expo-image", () => ({
  Image: { clearMemoryCache: jest.fn(async () => true), clearDiskCache: jest.fn(async () => true) },
}));
jest.mock("expo-secure-store", () => ({ deleteItemAsync: jest.fn(async () => {}) }));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getAllKeys: jest.fn(async () => ["pref.language", "pref.theme", "query-cache", "draft"]),
  removeMany: jest.fn(async () => {}),
}));

jest.mock("../../lib/supabase", () => ({
  AUTH_STORAGE_KEY: "sb-test-auth-token",
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
    let emit: (event: string, session: any) => void = () => {};

    // Sesión iniciada y captura del listener de Supabase.
    const signedIn = async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession } });
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
        emit = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });
      const hook = await setup();
      await waitFor(() => expect(hook.result.current.session).toBe(fakeSession));
      return hook;
    };

    const expectUserDataCleared = () => {
      expect(queryClient.getQueryData(["profile"])).toBeUndefined();
      expect(Image.clearMemoryCache).toHaveBeenCalled();
      expect(Image.clearDiskCache).toHaveBeenCalled();
      // Las preferencias del dispositivo se conservan.
      expect(AsyncStorage.removeMany).toHaveBeenCalledWith(["query-cache", "draft"]);
    };

    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
      queryClient.setQueryData(["profile"], { fullName: "Usuario A" });
    });
    afterAll(() => queryClient.clear());

    it("revokes only this device's session", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      const { result } = await signedIn();

      await act(() => result.current.signOut());

      expect(mockSupabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it("SIGNED_OUT clears the user's data so user B never sees user A", async () => {
      await signedIn();

      await act(async () => emit("SIGNED_OUT", null));

      expectUserDataCleared();
    });

    it("forces the local sign-out when Supabase returns an error (offline)", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: { name: "AuthRetryableFetchError" } });
      const { result } = await signedIn();

      await act(() => result.current.signOut());

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("sb-test-auth-token");
      expect(result.current.session).toBeNull();
      expectUserDataCleared();
    });

    it("forces the local sign-out and does not throw when Supabase throws", async () => {
      mockSupabase.auth.signOut.mockRejectedValue(new Error("boom"));
      const { result } = await signedIn();

      await act(() => result.current.signOut()); // si lanzara, el test falla aquí

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("sb-test-auth-token");
      expect(result.current.session).toBeNull();
      expectUserDataCleared();
    });

    it("a double tap signs out only once", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      const { result } = await signedIn();

      await act(() => Promise.all([result.current.signOut(), result.current.signOut()]));

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
