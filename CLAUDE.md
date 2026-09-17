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

## Estado actual (2026-09-17)

### ✅ Completado

- [x] Setup Expo SDK 54 + Expo Router (CNG)
- [x] Cliente Supabase (`lib/supabase.ts` + SecureStore adapter)
- [x] Cliente HTTP Axios (`lib/api.ts` + interceptor Bearer)
- [x] TanStack Query (`lib/queryClient.ts` + `QueryClientProvider`)
- [x] `AuthContext` (signIn, signUp, signOut, sesión persistente)
- [x] NativeWind + componentes base (`Input.tsx`, `Button.tsx`)
- [x] Rutas protegidas (auth/app grupos con condicional de sesión)
- [x] Onboarding de perfil (pantalla + integración `useUpsertProfile`)
- [x] Flujo verificación de email (`(auth)/verify-email.tsx`)
- [x] Hooks: `useProfile`, `useUpsertProfile`

### ⏳ Pendiente (Tareas priorizadas MVP)

- [ ] **Login UI** (`(auth)/login.tsx`) — email/password + validación Zod + react-hook-form
- [ ] **Signup UI** (`(auth)/signup.tsx`) — email/password/confirmación + validación
- [ ] **Google Sign-In** — Botón + deep link + `signInWithOAuth('google')`
- [ ] **Apple Sign-In** — Botón + deep link + `signInWithOAuth('apple')`
- [ ] **Logout completo** — Botón + confirmación + limpiar sesión
- [ ] **Onboarding refinado** — Definir contenido (qué campos, obligatorios vs opcionales)
- [ ] **Selector país** — Dropdown ISO 3166-1
- [ ] **Selector género** — Radio buttons M/F/Other/Prefer not to say
- [ ] **Avatar picker** — Supabase Storage bucket + upload + preview
- [ ] **Jest setup** — Unit tests para hooks, validación, AuthContext

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

---

## Estructura recomendada

```
mobile-app/
├── app/
│   ├── _layout.tsx                    # Stack + QueryClientProvider + AuthProvider
│   ├── (auth)/
│   │   ├── _layout.tsx                # Condicional sesión
│   │   ├── login.tsx                  # ⏳ Tarea 1
│   │   ├── signup.tsx                 # ⏳ Tarea 2
│   │   ├── verify-email.tsx           # ✅ Existente
│   │   └── onboarding.tsx             # ⏳ Tarea (refinada)
│   └── (app)/
│       ├── _layout.tsx                # Condicional onboarding
│       ├── index.tsx                  # Home (diseño pendiente)
│       └── profile.tsx                # ⏳ Mi perfil + logout (Tarea 3)
├── components/
│   ├── ui/
│   │   ├── Input.tsx                  # ✅
│   │   ├── Button.tsx                 # ✅
│   │   ├── Select.tsx                 # ⏳ Dropdowns país/género
│   │   └── Avatar.tsx                 # ⏳ Picker + upload
│   └── auth/
│       └── OAuthButton.tsx            # ⏳ Google + Apple (Tarea 2)
├── contexts/
│   └── AuthContext.tsx                # ✅
├── hooks/
│   ├── useProfile.ts                  # ✅
│   ├── useUpsertProfile.ts            # ✅
│   └── __tests__/
│       ├── useProfile.test.ts         # ⏳ Tarea 4
│       ├── useUpsertProfile.test.ts   # ⏳ Tarea 4
│       └── AuthContext.test.ts        # ⏳ Tarea 4
├── lib/
│   ├── supabase.ts                    # ✅
│   ├── api.ts                         # ✅
│   ├── validation.ts                  # ⏳ Zod schemas (login, signup, onboarding)
│   └── __tests__/
│       └── validation.test.ts         # ⏳ Tarea 4
├── jest.config.js                     # ⏳ Tarea 4
├── tailwind.config.js                 # ✅
├── global.css                         # ✅
├── babel.config.js                    # ✅
├── metro.config.js                    # ✅
└── CLAUDE.md                          # ← Estás aquí
```

---

## Tareas priorizadas MVP

### Tarea 1: Login UI

- Email + password inputs
- Validación Zod + react-hook-form
- Error display (email no existe, password inválido)
- Loading state + disabled durante request
- Link a signup + "forgot password" (⏳ futuro)

**Definición hecha:** Archivo `(auth)/login.tsx`

### Tarea 2: Signup UI

- Email + password + password confirmation
- Validación Zod + react-hook-form
- Términos y condiciones (checkbox)
- Error handling (email existe, passwords no match)
- Link a login

**Definición hecha:** Archivo `(auth)/signup.tsx`

### Tarea 2b: OAuth UI (Google + Apple)

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

