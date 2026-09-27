import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";
import { applyStoredFontScale, scaleFontStyle, setFontScaleLevel, useFontScale } from "../fontScale";

beforeEach(async () => {
  await setFontScaleLevel("normal");
  jest.clearAllMocks();
});

describe("scaleFontStyle", () => {
  it("scales fontSize and lineHeight and caps system × app at 2.0", () => {
    expect(scaleFontStyle({ fontSize: 20, lineHeight: 24 }, 1.3)).toEqual({
      style: { fontSize: 26, lineHeight: 31.200000000000003 },
      maxFontSizeMultiplier: 2 / 1.3,
    });
    expect(scaleFontStyle({ fontSize: 20 }, 1.3).maxFontSizeMultiplier).toBeCloseTo(1.54, 2);
  });

  it("flattens style arrays and falls back to RN's default size (14)", () => {
    expect(scaleFontStyle([{ color: "red" }, { fontSize: 10 }], 0.85).style).toEqual({ fontSize: 8.5 });
    expect(scaleFontStyle(undefined, 1.15).style).toEqual({ fontSize: 14 * 1.15 });
  });
});

describe("text size level", () => {
  it("defaults to Normal (1.0) when nothing is saved", async () => {
    await applyStoredFontScale();
    const { result } = await renderHook(() => useFontScale());
    expect(result.current).toEqual({ level: "normal", multiplier: 1 });
  });

  it.each([
    ["small", 0.85],
    ["large", 1.15],
    ["xlarge", 1.3],
  ] as const)("changing to '%s' updates subscribers with %d and saves it", async (level, multiplier) => {
    const { result } = await renderHook(() => useFontScale());
    await act(() => setFontScaleLevel(level));
    expect(result.current.multiplier).toBe(multiplier);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("pref.fontScale", level);
  });

  it("applies the saved level at startup", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("large");
    await applyStoredFontScale();
    const { result } = await renderHook(() => useFontScale());
    expect(result.current.level).toBe("large");
  });
});
