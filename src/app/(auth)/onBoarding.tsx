import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { AuthBackground } from "../../components/ui/AuthBackground";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { useUpsertProfile } from "@/hooks/useUpsertProfile";
import {
  OnboardingFormValues,
  onboardingSchema,
} from "@/squema/onboarding.schema";
import { GENDER_OPTIONS } from "@/constants/gender.const";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Onboarding() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { user } = useAuth();
  const { mutateAsync, isPending } = useUpsertProfile();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
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
    if (!permission.granted) return;

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
    if (!avatarUri || !user) return undefined;

    const response = await fetch(avatarUri);
    const blob = await response.blob();
    const path = `${user.id}/avatar.jpg`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });

    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      setServerError(null);
      const avatarUrl = await uploadAvatar();
      await mutateAsync({
        ...data,
        gender: data.gender ?? undefined,
        avatarUrl,
      });
    } catch (error) {
      console.error("Error completing profile:", error);
      setServerError("errors.generic");
    }
  };

  const onSkip = async () => {
    try {
      setServerError(null);
      await mutateAsync({});
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      setServerError("errors.generic");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login")
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <View className="flex-1">
      <AuthBackground />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <GlassPanel>
          <Text className="mb-2 text-2xl font-bold">{t("onboarding.title")}</Text>
          <Text className="mb-6 text-base text-gray-500">
            {t("onboarding.subtitle")}
          </Text>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("onboarding.fullName")}
                value={value ?? ""}
                onChangeText={onChange}
                error={errors.fullName && t(errors.fullName.message!)}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("onboarding.phone")}
                value={value ?? ""}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.phone && t(errors.phone.message!)}
              />
            )}
          />

          <Controller
            control={control}
            name="country"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("onboarding.country")}
                placeholder={t("onboarding.countryPlaceholder")}
                value={value ?? ""}
                onChangeText={onChange}
                maxLength={2}
                autoCapitalize="characters"
                error={errors.country && t(errors.country.message!)}
              />
            )}
          />

          <Controller
            control={control}
            name="gender"
            render={({
              field: { onChange, value },
              fieldState: { error },
            }) => (
              <Select
                label={t("onboarding.gender")}
                value={value}
                options={GENDER_OPTIONS.map((o) => ({ ...o, label: t(o.label) }))}
                onChange={onChange}
                placeholder={t("onboarding.genderPlaceholder")}
                error={error && t(error.message!)}
                disabled={isPending}
              />
            )}
          />

          <Button
            title={avatarUri ? t("onboarding.changePhoto") : t("onboarding.pickPhoto")}
            onPress={pickImage}
            variant="secondary"
            disabled={isPending}
          />

          {avatarUri && (
            <Text className="mt-2 text-sm text-gray-500">
              {t("onboarding.photoSelected")}
            </Text>
          )}

          {serverError && (
            <Text className="mb-4 mt-4 text-center text-sm text-red-500">
              {t(serverError)}
            </Text>
          )}

          <Button
            title={t("onboarding.submit")}
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}
          />

          <View className="h-3" />

          <Button
            title={t("onboarding.skip")}
            onPress={onSkip}
            variant="secondary"
            disabled={isPending}
          />

          <View className="h-3" />

          <Button
            title={t("common.signOut")}
            onPress={handleSignOut}
            variant="secondary"
          />
        </GlassPanel>
      </ScrollView>
    </View>
  );
}
