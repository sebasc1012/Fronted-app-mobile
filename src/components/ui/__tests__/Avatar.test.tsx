import { render, screen, fireEvent } from "@testing-library/react-native";
import { Avatar, getInitials } from "../Avatar";
import { useProfile } from "@/hooks/useProfile";

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("expo-image", () => ({ Image: (props: any) => require("react").createElement("Image", props) }));
jest.mock("@/hooks/useProfile", () => ({ useProfile: jest.fn() }));
jest.mock("../../../../contexts/AuthContext", () => ({ useAuth: () => ({ user: { email: "seba@fincho.com" } }) }));

const mockProfile = (profile: object | null) => (useProfile as jest.Mock).mockReturnValue({ data: profile });

describe("getInitials", () => {
  it("one word → 1 letter, two or more → first + last, no name → email initial", () => {
    expect(getInitials("Sebastián", "x@y.com")).toBe("S");
    expect(getInitials("Sebastián Castro López", "x@y.com")).toBe("SL");
    expect(getInitials("  ana  maría ", "x@y.com")).toBe("AM");
    expect(getInitials(null, "seba@fincho.com")).toBe("S");
    expect(getInitials("   ", "seba@fincho.com")).toBe("S");
    expect(getInitials(null, null)).toBe("?");
  });
});

describe("Avatar", () => {
  it("renders the photo when avatarUrl exists", async () => {
    mockProfile({ fullName: "Sebastián Castro", avatarUrl: "https://x/a.png" });
    await render(<Avatar />);
    expect(screen.getByTestId("avatar-image", { includeHiddenElements: true })).toBeTruthy();
    // Decorativo: el botón que lo contiene lleva la etiqueta (HU-08).
    expect(screen.getByTestId("avatar-image", { includeHiddenElements: true })).toBeTruthy();
  });

  it("renders initials when avatarUrl is null", async () => {
    mockProfile({ fullName: "Sebastián Castro López", avatarUrl: null });
    await render(<Avatar />);
    expect(screen.getByText("SL", { includeHiddenElements: true })).toBeTruthy();
  });

  it("falls back to initials when the image fails to load", async () => {
    mockProfile({ fullName: "Sebastián", avatarUrl: "https://x/broken.png" });
    await render(<Avatar />);
    await fireEvent(screen.getByTestId("avatar-image", { includeHiddenElements: true }), "error");
    expect(screen.queryByTestId("avatar-image", { includeHiddenElements: true })).toBeNull();
    expect(screen.getByText("S", { includeHiddenElements: true })).toBeTruthy();
  });

  it("shows a new photo after a previous one failed to load", async () => {
    mockProfile({ fullName: "Sebastián", avatarUrl: "https://x/broken.png" });
    await render(<Avatar />);
    await fireEvent(screen.getByTestId("avatar-image", { includeHiddenElements: true }), "error");
    expect(screen.queryByTestId("avatar-image", { includeHiddenElements: true })).toBeNull();

    mockProfile({ fullName: "Sebastián", avatarUrl: "https://x/new.png" });
    await screen.rerender(<Avatar />);
    expect(screen.getByTestId("avatar-image", { includeHiddenElements: true }).props.source).toBe("https://x/new.png");
  });
});
