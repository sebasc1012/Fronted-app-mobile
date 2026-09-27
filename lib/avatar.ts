import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import type { ImagePickerAsset } from "expo-image-picker";
import type { Profile } from "../src/hooks/useProfile";
import { api } from "./api";
import { queryClient } from "./queryClient";
import { supabase } from "./supabase";

const BUCKET = "finchoApp";
const FOLDER = "avatars"; // finchoApp/avatars/{userId}/…: el bucket puede guardar otros tipos de archivo
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 1024 * 1024;
const MAX_SIDE = 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  heic: "image/heic",
  heif: "image/heif",
};

export type AvatarAssetError = "format" | "size";

// Solo JPG/PNG/HEIC ≤10 MB. Si el picker no trae mimeType o fileSize, se deducen del archivo.
export function validateAvatarAsset(
  asset: Pick<ImagePickerAsset, "uri" | "mimeType" | "fileSize" | "fileName">,
): AvatarAssetError | null {
  const ext = (asset.fileName ?? asset.uri).split(".").pop()?.toLowerCase() ?? "";
  const mime = asset.mimeType ?? MIME_BY_EXT[ext];
  if (!mime || !ALLOWED_MIME.includes(mime)) return "format";
  const size = asset.fileSize ?? new File(asset.uri).size ?? 0;
  return size > MAX_INPUT_BYTES ? "size" : null;
}

// Lado mayor ≤1024 px, JPEG, ~1 MB como máximo (baja la calidad si hace falta).
export async function compressAvatar(asset: Pick<ImagePickerAsset, "uri" | "width" | "height">) {
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > MAX_SIDE) {
    context.resize(asset.width >= asset.height ? { width: MAX_SIDE, height: null } : { width: null, height: MAX_SIDE });
  }
  const image = await context.renderAsync();
  let uri = "";
  for (const compress of [0.8, 0.6, 0.4]) {
    uri = (await image.saveAsync({ format: SaveFormat.JPEG, compress })).uri;
    if ((new File(uri).size ?? 0) <= MAX_OUTPUT_BYTES) break;
  }
  return uri;
}

// Nombre único por subida: la URL cambia y el caché de imágenes no muestra la foto vieja.
export async function putAvatarFile(uri: string, userId: string) {
  const path = `${FOLDER}/${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await new File(uri).arrayBuffer(), { contentType: "image/jpeg" });
  if (error) throw error;
  return { path, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}

// ".../object/public/finchoApp/avatars/{userId}/{archivo}.jpg" → "avatars/{userId}/{archivo}.jpg"
function storagePath(url?: string | null) {
  return url?.split(`/${BUCKET}/`)[1];
}

function currentAvatarPath() {
  return storagePath(queryClient.getQueryData<Profile>(["profile"])?.avatarUrl);
}

// Best effort: si el borrado falla queda un archivo huérfano, pero el usuario ya ve el resultado correcto.
function removeFileQuietly(path?: string) {
  if (path) supabase.storage.from(BUCKET).remove([path]).catch(() => {});
}

// Sube la foto, la guarda en el perfil y actualiza ['profile'] (todos los avatares leen de ahí).
// Si el PATCH falla, borra el archivo recién subido: el perfil conserva la foto anterior.
export async function uploadAvatar(uri: string, userId: string) {
  const previous = currentAvatarPath();
  const { path, url } = await putAvatarFile(uri, userId);

  let profile: Profile;
  try {
    ({ profile } = (await api.patch<{ profile: Profile }>("/api/users/profile", { avatarUrl: url })).data);
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
    throw error;
  }

  queryClient.setQueryData(["profile"], profile);
  removeFileQuietly(previous);
  return profile;
}

// Primero el PATCH a null y después el borrado del archivo: si el PATCH falla, la foto se conserva.
export async function removeAvatar() {
  const previous = currentAvatarPath();
  const { profile } = (await api.patch<{ profile: Profile }>("/api/users/profile", { avatarUrl: null })).data;
  queryClient.setQueryData(["profile"], profile);
  removeFileQuietly(previous);
  return profile;
}
