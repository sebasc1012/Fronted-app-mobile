import { compressAvatar, removeAvatar, uploadAvatar, validateAvatarAsset } from "../avatar";
import { api } from "../api";
import { queryClient } from "../queryClient";

const MB = 1024 * 1024;
const mockSizes: Record<string, number> = {};
jest.mock("expo-file-system", () => ({
  File: jest.fn().mockImplementation((uri: string) => ({
    size: mockSizes[uri] ?? 0,
    arrayBuffer: async () => new ArrayBuffer(8),
  })),
}));

const mockResize = jest.fn();
const mockSave = jest.fn();
jest.mock("expo-image-manipulator", () => ({
  SaveFormat: { JPEG: "jpeg" },
  ImageManipulator: {
    manipulate: jest.fn(() => ({ resize: mockResize, renderAsync: async () => ({ saveAsync: mockSave }) })),
  },
}));

const PUBLIC = "https://x.supabase.co/storage/v1/object/public/finchoApp/";
const mockStorage = {
  upload: jest.fn(),
  remove: jest.fn(),
  getPublicUrl: jest.fn((path: string) => ({ data: { publicUrl: PUBLIC + path } })),
};
jest.mock("../supabase", () => ({ supabase: { storage: { from: () => mockStorage } } }));
jest.mock("../api", () => ({ api: { patch: jest.fn() } }));
const mockPatch = api.patch as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
  mockStorage.upload.mockResolvedValue({ error: null });
  mockStorage.remove.mockResolvedValue({ error: null });
});

afterAll(() => queryClient.clear());

describe("validateAvatarAsset", () => {
  it("accepts JPG, PNG and HEIC up to 10 MB", () => {
    for (const mimeType of ["image/jpeg", "image/png", "image/heic", "image/heif"]) {
      expect(validateAvatarAsset({ uri: "file:///a", mimeType, fileSize: 10 * MB })).toBeNull();
    }
  });

  it("infers the type from the extension and the size from the file when missing", () => {
    mockSizes["file:///a.HEIC"] = 2 * MB;
    expect(validateAvatarAsset({ uri: "file:///a.HEIC" })).toBeNull();
    mockSizes["file:///big.png"] = 11 * MB;
    expect(validateAvatarAsset({ uri: "file:///big.png" })).toBe("size");
  });

  it("rejects GIF, WebP and files over 10 MB", () => {
    expect(validateAvatarAsset({ uri: "file:///a", mimeType: "image/gif", fileSize: MB })).toBe("format");
    expect(validateAvatarAsset({ uri: "file:///a.webp", fileSize: MB })).toBe("format");
    expect(validateAvatarAsset({ uri: "file:///a", mimeType: "image/jpeg", fileSize: 10 * MB + 1 })).toBe("size");
  });
});

describe("compressAvatar", () => {
  it("resizes the longest side to 1024 px and saves as JPEG", async () => {
    mockSave.mockResolvedValue({ uri: "file:///out.jpg" });
    expect(await compressAvatar({ uri: "file:///in", width: 3000, height: 4000 })).toBe("file:///out.jpg");
    expect(mockResize).toHaveBeenCalledWith({ width: null, height: 1024 });
    expect(mockSave).toHaveBeenCalledWith({ format: "jpeg", compress: 0.8 });
  });

  it("does not upscale small images", async () => {
    mockSave.mockResolvedValue({ uri: "file:///out.jpg" });
    await compressAvatar({ uri: "file:///in", width: 800, height: 600 });
    expect(mockResize).not.toHaveBeenCalled();
  });

  it("compresses again while the result is over ~1 MB", async () => {
    mockSizes["file:///q80.jpg"] = 2 * MB;
    mockSizes["file:///q60.jpg"] = MB / 2;
    mockSave.mockResolvedValueOnce({ uri: "file:///q80.jpg" }).mockResolvedValueOnce({ uri: "file:///q60.jpg" });
    expect(await compressAvatar({ uri: "file:///in", width: 1024, height: 1024 })).toBe("file:///q60.jpg");
    expect(mockSave).toHaveBeenLastCalledWith({ format: "jpeg", compress: 0.6 });
  });
});

describe("uploadAvatar", () => {
  const OLD = { avatarUrl: PUBLIC + "avatars/u1/old.jpg" };

  it("uploads to a unique name, PATCHes the profile, updates ['profile'] and deletes the old file", async () => {
    queryClient.setQueryData(["profile"], OLD);
    mockPatch.mockImplementation(async (_url, body) => ({ data: { profile: body } }));

    await uploadAvatar("file:///out.jpg", "u1");

    const [path, , options] = mockStorage.upload.mock.calls[0];
    expect(path).toMatch(/^avatars\/u1\/\d+\.jpg$/);
    expect(options).toEqual({ contentType: "image/jpeg" });
    expect(mockPatch).toHaveBeenCalledWith("/api/users/profile", { avatarUrl: PUBLIC + path });
    expect(queryClient.getQueryData(["profile"])).toEqual({ avatarUrl: PUBLIC + path });
    expect(mockStorage.remove).toHaveBeenCalledWith(["avatars/u1/old.jpg"]);
  });

  it("ignores a failure deleting the old file", async () => {
    queryClient.setQueryData(["profile"], OLD);
    mockPatch.mockImplementation(async (_url, body) => ({ data: { profile: body } }));
    mockStorage.remove.mockRejectedValue(new Error("network"));
    await expect(uploadAvatar("file:///out.jpg", "u1")).resolves.toBeTruthy();
  });

  it("keeps the previous avatar when the upload fails", async () => {
    queryClient.setQueryData(["profile"], OLD);
    mockStorage.upload.mockResolvedValue({ error: new Error("offline") });
    await expect(uploadAvatar("file:///out.jpg", "u1")).rejects.toThrow("offline");
    expect(mockPatch).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(["profile"])).toEqual(OLD);
  });

  it("deletes the new file and keeps the previous avatar when the PATCH fails", async () => {
    queryClient.setQueryData(["profile"], OLD);
    mockPatch.mockRejectedValue(new Error("500"));
    await expect(uploadAvatar("file:///out.jpg", "u1")).rejects.toThrow("500");
    const [path] = mockStorage.upload.mock.calls[0];
    expect(mockStorage.remove).toHaveBeenCalledWith([path]);
    expect(queryClient.getQueryData(["profile"])).toEqual(OLD);
  });
});

describe("removeAvatar", () => {
  const OLD = { avatarUrl: PUBLIC + "avatars/u1/old.jpg" };

  it("PATCHes avatarUrl to null, sets it in ['profile'] and deletes the file", async () => {
    queryClient.setQueryData(["profile"], OLD);
    mockPatch.mockImplementation(async (_url, body) => ({ data: { profile: body } }));

    await removeAvatar();

    expect(mockPatch).toHaveBeenCalledWith("/api/users/profile", { avatarUrl: null });
    expect(queryClient.getQueryData(["profile"])).toEqual({ avatarUrl: null });
    expect(mockStorage.remove).toHaveBeenCalledWith(["avatars/u1/old.jpg"]);
  });

  it("keeps the photo and does not delete the file when the PATCH fails", async () => {
    queryClient.setQueryData(["profile"], OLD);
    mockPatch.mockRejectedValue(new Error("offline"));

    await expect(removeAvatar()).rejects.toThrow("offline");
    expect(queryClient.getQueryData(["profile"])).toEqual(OLD);
    expect(mockStorage.remove).not.toHaveBeenCalled();
  });
});
