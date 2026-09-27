import { Platform } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import Account from "../index";
import { useProfile } from "@/hooks/useProfile";

const mockSignOut = jest.fn();
jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock("lucide-react-native", () => new Proxy({}, { get: () => () => null }));
jest.mock("expo-constants", () => ({ expoConfig: { version: "1.2.3" } }));
jest.mock("expo-image", () => ({ Image: (props: any) => require("react").createElement("Image", props) }));
jest.mock("@/hooks/useProfile", () => ({ useProfile: jest.fn() }));
const mockChange = jest.fn();
let mockUploading = false;
jest.mock("@/hooks/useAvatar", () => ({ useChangeAvatar: () => ({ change: mockChange, isPending: mockUploading }) }));
jest.mock("../../../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { email: "seba@fincho.com" }, signOut: mockSignOut }),
}));

const refetch = jest.fn();
const mockProfile = (state: object) =>
  (useProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: false, refetch, ...state });

beforeEach(() => {
  jest.clearAllMocks();
  mockUploading = false;
});

describe("Account panel", () => {
  it("renders the header with photo, name and email", async () => {
    mockProfile({ data: { fullName: "Sebastián Castro", avatarUrl: "https://x/a.png" } });
    await render(<Account />);
    expect(screen.getByTestId("avatar-image")).toBeTruthy();
    expect(screen.getByText("Sebastián Castro")).toBeTruthy();
    expect(screen.getByText("seba@fincho.com")).toBeTruthy();
  });

  it("does not render the name line when fullName is null", async () => {
    mockProfile({ data: { fullName: null, avatarUrl: null } });
    await render(<Account />);
    expect(screen.getByText("S")).toBeTruthy(); // inicial del correo
    expect(screen.getByText("seba@fincho.com")).toBeTruthy();
    expect(JSON.stringify(screen.toJSON())).not.toContain("text-2xl"); // la línea del nombre
  });

  it("renders the 5 sections and their rows in order", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    const texts = screen.getAllByText(/^(account|common)\./).map((n) => n.props.children);
    expect(texts).toEqual([
      "account.sections.preferences", "account.theme", "account.language", "account.notifications",
      "account.sections.accessibility", "account.textSize",
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

  it("sign out calls signOut", async () => {
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("button", { name: "common.signOut" }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
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
    await fireEvent.press(screen.getByRole("button", { name: "avatar.change" }));
    expect(screen.getByText("avatar.takePhoto")).toBeTruthy();
    expect(screen.getByText("avatar.chooseFromLibrary")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "common.cancel" }).length).toBeGreaterThan(0);
  });

  it("choosing an option closes the menu and starts the change (Android: right away)", async () => {
    Platform.OS = "android";
    mockProfile({ data: { fullName: "Seba", avatarUrl: null } });
    await render(<Account />);
    await fireEvent.press(screen.getByRole("button", { name: "avatar.change" }));
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
    await fireEvent.press(screen.getByRole("button", { name: "avatar.change" }));
    expect(screen.queryByText("avatar.takePhoto")).toBeNull();
  });
});
