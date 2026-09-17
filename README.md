# Finanzas al Día — Aplicación móvil

Aplicación React Native para organizar obligaciones financieras recurrentes y recibir
recordatorios antes de sus vencimientos. Implementa la base de autenticación para iOS
y Android mediante Supabase Auth y consume el backend para el perfil y los futuros
módulos financieros.

## MVP

El MVP permitirá iniciar sesión, registrar pagos mensuales, revisar próximos
vencimientos, recibir recordatorios y marcar pagos como realizados. No procesa pagos
ni integra Apple Pay/Google Pay. El alcance de auth sí incluye Google Sign-In y Sign
in with Apple mediante Supabase Auth.

## Stack

- React Native, Expo y Expo Router
- TypeScript, React Hook Form y Zod
- Supabase JS con Expo SecureStore
- Axios y TanStack Query
- NativeWind

## Arquitectura de producto

El proyecto aplica SOLID y Clean Code. La lógica de sesión reside en `AuthContext`,
el acceso a API en hooks y clientes dedicados, y las pantallas se agrupan por rutas y
dominios. Los próximos módulos serán `auth`, `profile`, `obligations` y `reminders`.

## Flujo actual de autenticación

1. El usuario se registra o inicia sesión con email y contraseña directamente
   en Supabase Auth.
2. La sesión se persiste en `expo-secure-store` y se restaura al abrir la app.
3. Axios obtiene el `access_token` de la sesión y lo manda como Bearer token al
   backend.
4. El backend valida el token y administra un perfil PostgreSQL asociado al UUID
   del usuario de Supabase.
5. La app intenta dirigir a usuarios sin onboarding a la pantalla de perfil.

Los próximos proveedores son Google Sign-In y Sign in with Apple. Ambos reutilizarán
la sesión de Supabase y el flujo de rutas protegidas; no se usarán APIs de Apple Pay o
Google Pay.

El flujo está en etapa de prototipo: revisa las limitaciones conocidas antes de
usarlo como base de producción.

## Requisitos

- Node.js compatible con la versión instalada de Expo
- Xcode (iOS), Android Studio (Android) o Expo Go
- Un proyecto Supabase compartido con el backend
- Backend local o desplegado accesible desde el dispositivo/emulador

## Configuración local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` con valores públicos:

   ```dotenv
   EXPO_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_NETWORK_IP:3000/api
   ```

   Nunca incluyas la clave secreta de Supabase en este proyecto ni en una variable
   `EXPO_PUBLIC_*`. Esas variables se empaquetan en la aplicación.

3. Inicia Expo:

   ```bash
   npm start
   ```

También puedes usar `npm run ios`, `npm run android` o `npm run web`.

Para un dispositivo físico, `EXPO_PUBLIC_API_URL` debe apuntar a la IP local de
tu computador o a una API desplegada; `localhost` se refiere al dispositivo, no
al servidor de tu computador.

## Estructura relevante

| Ubicación | Responsabilidad |
|---|---|
| `lib/supabase.ts` | Cliente Supabase y persistencia segura de la sesión |
| `contexts/AuthContext.tsx` | Estado de sesión, login, registro y logout |
| `lib/api.ts` | Cliente Axios e inyección del Bearer token |
| `src/app/(auth)` | Login, registro, confirmación de correo y onboarding |
| `src/app/(app)` | Rutas protegidas de la aplicación |
| `src/hooks/useProfile.ts` | Consulta del perfil remoto |
| `src/hooks/useUpsertProfile.ts` | Creación/actualización del perfil |

## Verificación manual

- Registro sin confirmación de correo: la sesión debe permitir acceder a la app.
- Registro con confirmación: se debe mostrar la pantalla que pide revisar el
  correo y luego permitir login.
- Login con credenciales válidas e inválidas.
- Reiniciar la app y comprobar que la sesión se restaura.
- Cerrar sesión y comprobar que se vuelve a login.
- Crear, omitir y retomar onboarding cuando el contrato de perfil esté corregido.

## Calidad

```bash
npx tsc --noEmit
npm run lint
```

La configuración de ESLint aún no está incorporada al proyecto. `expo lint` puede
solicitar instalar paquetes si el entorno tiene conexión; no aceptes cambios
automáticos sin revisarlos y versionarlos de forma explícita.

## Limitaciones conocidas

- **Contrato de perfil:** el backend devuelve `GET /api/users/profile` como
  `{ profile: ... }`, pero `useProfile` espera el perfil directamente. Mientras
  no se unifique, la decisión de onboarding no es fiable.
- **Finalización de onboarding:** la app crea o actualiza el perfil, pero el
  backend no expone un campo u operación para marcar `onboardingCompleted`.
  Completar u omitir el formulario puede redirigir de vuelta al onboarding cuando
  se corrija el contrato anterior.
- **Sesión expirada:** no existe aún un interceptor global para manejar respuestas
  `401`, limpiar sesión y redirigir a login.
- **Cobertura:** no hay pruebas automatizadas del flujo de auth, navegación,
  token expirado ni perfil eliminado.
- **Cuenta eliminada:** el backend realiza soft delete del perfil; no borra el
  usuario de Supabase ni cierra su sesión automáticamente.

## Próximos pasos

1. Acordar y aplicar el contrato único de perfil con el backend.
2. Implementar el estado de onboarding completado u omitido.
3. Implementar Google Sign-In y Sign in with Apple.
4. Manejar globalmente tokens inválidos o expirados.
5. Diseñar las pantallas de obligaciones financieras y próximos vencimientos.
6. Definir recordatorios locales/push y su sincronización con backend.
7. Añadir pruebas de auth y navegación.
