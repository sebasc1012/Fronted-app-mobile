import { useState } from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { Mail, Lock } from "lucide-react-native";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setGoogleLoading(true);

    const result = await signInWithGoogle();

    setGoogleLoading(false);

    if (result.status === "error") {
      setServerError(result.message);
    }
  };
  return (
    <View className="flex-1 justify-center px-6">
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

      {serverError && (
        <Text className="mb-3 text-sm text-danger">{serverError}</Text>
      )}

      <Button
        title="Entrar"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
      />

      <Button
        title="Continuar con Google"
        onPress={handleGoogleSignIn}
        loading={googleLoading}
        disabled={loading}
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
