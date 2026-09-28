import { AccessibilityInfo, Alert, Platform, StyleSheet } from "react-native";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import { act, render, screen, fireEvent } from "@testing-library/react-native";
import Account from "../index";
import { setFontScaleLevel, setHighContrast, getFontScaleLevel } from "../../../../../lib/preferences";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useProfile } from "@/hooks/useProfile";

const mockSignOut = jest.fn();
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("expo-constants", () => ({ expoConfig: { version: "1.2.3" } }));
jest.mock("expo-image", () => ({ Image: (props: any) => require("react").createElement("Image", props) }));
jest.mock("@/hooks/useProfile", () => ({ useProfile: jest.fn() }));
const mockChange = jest.fn();
let mockUploading = false;
const mockRemove = jest.fn();
jest.mock("@/hooks/useAvatar", () => ({
  useChangeAvatar: () => ({ change: mockChange, remove: mockRemove, isPending: mockUploading }),
}));
jest.mock("../../../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { email: "seba@fincho.com" }, signOut: mockSignOut }),
}));

const refetch = jest.fn();
const mockProfile = (state: object) =>
  (useProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch, ...state });

beforeEach(() => {
  jest.clearAllMocks();
  mockUploading = false;
  mockSignOut.mockResolvedValue(undefined);
});

const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
const pressAlertButton = async (text: string) => {
  const buttons = alert.mock.calls.at(-1)![2]!;
  await act(async () => buttons.find((b) => b.text === text)!.onPress?.());
};

describe("Account panel", () => {
  it("renders the header with photo, name and email", async () => {
    mockProfile({ data: { fullName: "Sebastián Castro", avatarUrl: "https://x/a.png" } });
    await render(<Account />);
    expect(screen.getByTestId("avatar-image", { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText("Sebastián Castro")).toBeTruthy();
    expect(screen.getByText("seba@fincho.com")).toBeTruthy();
  });

  it("does not render the name line when fullName is null", async () => {
    mockProfile({ data: { fullName: null, avatarUrl: null } });
    await render(<Account />);
    expect(screen.getByText("S", { includeHiddenElements: true })).toBeTruthy(); // inicial del correo
    expect(screen.getByText("seba@fincho.com")).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toContain("text-2xl"); // la línea del nombre
  });

  it("renders the 5 sections and their rows in order", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    const texts = screen.getAllByText(/^(account|common)\./).map((n) => n.props.children);
    expect(texts).toEqual([
      "account.sections.preferences", "account.theme", "account.language", "account.notifications",
      "account.sections.accessibility", "account.textSize", "account.highContrast", "account.highContrastHint",
      "account.sections.privacy", "account.privacyPolicy", "account.deleteAccount",
      "account.sections.about", "account.terms", "account.version",
      "common.signOut", "common.signOut",
    ]);
  });

  it("shows a skeleton while loading without data", async () => {
    mockProfile({ isLoading: true });
    await render(<Account />);
    expect(screen.getByTestId("profile-skeleton")).toBeTruthy();
    expect(screen.getByText("account.sections.preferences")).toBeTruthy();
  });

  it("shows the error state and retries", async () => {
    mockProfile({ isError: true });
    await render(<Account />);
    expect(screen.getByText("account.loadError")).toBeTruthy();
    await fireEvent.press(screen.getByText("common.retry"));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "common.signOut" })).toBeTruthy();
  });

  it("sign out asks for confirmation and 'Cancel' does nothing", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("button", { name: "common.signOut" }));

    const [title, , buttons] = alert.mock.calls[0];
    expect(title).toBe("signOut.title");
    expect(buttons!.find((b) => b.text === "common.signOut")!.style).toBe("destructive");
    await pressAlertButton("common.cancel");
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("confirming signs out and marks the row busy until it finishes", async () => {
    let finish: () => void = () => {};
    mockSignOut.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)));
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("button", { name: "common.signOut" }));

    await pressAlertButton("common.signOut");
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    const row = screen.getByRole("button", { name: "common.signOut" });
    expect(row.props.accessibilityState).toMatchObject({ busy: true, disabled: true });

    await fireEvent.press(row); // doble toque: no abre otro diálogo
    expect(alert).toHaveBeenCalledTimes(1);
    await act(async () => finish());
  });

  it("shows the app version from expo-constants, not pressable", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    expect(screen.getByText("1.2.3")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "account.version" })).toBeNull();
    // filas sin HU todavía: presionables y no fallan
    await fireEvent.press(screen.getByRole("button", { name: "account.theme" }));
  });

  it("tapping the photo opens the menu with take photo, library and cancel", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    expect(screen.queryByText("avatar.takePhoto")).toBeNull();
    await fireEvent.press(screen.getByRole("imagebutton", { name: "account.avatar" }));
    expect(screen.getByText("avatar.takePhoto")).toBeTruthy();
    expect(screen.getByText("avatar.chooseFromLibrary")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "common.cancel" }).length).toBeGreaterThan(0);
  });

  it("choosing an option closes the menu and starts the change (Android: right away)", async () => {
    Platform.OS = "android";
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("imagebutton", { name: "account.avatar" }));
    await fireEvent.press(screen.getByText("avatar.chooseFromLibrary"));
    expect(screen.queryByText("avatar.takePhoto")).toBeNull();
    expect(mockChange).toHaveBeenCalledWith("library");
    Platform.OS = "ios";
  });

  it("shows a spinner over the avatar and blocks the menu while uploading", async () => {
    mockUploading = true;
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    expect(screen.getByTestId("avatar-uploading")).toBeTruthy();
    await fireEvent.press(screen.getByRole("imagebutton", { name: "account.avatar" }));
    expect(screen.queryByText("avatar.takePhoto")).toBeNull();
  });

  it("the menu shows 'Remove photo' only when there is a photo", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("imagebutton", { name: "account.avatar" }));
    expect(screen.queryByText("avatar.remove")).toBeNull();
  });

  it("'Remove photo' closes the menu and starts the removal (Android: right away)", async () => {
    Platform.OS = "android";
    mockProfile({ data: { fullName: "Seba", avatarUrl: "https://x/a.jpg" } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("imagebutton", { name: "account.avatar" }));
    await fireEvent.press(screen.getByText("avatar.remove"));
    expect(screen.queryByText("avatar.takePhoto")).toBeNull();
    expect(mockRemove).toHaveBeenCalledTimes(1);
    Platform.OS = "ios";
  });

  it("the Language row opens the language screen", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("button", { name: "account.language" }));
    expect(router.push).toHaveBeenCalledWith("/account/language");
  });

  it("renders at 'Extra large' text size without errors (snapshot)", async () => {
    await setFontScaleLevel("xlarge");
    mockProfile({ data: { fullName: "Sebastián Castro López", avatarUrl: null } });
    await render(<Account />);
    expect(screen.toJSON()).toMatchSnapshot();
    await setFontScaleLevel("normal");
  });

  it("the High contrast switch reflects the preference and toggles it", async () => {
    await setHighContrast(false);
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    const row = screen.getByRole("switch", { name: "account.highContrast" });
    expect(row.props.accessibilityState.checked).toBe(false);

    await fireEvent.press(row);

    expect(screen.getByRole("switch", { name: "account.highContrast" }).props.accessibilityState.checked).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("pref.highContrast", "true");
    await setHighContrast(false);
    expect(getFontScaleLevel()).toBe("normal");
  });
});

describe("Account panel — screen readers (HU-08)", () => {
  const renderPanel = async (avatarUrl: string | null = null) => {
    mockProfile({ data: { fullName: "Seba", avatarUrl } });
    await render(<Account />);
  };

  it("every row, button and switch is found by role and name", async () => {
    await renderPanel();
    const expected: [string, string][] = [
      ["imagebutton", "account.avatar"],
      ["button", "account.theme"], ["button", "account.language"], ["button", "account.notifications"],
      ["button", "account.textSize"], ["switch", "account.highContrast"],
      ["button", "account.privacyPolicy"], ["button", "account.deleteAccount"],
      ["button", "account.terms"], ["button", "common.signOut"],
    ];
    for (const [role, name] of expected) expect(screen.getByRole(role as never, { name })).toBeTruthy();
  });

  it.each([null, "https://x/a.jpg"])("the photo is 'Profile photo' with a hint, and hides the initials (avatarUrl=%s)", async (url) => {
    await renderPanel(url);
    const photo = screen.getByRole("imagebutton", { name: "account.avatar" });
    expect(photo.props.accessibilityHint).toBe("avatar.changeHint");
    expect(screen.queryByText("S")).toBeNull(); // las iniciales no se leen sueltas
  });

  it("section titles are headers, in order", async () => {
    await renderPanel();
    expect(screen.getAllByRole("header").map((h) => h.props.children)).toEqual([
      "account.sections.preferences", "account.sections.accessibility", "account.sections.privacy",
      "account.sections.about", "common.signOut",
    ]);
  });

  it("announces the profile load error", async () => {
    const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
    mockProfile({ isError: true });
    await render(<Account />);
    expect(announce).toHaveBeenCalledWith("account.loadError");
  });

  it("closing the photo menu gives focus back to the photo (Android: right away)", async () => {
    const sendEvent = jest.spyOn(AccessibilityInfo, "sendAccessibilityEvent").mockImplementation(() => {});
    Platform.OS = "android";
    await renderPanel();
    await fireEvent.press(screen.getByRole("imagebutton", { name: "account.avatar" }));
    const cancel = screen.getAllByRole("button", { name: "common.cancel" }).at(-1)!;
    await fireEvent.press(cancel);
    expect(sendEvent).toHaveBeenCalledWith(expect.anything(), "focus");
    Platform.OS = "ios";
  });

  it("decorative icons are inside a grouped element or hidden from the reader", async () => {
    await renderPanel();
    const icons = screen.getAllByTestId(/^icon-/, { includeHiddenElements: true });
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      let node: typeof icon | null = icon;
      let covered = false;
      while (node && !covered) {
        covered = node.props.accessible === true || node.props.accessibilityElementsHidden === true;
        node = node.parent;
      }
      expect({ icon: icon.props.testID, covered }).toEqual({ icon: icon.props.testID, covered: true });
    }
  });

  it("every touch target is at least 48×48", async () => {
    await renderPanel();
    const MIN_HEIGHT: Record<string, number> = { "min-h-12": 48, "min-h-[52px]": 52 };
    const targets = screen.getAllByRole(/^(button|switch|imagebutton)$/);
    for (const target of targets) {
      const fromClass = Math.max(0, ...String(target.props.className ?? "").split(" ").map((c) => MIN_HEIGHT[c] ?? 0));
      const child = target.children[0];
      const fromSize = typeof child === "object" ? (StyleSheet.flatten(child.props.style)?.height as number) ?? 0 : 0;
      // Las filas y botones ocupan todo el ancho; la foto mide 112×112.
      expect({ name: target.props.accessibilityLabel, ok: Math.max(fromClass, fromSize) >= 48 }).toEqual({
        name: target.props.accessibilityLabel,
        ok: true,
      });
    }
  });

  it("all accessible names and hints come from i18n and exist in en and es", async () => {
    await renderPanel();
    const valueAt = (obj: object, key: string) => key.split(".").reduce<any>((node, part) => node?.[part], obj);
    const labelled = screen.getAllByRole(/^(button|switch|imagebutton|header)$/);
    for (const el of labelled) {
      for (const key of [el.props.accessibilityLabel ?? el.props.children, el.props.accessibilityHint].filter(Boolean)) {
        expect([key, typeof valueAt(en, key), typeof valueAt(es, key)]).toEqual([key, "string", "string"]);
      }
    }
  });
});
