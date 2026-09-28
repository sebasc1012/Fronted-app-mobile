import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { compressAvatar, removeAvatar, uploadAvatar, validateAvatarAsset } from "../../lib/avatar";
import { announce } from "./useAnnounce";

export type AvatarSource = "camera" | "library";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true, // recorte cuadrado nativo
  aspect: [1, 1],
  quality: 1, // la compresión la hace compressAvatar
};

// Pide permiso, abre cámara o galería, valida y comprime.
// Devuelve la URI procesada, o null si se canceló o algo falló (el usuario ya vio el aviso).
export function useAvatarPicker() {
  const { t } = useTranslation();

  return async (source: AvatarSource): Promise<string | null> => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t(`avatar.permission.${source}Title`), t(`avatar.permission.${source}Message`), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("avatar.openSettings"), onPress: () => Linking.openSettings() },
      ]);
      return null;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (result.canceled) return null;

    const asset = result.assets[0];
    const invalid = validateAvatarAsset(asset);
    if (invalid) {
      Alert.alert(t(`avatar.invalid.${invalid}`));
      return null;
    }
    try {
      return await compressAvatar(asset);
    } catch {
      Alert.alert(t("errors.generic"));
      return null;
    }
  };
}

// Menú del panel de perfil: elegir, procesar y subir, o eliminar la foto. Si la subida falla, "Reintentar"
// vuelve a subir la misma imagen ya procesada sin abrir el selector.
export function useChangeAvatar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const pickAvatar = useAvatarPicker();
  const { mutate, isPending } = useMutation({
    mutationFn: (uri: string) => uploadAvatar(uri, user!.id),
    onSuccess: () => announce(t("avatar.uploaded")),
  });
  const removal = useMutation({
    mutationFn: removeAvatar,
    onSuccess: () => announce(t("avatar.removed")),
    // Los errores van en Alert: VoiceOver y TalkBack lo leen solos al aparecer.
    onError: () => Alert.alert(t("avatar.removeError")),
  });

  const upload = (uri: string) =>
    mutate(uri, {
      onError: () =>
        Alert.alert(t("avatar.uploadError"), undefined, [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("common.retry"), onPress: () => upload(uri) },
        ]),
    });

  const change = async (source: AvatarSource) => {
    const uri = await pickAvatar(source);
    if (uri) upload(uri);
  };

  const remove = () =>
    Alert.alert(t("avatar.removeConfirmTitle"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("avatar.removeConfirm"), style: "destructive", onPress: () => removal.mutate() },
    ]);

  return { change, remove, isPending: isPending || removal.isPending };
}
