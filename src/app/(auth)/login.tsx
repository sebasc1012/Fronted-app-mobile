import { useState } from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { AuthBackground } from "../../components/ui/AuthBackground";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { AppleIcon } from "../../components/ui/icons/AppleIcon";
import { GoogleIcon } from "../../components/ui/icons/GoogleIcon";
import { FacebookIcon } from "../../components/ui/icons/FacebookIcon";
import { useAuth } from "../../../contexts/AuthContext";
import { useOAuth } from "@/hooks/useOAuth";
import { Mail, Lock } from "lucide-react-native";
import { loginSchema, LoginForm } from "@/squema/auth.schema";



export default function Login() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { handleOAuth, oauthLoading, oauthError } = useOAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) setServerError(error);
  };
  return (
    <View className="flex-1">
      <AuthBackground />
      <View className="flex-1 justify-center px-4">
        <GlassPanel>
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

          {(serverError || oauthError) && (
            <Text className="mb-3 text-sm text-danger">
              {t(serverError ?? oauthError!)}
            </Text>
          )}

          <Text className="mb-6 text-right text-sm text-[#2E2A28]">
            {t("auth.login.forgotPassword")}
          </Text>

          <Button
            title={t("auth.common.next")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            color="#8A6F56"
            radius={10}
          />

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300" />
            <Text className="mx-3 text-sm text-gray-500">
              {t("auth.common.or")}
            </Text>
            <View className="h-px flex-1 bg-gray-300" />
          </View>

          <View className="gap-3">
            <Button
              title={t("auth.common.continueWithApple")}
              variant="outline"
              pill
              icon={<AppleIcon />}
              onPress={() => handleOAuth("apple")}
              loading={oauthLoading}
              disabled={loading}
            />

            <Button
              title={t("auth.common.continueWithGoogle")}
              variant="outline"
              pill
              icon={<GoogleIcon />}
              onPress={() => handleOAuth("google")}
              loading={oauthLoading}
              disabled={loading}
            />

            <Button
              title={t("auth.common.continueWithFacebook")}
              variant="outline"
              pill
              icon={<FacebookIcon />}
              onPress={() => handleOAuth("facebook")}
              loading={oauthLoading}
              disabled={loading}
            />
          </View>
          <Text className="mt-6 w-full text-center text-sm text-primary">
            <Link href="/(auth)/signup">{t("auth.login.noAccount")}</Link>
          </Text>
        </GlassPanel>
      </View>
    </View>
  );
}
