import { useState } from "react";
import { View, ScrollView } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { router, Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { palettes } from "../../constants/colors";
import { AuthBackground } from "../../components/ui/AuthBackground";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { AppleIcon } from "../../components/ui/icons/AppleIcon";
import { GoogleIcon } from "../../components/ui/icons/GoogleIcon";
import { FacebookIcon } from "../../components/ui/icons/FacebookIcon";
import { useAuth } from "../../../contexts/AuthContext";
import { useOAuth } from "@/hooks/useOAuth";
import { Lock, Mail } from "lucide-react-native";
import { signupSchema, SignupForm } from "@/squema/auth.schema";


export default function Signup() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const { handleOAuth, loadingProvider, oauthError } = useOAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignupForm) => {
    setServerError(null);
    setLoading(true);
    const { error, needsEmailConfirmation } = await signUp(
      data.email,
      data.password,
    );
    setLoading(false);

    if (error) {
      setServerError(error);
      return;
    }
    if (needsEmailConfirmation) {
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: data.email },
      });
      return;
    }
    // sin confirmación pendiente, (app)/_layout.tsx redirige solo
  };

  return (
    <View className="flex-1">
      <AuthBackground />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <GlassPanel>
          <AppText className="mb-8 text-2xl font-bold text-brand-ink">
            {t("auth.signup.title")}
          </AppText>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("auth.common.emailLabel")}
                placeholder={t("auth.common.emailPlaceholder")}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={Mail}
                value={value}
                onChangeText={onChange}
                error={errors.email && t(errors.email.message!)}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("auth.common.passwordLabel")}
                placeholder={t("auth.common.passwordPlaceholder")}
                secureTextEntry
                icon={Lock}
                value={value}
                onChangeText={onChange}
                error={errors.password && t(errors.password.message!)}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t("auth.signup.confirmPasswordLabel")}
                placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                secureTextEntry
                icon={Lock}
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword && t(errors.confirmPassword.message!)}
              />
            )}
          />

          {(serverError || oauthError) && (
            <AppText className="mb-3 text-sm text-danger">
              {t(serverError ?? oauthError!)}
            </AppText>
          )}

          <Button
            title={t("auth.common.next")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={!!loadingProvider}
            color={palettes.light["brand-accent"]}
            radius={10}
          />

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-border/40" />
            <AppText className="mx-3 text-sm text-text-muted">{t("auth.common.or")}</AppText>
            <View className="h-px flex-1 bg-border/40" />
          </View>

          <View className="gap-3">
            <Button
              title={t("auth.common.continueWithApple")}
              variant="outline"
              pill
              icon={<AppleIcon />}
              onPress={() => handleOAuth("apple")}
              loading={loadingProvider === "apple"}
              disabled={loading || !!loadingProvider}
            />

            <Button
              title={t("auth.common.continueWithGoogle")}
              variant="outline"
              pill
              icon={<GoogleIcon />}
              onPress={() => handleOAuth("google")}
              loading={loadingProvider === "google"}
              disabled={loading || !!loadingProvider}
            />

            <Button
              title={t("auth.common.continueWithFacebook")}
              variant="outline"
              pill
              icon={<FacebookIcon />}
              onPress={() => handleOAuth("facebook")}
              loading={loadingProvider === "facebook"}
              disabled={loading || !!loadingProvider}
            />
          </View>
          <AppText className="mt-6 w-full text-center text-sm text-primary">
            <Link
              href="/(auth)/login"
            >
              {t("auth.signup.hasAccount")}
            </Link>
          </AppText>
        </GlassPanel>
      </ScrollView>
    </View>
  );
}
