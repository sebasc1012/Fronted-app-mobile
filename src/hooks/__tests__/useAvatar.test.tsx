import { AccessibilityInfo, Alert, Linking } from "react-native";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useAvatarPicker, useChangeAvatar } from "../useAvatar";
import { compressAvatar, removeAvatar, uploadAvatar, validateAvatarAsset } from "../../../lib/avatar";

jest.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
jest.mock("../../../contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock("../../../lib/avatar", () => ({
  validateAvatarAsset: jest.fn(() => null),
  compressAvatar: jest.fn(async () => "file:///processed.jpg"),
  uploadAvatar: jest.fn(),
  removeAvatar: jest.fn(),
}));

const picker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
const openSettings = jest.spyOn(Linking, "openSettings").mockResolvedValue();
const announce = jest.spyOn(AccessibilityInfo, "announceForAccessibility").mockImplementation(() => {});
const ASSET = { uri: "file:///raw.jpg", width: 2000, height: 2000, mimeType: "image/jpeg", fileSize: 1000 };

// Pulsa el botón del último Alert por su texto.
const pressAlertButton = async (text: string) => {
  const buttons = alert.mock.calls.at(-1)![2]!;
  await act(async () => buttons.find((b) => b.text === text)!.onPress?.());
};

beforeEach(() => {
  jest.clearAllMocks();
  picker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true } as any);
  picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as any);
  picker.launchCameraAsync.mockResolvedValue({ canceled: false, assets: [ASSET] } as any);
  picker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [ASSET] } as any);
});

describe("useAvatarPicker", () => {
  const pick = async (source: "camera" | "library") => (await renderHook(() => useAvatarPicker())).result.current(source);

  it("asks for the permission before opening the picker, with a square crop", async () => {
    expect(await pick("camera")).toBe("file:///processed.jpg");
    expect(picker.requestCameraPermissionsAsync).toHaveBeenCalled();
    expect(picker.launchCameraAsync).toHaveBeenCalledWith(expect.objectContaining({ allowsEditing: true, aspect: [1, 1] }));
    expect(compressAvatar).toHaveBeenCalledWith(ASSET);
  });

  it("does not open the picker when denied, and 'Open Settings' calls Linking.openSettings", async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false } as any);
    expect(await pick("library")).toBeNull();
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith("avatar.permission.libraryTitle", "avatar.permission.libraryMessage", expect.any(Array));
    await pressAlertButton("avatar.openSettings");
    expect(openSettings).toHaveBeenCalled();
  });

  it("canceling the picker or the crop changes nothing and shows no error", async () => {
    picker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: null } as any);
    expect(await pick("camera")).toBeNull();
    expect(compressAvatar).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });

  it("shows the validation error and does not compress an invalid image", async () => {
    (validateAvatarAsset as jest.Mock).mockReturnValueOnce("size");
    expect(await pick("library")).toBeNull();
    expect(alert).toHaveBeenCalledWith("avatar.invalid.size");
    expect(compressAvatar).not.toHaveBeenCalled();
  });
});

describe("useChangeAvatar", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } })}>{children}</QueryClientProvider>
  );

  it("uploads the processed image and 'Retry' re-uploads the same image without opening the picker", async () => {
    (uploadAvatar as jest.Mock).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({});
    const { result } = await renderHook(() => useChangeAvatar(), { wrapper });

    await act(() => result.current.change("library"));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("avatar.uploadError", undefined, expect.any(Array)));
    expect(uploadAvatar).toHaveBeenCalledWith("file:///processed.jpg", "u1");

    await pressAlertButton("common.retry");
    await waitFor(() => expect(uploadAvatar).toHaveBeenCalledTimes(2));
    expect(uploadAvatar).toHaveBeenLastCalledWith("file:///processed.jpg", "u1");
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
  });

  it("does not upload when the picker is canceled", async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null } as any);
    const { result } = await renderHook(() => useChangeAvatar(), { wrapper });
    await act(() => result.current.change("library"));
    expect(uploadAvatar).not.toHaveBeenCalled();
  });

  it("remove asks for confirmation and 'Cancel' does not call the service", async () => {
    const { result } = await renderHook(() => useChangeAvatar(), { wrapper });

    await act(async () => result.current.remove());
    expect(alert).toHaveBeenCalledWith("avatar.removeConfirmTitle", undefined, expect.any(Array));
    await pressAlertButton("common.cancel");
    expect(removeAvatar).not.toHaveBeenCalled();
  });

  it("confirming removes the photo, and a failure shows the error", async () => {
    (removeAvatar as jest.Mock).mockRejectedValueOnce(new Error("offline"));
    const { result } = await renderHook(() => useChangeAvatar(), { wrapper });

    await act(async () => result.current.remove());
    await pressAlertButton("avatar.removeConfirm");
    await waitFor(() => expect(alert).toHaveBeenLastCalledWith("avatar.removeError"));
    expect(removeAvatar).toHaveBeenCalledTimes(1);
  });

  it("announces 'Photo updated' and 'Photo removed' to screen readers", async () => {
    (uploadAvatar as jest.Mock).mockResolvedValueOnce({});
    (removeAvatar as jest.Mock).mockResolvedValueOnce({});
    const { result } = await renderHook(() => useChangeAvatar(), { wrapper });

    await act(() => result.current.change("library"));
    await waitFor(() => expect(announce).toHaveBeenCalledWith("avatar.uploaded"));

    await act(async () => result.current.remove());
    await pressAlertButton("avatar.removeConfirm");
    await waitFor(() => expect(announce).toHaveBeenCalledWith("avatar.removed"));
  });
});
