import { useState } from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router, Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { AuthBackground } from "../../components/ui/AuthBackground";
import { GlassPanel } from "../../components/ui/GlassPanel";
import { AppleIcon } from "../../components/ui/icons/AppleIcon";
import { GoogleIcon } from "../../components/ui/icons/GoogleIcon";
import { FacebookIcon } from "../../components/ui/icons/FacebookIcon";
import { useAuth } from "../../../contexts/AuthContext";
import { useOAuth } from "@/hooks/useOAuth";
import { Lock, Mail } from "lucide-react-native";

const signupSchema = z
  .object({
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signUp } = useAuth();
  const { handleOAuth, oauthLoading, oauthError } = useOAuth();
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
      <View className="flex-1 justify-center px-4">
        <GlassPanel>
          <Text className="mb-8 text-2xl font-bold text-[#2E2A28]">
            Crear cuenta
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={Mail}
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                placeholder="password"
                secureTextEntry
                icon={Lock}
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                icon={Lock}
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {(serverError || oauthError) && (
            <Text className="mb-3 text-sm text-danger">
              {serverError || oauthError}
            </Text>
          )}

          <Button
            title="NEXT"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            color="#8A6F56"
            radius={10}
          />

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300" />
            <Text className="mx-3 text-sm text-gray-500">Or</Text>
            <View className="h-px flex-1 bg-gray-300" />
          </View>

          <View className="gap-3">
            <Button
              title="Continue with Apple"
              variant="outline"
              pill
              icon={<AppleIcon />}
              onPress={() => handleOAuth("apple")}
              loading={oauthLoading}
            />

            <Button
              title="Continue with Google"
              variant="outline"
              pill
              icon={<GoogleIcon />}
              onPress={() => handleOAuth("google")}
              loading={oauthLoading}
            />

            <Button
              title="Continue with Facebook"
              variant="outline"
              pill
              icon={<FacebookIcon />}
              onPress={() => handleOAuth("facebook")}
              loading={oauthLoading}
            />
          </View>
          <Text className="mt-6 w-full text-center text-sm text-primary">
            <Link
              href="/(auth)/login"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </Text>
        </GlassPanel>
      </View>
    </View>
  );
}
