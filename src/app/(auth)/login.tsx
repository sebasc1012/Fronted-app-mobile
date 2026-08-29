import { useState } from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { signIn } = useAuth();
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
    // si no hay error, (app)/_layout.tsx redirige solo al detectar la sesión
  };

  return (
    <View className="flex-1 justify-center px-6">
      <Text className="mb-8 text-2xl font-bold">Iniciar sesión</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Correo"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Contraseña"
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
            secureTextEntry
          />
        )}
      />

      {serverError && (
        <Text className="mb-3 text-sm text-danger">{serverError}</Text>
      )}

      <Button
        title="Entrar"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
      />

      <Link
        href="/(auth)/signup"
        className="mt-4 text-center text-sm text-primary"
      >
        ¿No tienes cuenta? Regístrate
      </Link>
    </View>
  );
}
