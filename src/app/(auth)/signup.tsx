import { useState } from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router, Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
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
    <View className="flex-1 justify-center px-6">
      <Text className="mb-8 text-2xl font-bold">Crear cuenta</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Correo electrónico"
            placeholder="Ingresa tu correo"
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
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
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
            label="Confirmar contraseña"
            value={value}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
            secureTextEntry
          />
        )}
      />

      {serverError && (
        <Text className="mb-3 text-sm text-danger">{serverError}</Text>
      )}

      <Button
        title="Registrarme"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
      />

      <Link
        href="/(auth)/login"
        className="mt-4 text-center text-sm text-primary"
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </View>
  );
}
