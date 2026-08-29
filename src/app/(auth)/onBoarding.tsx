import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { View, Text, ScrollView, Switch, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import { useUpsertProfile } from "@/hooks/useUpsertProfile";
import {
  OnboardingFormValues,
  onboardingSchema,
} from "@/squema/onboarding.schema";
import { Select } from "@/components/ui/Select";
import { GENDER_OPTIONS } from "@/constants/gender.const";

export default function Onboarding() {
  const { user } = useAuth();
  const { mutateAsync, isPending } = useUpsertProfile();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: "",
      gender: null,
      country: "",
      phone: "",
      notificationsEnabled: true,
    },
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (): Promise<string | undefined> => {
    if (!avatarUri || !user) {
      return undefined;
    }

    const response = await fetch(avatarUri);
    const blob = await response.blob();

    const path = `${user.id}/avatar.jpg`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);

    return data.publicUrl;
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      const avatarUrl = await uploadAvatar();

      await mutateAsync({
        ...data,
        gender: data.gender ?? undefined,
        avatarUrl,
      });

      router.replace("/(app)");
    } catch (error) {
      console.error("Error completing onboarding:", error);

      setError("root", {
        message: "No fue posible completar tu perfil. Inténtalo nuevamente.",
      });
    }
  };

  const onSkip = async () => {
    try {
      await mutateAsync({});
      router.replace("/(app)");
    } catch (error) {
      console.error("Error skipping onboarding:", error);

      setError("root", {
        message: "No fue posible completar el proceso. Inténtalo nuevamente.",
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 px-6 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="mb-2 text-2xl font-bold">Cuéntanos sobre ti</Text>

      <Text className="mb-6 text-base text-gray-500">
        Estos datos son opcionales. Puedes completarlos ahora o hacerlo más
        adelante.
      </Text>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Nombre completo"
            value={value ?? ""}
            onChangeText={onChange}
            error={errors.fullName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Teléfono"
            value={value ?? ""}
            onChangeText={onChange}
            keyboardType="phone-pad"
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value } }) => (
          <Input
            label="País"
            placeholder="Ej: CO"
            value={value ?? ""}
            onChangeText={onChange}
            maxLength={2}
            autoCapitalize="characters"
            error={errors.country?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Select
            label="Género"
            value={value}
            options={GENDER_OPTIONS}
            onChange={onChange}
            placeholder="Selecciona tu género"
            error={error?.message}
            disabled={isPending}
          />
        )}
      />

      <View className="mb-4">
        <Button
          title={avatarUri ? "Cambiar foto" : "Elegir foto de perfil"}
          onPress={pickImage}
          variant="secondary"
          disabled={isPending}
        />

        {avatarUri && (
          <Text className="mt-2 text-sm text-gray-500">Foto seleccionada</Text>
        )}
      </View>

      <Controller
        control={control}
        name="notificationsEnabled"
        render={({ field: { onChange, value } }) => (
          <View className="my-4 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-base font-medium">Notificaciones</Text>

              <Text className="mt-1 text-sm text-gray-500">
                Recibe notificaciones importantes de la aplicación.
              </Text>
            </View>

            <Switch
              value={value}
              onValueChange={onChange}
              disabled={isPending}
            />
          </View>
        )}
      />

      {errors.root?.message && (
        <Text className="mb-4 text-center text-sm text-red-500">
          {errors.root.message}
        </Text>
      )}

      <Button
        title="Crear perfil"
        onPress={handleSubmit(onSubmit)}
        loading={isPending}
        disabled={isPending}
      />

      <View className="h-3" />

      <Button
        title="Omitir por ahora"
        onPress={onSkip}
        variant="secondary"
        disabled={isPending}
      />
    </ScrollView>
  );
}
