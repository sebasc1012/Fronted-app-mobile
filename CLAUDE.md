# Finanzas al Día — Frontend (Mobile-App) CLAUDE.md

## Contexto del proyecto

Frontend móvil (iOS/Android) construido con **React Native + Expo** para gestionar compromisos financieros recurrentes. Integra:
- Supabase Auth (identidad + sesiones seguras via SecureStore)
- Axios + TanStack Query (HTTP + cache)
- NativeWind (Tailwind para componentes)
- Expo Router (routing type-safe con deep links)

El desarrollador domina React/TypeScript/Tailwind, así que stack minimiza curva de aprendizaje: Supabase Auth gestionada, componentes base propios (Input, Button), sin librerías UI grandes.

Backend Fases 1-7 completas (Profile, Categories, Commitments, Occurrences, Payments, Recordatorios, OAuth). Frontend ensamblando UI e integración.

---

## Stack técnico

- **Runtime:** React Native 0.76 + Expo SDK 54 + CNG (Config Plugins)
- **Lenguaje:** TypeScript
- **Routing:** Expo Router (grupos `(auth)` / `(app)`, deep links)
- **Styling:** NativeWind (Tailwind CSS para RN)
- **HTTP:** Axios + interceptor Bearer token
- **State + Cache:** TanStack Query (@tanstack/react-query)
- **Auth:** Supabase JS SDK + `expo-secure-store`
- **Storage:** Supabase Storage (avatars con RLS)
- **Validación:** Zod + react-hook-form
- **Testing:** Jest + React Native Testing Library
- **Build/Deploy:** EAS Build + EAS Submit → App Store Connect / Google Play Console

---

## Estado actual (2026-09-18)

### ✅ Completado

- [x] Setup Expo SDK 54 + Expo Router (CNG)
- [x] Cliente Supabase (`lib/supabase.ts` + SecureStore adapter)
- [x] Cliente HTTP Axios (`lib/api.ts` + interceptor Bearer)
- [x] TanStack Query (`lib/queryClient.ts` + `QueryClientProvider`)
- [x] `AuthContext` (signIn, signUp, signInWithOAuth, signOut, sesión persistente)
- [x] `useOAuth` (`src/hooks/useOAuth.ts`) — handler reutilizable de OAuth (loading/error) para login y signup
- [x] NativeWind + componentes base (`Input.tsx`, `Button.tsx`, `Select.tsx`)
- [x] **Login UI** (`src/app/(auth)/login.tsx`) — email/password + Zod + react-hook-form + botones OAuth
- [x] **Signup UI** (`src/app/(auth)/signup.tsx`) — email/password/confirmación + Zod + botones OAuth
- [x] **Google/Apple Sign-In** — `signInWithOAuth` en `AuthContext` + `useOAuth`, deep link `mobileapp://`
- [x] Gate de rutas centralizado en `src/app/_layout.tsx` (`Stack.Protected`, única fuente de verdad — ver
      sección "Arquitectura de autenticación y enrutamiento")
- [x] Onboarding de perfil (pantalla + integración `useUpsertProfile`, selector de género con `Select.tsx`)
- [x] Flujo verificación de email (`(auth)/verify-email.tsx`)
- [x] Hooks: `useProfile` (distingue 404 "sin perfil" de 401 "sesión inválida"), `useUpsertProfile`
- [x] Logout básico — botón "Cerrar sesión" en `(app)/index.tsx` (sin modal de confirmación aún)

### ⏳ Pendiente (Tareas priorizadas MVP)

- [ ] **Logout con confirmación** — modal antes de `signOut()`
- [ ] **Pantalla "Mi Perfil"** (`(app)/profile.tsx`) — separar de `(app)/index.tsx`
- [ ] **Selector país** — actualmente `Input` de texto libre (código ISO manual); falta dropdown ISO 3166-1
- [ ] **Avatar picker** — upload a Supabase Storage ya implementado en onboarding; falta preview/edición post-onboarding
- [ ] **Notificaciones en onboarding** — el campo `notificationsEnabled` existe en backend pero no hay control en la UI actual
- [ ] **Jest setup** — hay `jest.config.js`/`jest.setup.js` y `src/__tests__/validation.test.ts`; faltan tests de `useProfile`, `useUpsertProfile` y `AuthContext`

---

## Análisis de tareas (Usuario propuso 4, ¿agregar más?)

**Propuestas del usuario:**
1. ✅ Ajustar onboarding — definir contenido (campos + obligatorios?)
2. ✅ Integración Google/Apple Sign-In
3. ✅ Flujo completo login/logout
4. ✅ Jest setup

**Tareas adicionales recomendadas (pueden esperar a wireframes de (app)):**

| Tarea | Por qué | Agregar cuando |
|-------|---------|-----------------|
| Avatar upload UI | Parte de onboarding, mejora UX | Wireframe define UI |
| Selectors país/género | Validación Zod requiere valores válidos | Contenido onboarding definido |
| Pantalla "Mi Perfil" | Ver datos propios, logout, reauth | Routes de (app) listos |
| Testing: hooks auth | AuthContext es crítico | Paralelo a login/signup |
| Pantalla lista compromisos | Core del producto | Wireframes (app) listos |
| Pantalla crear compromiso | Core del producto | Wireframes (app) listos |
| Testing: Axios + offline | Recovery de network | Después MVP auth completo |

**Recomendación:** Mantén las 4 prioritarias. Avatar + selectors son parte de onboarding (agregables ahora). Pantallas de (app) esperan wireframes.

---

## Arquitectura de autenticación y enrutamiento

Puerta única de acceso en `src/app/_layout.tsx` (`RootNavigation`). Ningún otro
archivo decide si se muestra `(auth)` o `(app)` — evita la duplicación de lógica
que causó el bug de routing de 2026-09-17/18 (ver log de esa fecha).

```
useAuth()        → session, authLoading
useProfile(!!session) → profile, profileLoading   (misma query en toda la app: ["profile"])

isReady      = !authLoading && !profileLoading
isAuthorized = !!session && !!profile?.onboardingCompleted

<Stack>
  <Stack.Protected guard={isAuthorized}>  <Stack.Screen name="(app)" />  </Stack.Protected>
  <Stack.Protected guard={!isAuthorized}> <Stack.Screen name="(auth)" /> </Stack.Protected>
</Stack>
```

Mientras `!isReady`, no se renderiza nada (splash screen visible). `Stack.Protected`
monta/desmonta el grupo completo según `isAuthorized`; Expo Router redirige solo
cuando el guard cambia, no en cada render.

**`(auth)/_layout.tsx`** — solo entra aquí cuando `!isAuthorized`, es decir, sin
sesión O con sesión pero onboarding incompleto. Dentro del grupo:
- Si `session` existe (onboarding incompleto es la única razón de estar aquí) y la
  ruta actual no es `/onBoarding`, hace `<Redirect href="/(auth)/onBoarding" />`.
  La comparación de ruta (`usePathname() !== "/onBoarding"`) es obligatoria: sin
  ella, el redirect se dispara en cada render incluso estando ya en onBoarding →
  bucle infinito ("Maximum update depth exceeded").
- Si no hay `session`, renderiza `<Stack/>` normal y Expo Router muestra la
  pantalla de archivo que corresponda (`login`, `signup`, `verify-email`).
- `export const unstable_settings = { initialRouteName: "login" }` es necesario
  porque el grupo no tiene `index.tsx`; sin esto, Expo Router no sabe qué pantalla
  mostrar cuando se entra al grupo sin un path específico.

**`(app)/_layout.tsx`** — es un `<Stack/>` plano, sin chequeos de sesión. No los
necesita: el root ya garantiza que este grupo solo se monta con
`session && onboardingCompleted`.

**`src/hooks/useProfile.ts`** — `fetchProfile` distingue tres casos del `GET
/api/users/profile`:
- `404` → `return null` (usuario autenticado, perfil aún no existe → onboarding).
- `401` → token inválido/expirado (típicamente una sesión vieja que quedó en
  SecureStore/Keychain de una prueba anterior). Se fuerza `supabase.auth.signOut()`
  y se retorna `null`; el cambio de sesión hace que el root re-evalúe y muestre
  login. **Sin este caso**, un 401 se trataba igual que un 404 y el usuario
  terminaba en onboarding creyendo que no tenía sesión.
- Cualquier otro error → `throw`, para que TanStack Query lo refleje como
  `isError` en vez de esconderlo como "sin perfil".

**Onboarding sin navegación manual:** `useUpsertProfile` invalida la query
`["profile"]` en `onSuccess`. El root vuelve a evaluar `isAuthorized`, y si ya es
`true`, `Stack.Protected` cambia a `(app)` solo — no hace falta `router.replace`
en `onBoarding.tsx`.

## Decisiones técnicas (log)

### 2026-08-11

- **Auth Frontend:** Supabase JS SDK directo (no vía backend)
  - Razón: Reducir latencia, Supabase gestiona identidad
  - Impl: `@supabase/supabase-js` + `expo-secure-store` storage

- **NativeWind:** Tailwind para RN (no librerías UI)
  - Razón: Developer conoce Tailwind, componentes mínimos propios
  - Archivos: `Input.tsx`, `Button.tsx` + CSS base

- **HTTP separado:** Axios (data) vs Supabase SDK (auth)
  - Razón: Responsabilidades claras, TanStack Query cachea HTTP
  - Flujo: Supabase → token → Axios Bearer

- **Expo Router:** Grupos `(auth)` / `(app)`
  - Razón: Type-safe, deep links, condicional por estado
  - Lógica: `(auth)` redirige si sesión existe; `(app)` redirige si onboarding pendiente

- **Email confirmation obligatoria:** Supabase config
  - Razón: Security default
  - Flujo: signUp → verify-email → login exitoso

- **Onboarding post-login:** No parte signup
  - Razón: UX simple, datos opcionales tras confirmación email
  - Lógica: `onboardingCompleted: false` → redirige onboarding

- **Avatar:** Upload directo a Supabase Storage (no backend)
  - Razón: No sobrecargar backend, URL pública en Profile
  - RLS: Solo dueño accede a bucket

### 2026-09-17

- **OAuth:** Supabase Auth gestiona Google + Apple
  - Razón: No reinventar OAuth, deep link en Expo Router
  - Backend: Ya valida JWT

- **Testing:** Jest + React Native Testing Library
  - Razón: Unit tests hooks, validación, lógica (no E2E MVP)
  - Agregar: Paralelo a login/signup

### 2026-09-18

- **Bug corregido:** la app abría en `onBoarding` (o directo en `(app)`) en vez de
  `login`, incluso sin sesión real.
  - Causa raíz 1: `src/app/_layout.tsx` había perdido el guard `Stack.Protected`
    (dos `Stack.Screen` sin proteger). Como `(app)/index.tsx` mapea a `/` y
    `(auth)` no tiene `index.tsx`, la app siempre montaba `(app)` al arrancar,
    sin importar el estado de sesión.
  - Causa raíz 2: `(auth)/_layout.tsx` había dejado de renderizar `<Stack/>` y
    decidía a mano entre `<Login/>`/`<Onboarding/>` ignorando la ruta navegada
    (`signup`/`verify-email` quedaban inalcanzables), duplicando la lógica que
    ya vive en el gate raíz.
  - Causa raíz 3: `useProfile.fetchProfile` convertía **cualquier** error (401
    de token inválido, error de red, 500) en "perfil no existe", igual que un
    404 legítimo. Una sesión vieja en SecureStore/Keychain (de pruebas de OAuth
    en esta rama) hacía que un token inválido pareciera "sesión válida sin
    onboarding".
  - Decisión: puerta única en `src/app/_layout.tsx` con `Stack.Protected`
    (`isAuthorized = session && onboardingCompleted`); `(auth)/_layout.tsx`
    vuelve a ser un `<Stack/>` de archivos, con un único `Redirect` para el caso
    "hay sesión, falta onboarding"; `useProfile` solo trata 404 como "sin
    perfil" y fuerza `signOut()` en 401. Ver sección "Arquitectura de
    autenticación y enrutamiento" arriba para el detalle completo.
  - Bug secundario encontrado al aplicar el fix: el `Redirect` a `/onBoarding`
    dentro de `(auth)/_layout.tsx` se disparaba en cada render, incluso ya
    estando en esa pantalla → "Maximum update depth exceeded". Fix: excluir la
    ruta actual (`usePathname() !== "/onBoarding"`) de la condición del
    redirect.

---

## Estructura actual

`app/` vive dentro de `src/` (no en la raíz); `contexts/` y `lib/` sí están en la
raíz. Alias `@/*` → `./src/*` (`tsconfig.json`).

```
mobile-app/
├── src/
│   ├── app/
│   │   ├── _layout.tsx                # Root gate: Stack.Protected (auth)/(app) — ver
│   │   │                               # "Arquitectura de autenticación y enrutamiento"
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx            # <Stack/> + Redirect a onBoarding si hay sesión
│   │   │   ├── login.tsx              # ✅ email/password + OAuth
│   │   │   ├── signup.tsx             # ✅ email/password/confirmación + OAuth
│   │   │   ├── verify-email.tsx       # ✅
│   │   │   └── onBoarding.tsx         # ✅ (nota: B mayúscula en el nombre de archivo)
│   │   └── (app)/
│   │       ├── _layout.tsx            # <Stack/> plano (protección ya la hizo el root)
│   │       └── index.tsx              # Home + botón "Cerrar sesión" — ⏳ separar en profile.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── Input.tsx              # ✅
│   │       ├── Button.tsx             # ✅
│   │       └── Select.tsx             # ✅ (usado para género en onboarding)
│   ├── constants/
│   │   └── gender.const.ts            # ✅ GENDER_OPTIONS
│   ├── hooks/
│   │   ├── useProfile.ts              # ✅ distingue 404/401/otros errores
│   │   ├── useUpsertProfile.ts        # ✅
│   │   ├── useOAuth.ts                # ✅ handler compartido login/signup
│   │   └── __tests__/                 # ⏳ falta useProfile/useUpsertProfile/AuthContext
│   ├── squema/
│   │   ├── auth.schema.ts             # ✅ Zod login/signup
│   │   └── onboarding.schema.ts       # ✅ Zod onboarding
│   └── __tests__/
│       └── validation.test.ts         # ✅
├── contexts/
│   └── AuthContext.tsx                # ✅ signIn, signUp, signInWithOAuth, signOut
├── lib/
│   ├── supabase.ts                    # ✅ SecureStore adapter
│   ├── api.ts                         # ✅ Axios + interceptor Bearer
│   └── queryClient.ts                 # ✅
├── jest.config.js / jest.setup.js     # ✅
├── tsconfig.json                      # alias @/* → ./src/*
└── CLAUDE.md                          # ← Estás aquí
```

---

## Tareas priorizadas MVP

### Tarea 1: Login UI ✅ Implementado

- Email + password inputs
- Validación Zod + react-hook-form
- Error display (email no existe, password inválido)
- Loading state + disabled durante request
- Link a signup + "forgot password" (⏳ futuro)

**Definición hecha:** Archivo `(auth)/login.tsx`

### Tarea 2: Signup UI ✅ Implementado

- Email + password + password confirmation
- Validación Zod + react-hook-form
- Términos y condiciones (checkbox)
- Error handling (email existe, passwords no match)
- Link a login

**Definición hecha:** Archivo `(auth)/signup.tsx`

### Tarea 2b: OAuth UI (Google + Apple) ✅ Implementado (vía `useOAuth`, no `OAuthButton.tsx` separado)

- Botones "Sign in with Google" y "Sign in with Apple"
- `supabase.auth.signInWithOAuth({ provider: 'google'|'apple' })`
- Deep link handling en Expo Router
- Error handling (user cancelled, OAuth error)
- Device + simulator testing

**Componentes:** `OAuthButton.tsx` (reutilizable)

**Definición hecha:** Archivo `components/auth/OAuthButton.tsx`, deep link config en `app.json`

### Tarea 3: Logout UI

- Botón en perfil o home
- Confirmación modal
- `supabase.auth.signOut()`
- Limpiar SecureStore + TanStack Query cache
- Redirige a `(auth)/login`

**Definición hecha:** Pantalla `(app)/profile.tsx`

### Tarea 3b: Onboarding Refinado

**Decisión requerida: Definir qué campos son obligatorios/opcionales**

Opciones:

**Mínimo (MVP):**
- fullName (obligatorio)
- Resto opcional

**Estándar:**
- fullName (obligatorio)
- gender (obligatorio)
- country (obligatorio)
- phone (opcional)
- avatar (opcional)
- notificationsEnabled (default true)

**Máximo:**
- Todos obligatorios

Una vez decidido, agregar:
- Selector país (dropdown ISO 3166-1)
- Selector género (radio M/F/Other/Prefer not)
- Avatar picker (expo-image-picker + Supabase Storage)

**Definición hecha:** Formulario dinámico en `onboarding.tsx`

### Tarea 4: Jest Setup + Unit Tests

**Install:**
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native @react-native-async-storage/async-storage jest-mock-axios
```

**Config:** `jest.config.js` + `jest.setup.js`

**Tests a escribir:**

- `hooks/__tests__/useProfile.test.ts` — Happy path + error cases
- `hooks/__tests__/useUpsertProfile.test.ts` — Mutation success/error
- `hooks/__tests__/AuthContext.test.ts` — signIn/signUp/signOut flows
- `lib/__tests__/validation.test.ts` — Zod schemas (login, signup, onboarding)

**Definición hecha:** `npm test` script + test structure

---

## Próximos pasos

### Inmediatos (MVP Auth completo)
1. **Tarea 1 + 2:** Login/Signup UI con validación
2. **Tarea 2b:** OAuth buttons (Google + Apple)
3. **Tarea 3:** Logout + Perfil básico
4. **Tarea 3b:** Onboarding refinado (define contenido primero)
5. **Tarea 4:** Jest + unit tests hooks + validación

### Cuando wireframes (app) listos
- Pantalla lista de compromisos
- Pantalla crear/editar compromiso
- Pantalla detalles + occurrences

---

## Notas de implementación

- **SecureStore:** Cambiar AsyncStorage → `expo-secure-store` ASAP (sesión sensible)
- **Deep links:** Configurar OAuth callbacks en `app.json` + Expo Router handlers
- **Error handling:** Toasts/alerts para auth errors + network errors
- **Loading states:** Disable botones, show spinners durante requests
- **Offline:** TanStack Query cachea, considerar retry en Axios
- **Validación:** Zod en cliente + nunca confiar solo en cliente (backend valida siempre)
- **Testing:** Empezar con hooks (críticos), agregar E2E después MVP

