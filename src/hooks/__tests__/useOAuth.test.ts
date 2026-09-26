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
    expect(result.current.oauthLoading).toBe(false);
  });

  it("does not set an error when the user cancels", async () => {
    signInWithOAuth.mockResolvedValue({ error: null, cancelled: true });
    const { result } = await renderHook(() => useOAuth());

    await act(() => result.current.handleOAuth("google"));

    expect(result.current.oauthError).toBeNull();
    expect(result.current.oauthLoading).toBe(false);
  });

  it("sets oauthError on failure", async () => {
    signInWithOAuth.mockResolvedValue({ error: "errors.generic" });
    const { result } = await renderHook(() => useOAuth());

    await act(() => result.current.handleOAuth("google"));

    expect(result.current.oauthError).toBe("errors.generic");
  });

  it("sets oauthLoading to true while pending and false once resolved", async () => {
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
    expect(result.current.oauthLoading).toBe(true);

    await act(async () => {
      resolvePromise({ error: null });
    });

    expect(result.current.oauthLoading).toBe(false);
  });
});
