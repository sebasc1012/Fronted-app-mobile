import { renderHook, act } from "@testing-library/react-native";
import { useOAuth } from "../useOAuth";
import { useAuth } from "../../../contexts/AuthContext";

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe("useOAuth", () => {
  let signInWithOAuth: jest.Mock;

  beforeEach(() => {
    signInWithOAuth = jest.fn();
    mockUseAuth.mockReturnValue({ signInWithOAuth });
  });

  it("clears any previous error on success (root guard handles navigation)", async () => {
    signInWithOAuth.mockResolvedValue({ error: null });
    const { result } = await renderHook(() => useOAuth());

    await act(() => result.current.handleOAuth("google"));

    expect(result.current.oauthError).toBeNull();
    expect(result.current.loadingProvider).toBeNull();
  });

  it("does not set an error when the user cancels", async () => {
    signInWithOAuth.mockResolvedValue({ error: null, cancelled: true });
    const { result } = await renderHook(() => useOAuth());

    await act(() => result.current.handleOAuth("google"));

    expect(result.current.oauthError).toBeNull();
    expect(result.current.loadingProvider).toBeNull();
  });

  it("sets oauthError on failure", async () => {
    signInWithOAuth.mockResolvedValue({ error: "errors.generic" });
    const { result } = await renderHook(() => useOAuth());

    await act(() => result.current.handleOAuth("google"));

    expect(result.current.oauthError).toBe("errors.generic");
  });

  it("tracks which provider is loading and clears it once resolved", async () => {
    let resolvePromise: (value: any) => void = () => {};
    signInWithOAuth.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );
    const { result } = await renderHook(() => useOAuth());

    await act(async () => {
      result.current.handleOAuth("google");
    });
    expect(result.current.loadingProvider).toBe("google"); // solo el botón tocado muestra el spinner

    await act(async () => {
      resolvePromise({ error: null });
    });

    expect(result.current.loadingProvider).toBeNull();
  });
});
