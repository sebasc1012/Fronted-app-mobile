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

- **Runtime:** React Native 0.86 + React 19.2 + Expo SDK 57 + CNG (`/ios` y `/android` en `.gitignore`); React Compiler y `typedRoutes` activados en `app.json`; Node fijado en 22 (`.nvmrc`)
- **Identidad app:** nombre "Fincho", dominio `finchoapp.com`, `bundleIdentifier`/`package` = `com.finchoapp.fincho` (`app.json`, decidido 2026-09-21; antes `com.anonymous.mobile-app`)
- **Lenguaje:** TypeScript ~6.0
- **Routing:** Expo Router (grupos `(auth)` / `(app)`, deep links)
- **Styling:** NativeWind 4 + Tailwind 3 (`global.css`, `tailwind.config.js`)
- **i18n:** i18next + react-i18next + `expo-localization` (en/es, `lib/i18n.ts`, `src/locales/`)
- **HTTP:** Axios + interceptor Bearer token
- **State + Cache:** TanStack Query (@tanstack/react-query)
- **Auth:** Supabase JS SDK (flujo **PKCE**, `flowType: 'pkce'`) + `expo-secure-store`
- **Storage:** Supabase Storage (avatars con RLS)
- **Validación:** Zod + react-hook-form
- **Testing:** Jest 30 + React Native Testing Library (`@react-native/jest-preset`)
- **Calidad:** ESLint (`expo lint`), `tsc --noEmit`, Husky + lint-staged (pre-commit = typecheck), CI en GitHub Actions (lint + typecheck + tests en PR/push a `main`/`develop`)
- **Build/Deploy:** EAS Build + EAS Submit → App Store Connect / Google Play Console

---

## Estado actual (2026-09-22)

### ✅ Completado

- [x] Setup Expo SDK 57 + Expo Router (CNG)
- [x] Cliente Supabase (`lib/supabase.ts` + SecureStore adapter)
- [x] Cliente HTTP Axios (`lib/api.ts` + interceptor Bearer)
- [x] TanStack Query (`lib/queryClient.ts` + `QueryClientProvider`)
- [x] `AuthContext` (signIn, signUp, signInWithOAuth, signOut, sesión persistente)
- [x] `useOAuth` (`src/hooks/useOAuth.ts`) — handler reutilizable de OAuth (loading/error) para login y signup
- [x] NativeWind + componentes base (`Input.tsx`, `Button.tsx`, `Select.tsx`)
- [x] **Login UI** (`src/app/(auth)/login.tsx`) — email/password + Zod + react-hook-form + botones OAuth
- [x] **Signup UI** (`src/app/(auth)/signup.tsx`) — email/password/confirmación + Zod + botones OAuth
- [x] **OAuth PKCE funcional (2026-09-22)** — `lib/auth/oauth.ts` (`signInWithProvider`): abre
      `WebBrowser.openAuthSessionAsync`, recibe `code` del callback único `mobileapp://auth/callback`,
      `exchangeCodeForSession`. Reemplaza el `google-oauth.ts` sin uso y el flujo implicit roto
      anterior. Probado en simulador iOS: **Google funciona end-to-end** (login, cancelado, sin
      internet, sesión persistida); **Facebook** redirige bien pero Meta rechaza por dominio de app
      no configurado (pendiente del lado del developer, ver log 2026-09-22); **Apple** muestra el
      error esperado `errors.providerDisabled` (proveedor aún no habilitado en Supabase — nativo
      queda para una fase aparte)
- [x] Gate de rutas centralizado en `src/app/_layout.tsx` (`Stack.Protected`, única fuente de verdad — ver
      sección "Arquitectura de autenticación y enrutamiento")
- [x] Onboarding de perfil (pantalla + integración `useUpsertProfile`, selector de género con `Select.tsx`, **avatar picker con `expo-image-picker` + upload a Supabase Storage bucket `avatars` ya implementado en `onBoarding.tsx`**; botón para cerrar sesión desde onboarding)
- [x] UI de auth con estilo glass: `AuthBackground`, `GlassPanel`, iconos `AppleIcon`/`GoogleIcon`/`FacebookIcon` (`components/ui/`)
- [x] Botones OAuth Google, Apple y **Facebook** en login y signup
- [x] **Limpieza del template Expo (2026-09-20)** — eliminados `animated-icon*`, `app-tabs`, `external-link`, `hint-row`, `themed-*`, `web-badge`, `ui/collapsible`, `hooks/use-color-scheme*`, `hooks/use-theme`, `constants/theme.ts`, `scripts/reset-project.js` (+ script npm), assets `expo-logo`, `logo-glow`, `expo-badge*`, `react-logo*`, `tutorial-web.png`, `tabIcons/`
- [x] Tooling: Husky + lint-staged, CI (`.github/workflows/ci.yml`), `.HUSKY.md`
- [x] Tests de componentes: `Button.test.tsx`, `Input.test.tsx` (+ `validation.test.ts`)
- [x] **i18n completo (2026-09-21)** — todas las pantallas y componentes (`login`, `signup`, `verify-email`, `onBoarding`, home, `Select`, géneros) usan `t()`. Claves en `src/locales/{en,es}.json`: `common.*`, `errors.*`, `auth.{common,login,signup,verifyEmail}.*`, `onboarding.*`, `gender.*`, `home.*`. Schemas Zod (`src/squema/auth.schema.ts`, `onboarding.schema.ts`) devuelven **claves i18n** como mensaje; la pantalla traduce con `t(errors.x.message)`. Errores de Supabase se mapean en `lib/authErrors.ts` (`invalid_credentials`, `email_not_confirmed`, `user_already_exists`, `over_email_send_rate_limit`) con fallback `errors.generic`; `AuthContext` devuelve la clave, no el mensaje crudo. Tests: `validation.test.ts` (schemas + paridad en/es)
- [x] Flujo verificación de email (`(auth)/verify-email.tsx`)
- [x] Hooks: `useProfile` (distingue 404 "sin perfil" de 401 "sesión inválida"), `useUpsertProfile`
- [x] **Bug corregido (2026-09-22): onboarding ahora redirige a `(app)`** — `useProfile` devolvía `{ profile }` en vez del perfil (ver log 2026-09-22)
- [x] **Tab bar nativa (2026-09-22): `NativeTabs` de Expo Router (`expo-router/unstable-native-tabs`) en `(app)/_layout.tsx` — en iOS 26 es Liquid Glass con las animaciones del sistema (píldora que se desliza, lente al presionar/arrastrar); visible en todas las rutas de `(app)`, nunca en login/onboarding. Tabs: Inicio (`index`, `house`), Biblioteca (`library`, `book`), Finanzas (`finances`, `wallet.bifold`), Configuración (`profile`, `gearshape`) con SF Symbols en iOS y Material en Android; activo en `#4F46E5` / `#818CF8` (dark). Reemplaza al `NavBar.tsx` propio con lucide (eliminado)**
- [x] Logout básico — botón "Cerrar sesión" en `(app)/index.tsx` (sin modal de confirmación aún)

### ⏳ Pendiente (Tareas priorizadas MVP)

- [ ] **Tab bar: definir íconos, páginas y funcionalidad** — decidir las secciones definitivas (hoy Inicio/Biblioteca/Finanzas/Configuración), reemplazar los placeholders `library.tsx` y `finances.tsx` con contenido real y revisar que el contenido con scroll no quede tapado por la barra
- [ ] **Logout con confirmación** — modal antes de `signOut()`
- [ ] **Pantalla "Mi Perfil"** (`(app)/profile.tsx`) — creada (2026-09-22) con título "Fincho", email y cerrar sesión (también siguen en `index.tsx` mientras tanto; se entra tocando el avatar del header de Home); falta definir contenido. Sin botón "volver" (headers ocultos): se vuelve con swipe desde el borde
- [x] **Header de Home (2026-09-22): "Fincho" a la izquierda + avatar circular a la derecha (`profile.avatarUrl` vía `useProfile`, fallback a inicial si no hay foto o falla la carga; tap → Mi Perfil); light/dark con clases `dark:` de NativeWind (sigue al sistema)**
- [ ] **Selector país** — actualmente `Input` de texto libre (código ISO manual); falta dropdown ISO 3166-1
- [ ] **Avatar post-onboarding** — falta preview/edición fuera del onboarding
- [ ] **Notificaciones en onboarding** — `notificationsEnabled` va con `true` por defecto en el form pero no hay control (Switch) en la UI
- [ ] **Facebook: configurar "Dominios de la app"** en Meta for Developers con `wzweyulubfehjednoaan.supabase.co` (el dominio del proyecto Supabase) — sin esto, Facebook rechaza el login con "El dominio de esta URL no está incluido en los dominios de la app"
- [ ] **Apple Sign-In nativo** — fuera de alcance de esta fase; usar `expo-apple-authentication` + `signInWithIdToken` en iOS cuando se retome (ver decisión 2026-09-21 en el log)
- [ ] **Jest** — faltan tests de `useProfile`, `useUpsertProfile` y `Select` (`AuthContext` y `useOAuth` ya cubiertos, 2026-09-21)

---

## Análisis de tareas (histórico — la mayoría ya resueltas, ver "Estado actual")

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
- **Guard simétrico (2026-09-22):** si NO hay `session` y la ruta actual SÍ es
  `/onBoarding`, hace `<Redirect href="/(auth)/login" />`. Cubre cerrar sesión
  desde dentro de onBoarding: limpiar `session` ahí no cambia `isAuthorized` en el
  root (ya era `false` por onboarding incompleto), así que `Stack.Protected` no
  remonta nada solo. Antes, `onBoarding.tsx` resolvía esto con un
  `router.replace("/(auth)/login")` manual que competía con este mismo componente
  y producía el mismo "Maximum update depth exceeded" en ciclos repetidos de
  login/logout — ver log 2026-09-22. `handleSignOut` en `onBoarding.tsx` ahora
  solo llama `signOut()`, sin navegación manual, igual que `(app)/index.tsx`.
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

### 2026-09-22

- **Bundle ID definitivo:** `com.finchoapp.fincho` (iOS `bundleIdentifier` y Android
  `package` en `app.json`), app "Fincho", dominio `finchoapp.com`. Antes
  `com.anonymous.mobile-app` (placeholder de Expo). Registro real en Apple Developer
  queda pendiente para cuando se implemente Sign in with Apple nativo (no bloquea
  Google/Facebook).
- **Bug corregido — OAuth nunca completaba sesión:** `AuthContext.signInWithOAuth`
  pedía la URL a Supabase (`skipBrowserRedirect: true`) pero nunca la abría, y
  `needsEmailConfirmation = !data.flowId` daba siempre `true` porque `flowId` solo
  existe con `flowType: 'pkce'` (el cliente usaba `implicit`, el default). Resultado:
  cualquier botón OAuth llevaba directo a `verify-email` sin abrir navegador ni
  enviar correo. Confirmado con logs reales en el simulador (`hasUrl: true`,
  `flowId: null`) antes de tocar código.
- **Decisión — PKCE + flujo único:** `lib/supabase.ts` pasa a `flowType: 'pkce'`.
  Nuevo `lib/auth/oauth.ts` (`signInWithProvider`) generaliza el patrón que ya
  existía sin usar en `google-oauth.ts` (WebBrowser + extraer código de la URL) a
  los tres proveedores, pero canjea con `exchangeCodeForSession(code)` en vez de
  `setSession(tokens)` — con PKCE nunca viajan tokens en la URL del deep link.
  Devuelve `{ status: 'success' | 'cancelled' | 'error' }` explícito.
  `AuthContext.signInWithOAuth` y `useOAuth` se simplifican: ya no navegan a
  `verify-email` en éxito (el guard de rutas reacciona solo al cambio de
  `session`, igual que el login por email); cancelado no muestra error.
  `google-oauth.ts` eliminado. Nuevo mapeo `provider_disabled` →
  `errors.providerDisabled` en `authErrors.ts` (útil para Apple/Facebook mientras
  no estén configurados en Supabase).
- **Bug corregido — "Maximum update depth exceeded" al cerrar sesión desde
  onBoarding:** ver "Arquitectura de autenticación y enrutamiento" arriba (guard
  simétrico). Encontrado probando el ciclo login→onBoarding→logout repetido.
- **Resultados de prueba en simulador (iPhone Air, dev build `expo run:ios`):**
  Google funciona completo (login, cancelado, sin internet, persistencia de
  sesión). Facebook redirige bien pero Meta bloquea por "Dominios de la app" sin
  configurar — falta agregar `wzweyulubfehjednoaan.supabase.co` en Meta for
  Developers (pendiente, developer). Apple muestra el error esperado
  (`provider_disabled`), consistente con que aún no está habilitado en Supabase.
  Onboarding no redirigía a `(app)` tras completarse — bug aparte, resuelto
  el mismo día (ver entrada siguiente).
- **Pantalla base "Mi Perfil":** `(app)/profile.tsx` con título "Fincho" (nombre
  de marca, sin i18n), email y cerrar sesión. Home (`index.tsx`) navega con
  `router.push("/profile")` (clave i18n `home.profile`) y, por decisión del
  developer, conserva email + cerrar sesión mientras se define el contenido del
  perfil. Nota: con `typedRoutes`, una ruta nueva no tipa hasta regenerar
  `.expo/types/router.d.ts` (basta con levantar Metro).
- **Header de Home + dark mode:** `index.tsx` muestra "Fincho" (`text-4xl`,
  `text-black dark:text-white`) a la izquierda y un avatar de 44pt a la derecha
  que navega a `/profile` (reemplaza al botón "Mi perfil"). La imagen sale de
  `profile.avatarUrl` (misma query `["profile"]`, sin request extra) con
  `expo-image`; si no hay URL o `onError`, muestra la inicial de `fullName` o
  del email. Safe area con `useSafeAreaInsets`. Dark/light: clases `dark:` de
  NativeWind (modo `media` por defecto = sigue al sistema,
  `userInterfaceStyle: automatic`); fondo `bg-white dark:bg-black`. Mismas
  clases aplicadas a `profile.tsx`. Verificado en simulador en ambos modos.
  Encontrado: el perfil de prueba local tenía
  `avatar_url = https://example.com/avatar.jpg` (dato ficticio) → motivó el
  fallback por `onError`.
- **Tab bar nativa (reemplaza NavBar propia):** primero se maquetó un
  `components/ui/NavBar.tsx` (lucide + `expo-blur`). Al pedir las animaciones de
  la tab bar de iOS 26 (píldora que se desliza, "lente" de vidrio al presionar y
  arrastrar), se decidió usar `NativeTabs` (`expo-router/unstable-native-tabs`)
  en vez de recrearlas con Reanimated: comportamiento idéntico al sistema y cero
  código de animación. Costos aceptados: cada ícono es una ruta (se crearon
  placeholders `library.tsx` y `finances.tsx`; `profile.tsx` pasa a ser el tab
  Configuración) y los íconos son SF Symbols (`house`, `book`, `wallet.bifold`,
  `gearshape`) + Material en Android, no lucide. `tintColor` `#4F46E5` /
  `#818CF8` (dark). Labels i18n `nav.{home,library,finances,settings}`. No
  requirió rebuild del dev build (usa `react-native-screens` ya enlazado).
  `NavBar.tsx` eliminado. El avatar del header (`router.push("/profile")`)
  cambia al tab Configuración. Verificado en simulador (iOS 26.5) light/dark.
  - Pendiente menor: `Button` no tiene padding horizontal ("Sign out" queda
    angosto cuando el padre usa `items-center`).
- **Bug corregido — onboarding no redirigía a `(app)`:** el POST funcionaba
  (backend guarda `onboardingCompleted: true` y `useUpsertProfile` invalida
  `["profile"]`), pero `useProfile` leía `data` como el perfil plano, pero el backend responde `{ profile }`
  (`res.json({ profile })`). Resultado: `profile.onboardingCompleted` siempre
  `undefined` → `isAuthorized` siempre `false` → `Stack.Protected` nunca montaba
  `(app)`. Mismo origen: usuarios con onboarding completo volvían a onboarding en
  cada login. Fix: `api.get<{ profile: Profile }>` + `return data.profile` en
  `src/hooks/useProfile.ts` (único consumidor: root layout). Destino tras
  onboarding = `(app)/index.tsx` (Home), sin navegación manual. Probado en
  simulador.
- **Entorno de build:** CocoaPods instalado (no venía en esta Mac), `.nvmrc` fijado
  en `22` (esta shell traía Node 20.14 por defecto vía `nvm`), `LANG=en_US.UTF-8`
  agregado a `~/.zshrc` (CocoaPods fallaba con `UnicodeNormalize.normalize` sin
  esto). `.claude/launch.json` con configuración `metro` para levantar el bundler
  del dev build.

### 2026-09-21

- **i18n completado:** todas las cadenas visibles pasan por `t()`. Mensajes de Zod =
  claves i18n (traducidas en la pantalla). Errores de auth: `lib/authErrors.ts` mapea
  4 códigos de Supabase y el resto cae en `errors.generic`; el detalle crudo va a
  `console.error`. Errores de onboarding: mensaje genérico traducido, detalle a consola.
- **Fix:** `useOAuth` ya no pasa `"<provider> account"` como email a `verify-email`;
  la pantalla muestra texto genérico si no hay email.
- **Tests:** `validation.test.ts` ahora prueba los schemas reales y que `en.json` y
  `es.json` tengan las mismas claves.

### 2026-09-20

- **Limpieza del template Expo:** se borró todo el código y assets huérfanos del
  template (ver "Estado actual"). Typecheck y tests pasan. Dependencias sin import
  directo (`expo-symbols`, `expo-device`, `@expo/ui`, `expo-status-bar`,
  `@testing-library/jest-native`, `@testing-library/user-event`) se **dejan instaladas**
  por decisión del desarrollador; las demás sin import son peers de `expo-router`,
  `expo-auth-session`, reanimated o RNTL y deben quedarse.

- **i18n:** `i18next` + `react-i18next` + `expo-localization`. `lib/i18n.ts` se importa
  como side-effect en `src/app/_layout.tsx`; idioma = `es` si el dispositivo es español,
  si no `en` (fallback `en`). Claves bajo `auth.login.*` por ahora; migración del resto
  de pantallas pendiente.
- **Versiones:** el proyecto está en Expo SDK 57 / RN 0.86 / TS 6 (este archivo decía
  SDK 54 / RN 0.76).
- **Avatar:** picker + upload a Storage ya vive en `onBoarding.tsx`
  (`${user.id}/avatar.jpg`, `upsert: true`, `getPublicUrl`). Usa
  `ImagePicker.MediaTypeOptions` (API en desuso en versiones recientes de expo-image-picker;
  revisar al tocar ese archivo).
- **OAuth:** coexisten dos implementaciones (`AuthContext.signInWithOAuth`, usada por
  `useOAuth`, y `lib/auth/google-oauth.ts`, sin uso). Facebook añadido como proveedor en UI.
- **Calidad:** Husky/lint-staged ejecutan `typecheck` en pre-commit; CI corre lint,
  typecheck y tests.

---

## Estructura actual

`app/` vive dentro de `src/` (no en la raíz); `contexts/`, `lib/` y `types/` sí están en la
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
│   │       ├── _layout.tsx            # NativeTabs (tab bar nativa); protección ya la hizo el root
│   │       ├── library.tsx            # placeholder (tab Biblioteca)
│   │       ├── finances.tsx           # placeholder (tab Finanzas)
│   │       ├── index.tsx              # Home: header (Fincho + avatar → perfil), bienvenida, email, cerrar sesión
│   │       └── profile.tsx            # Mi Perfil (base): título "Fincho", email, cerrar sesión — contenido por definir
│   ├── components/
│   │   └── ui/
│   │       ├── Input.tsx              # ✅
│   │       ├── Button.tsx             # ✅
│   │       ├── Select.tsx             # ✅ (usado para género en onboarding)
│   │       ├── AuthBackground.tsx     # ✅ fondo de pantallas auth
│   │       ├── GlassPanel.tsx         # ✅ contenedor glass (expo-blur)
│   │       ├── icons/                 # ✅ Apple, Google, Facebook
│   │       └── __tests__/             # ✅ Button.test, Input.test
│   ├── constants/
│   │   └── gender.const.ts            # ✅ GENDER_OPTIONS
│   ├── locales/                       # ✅ en.json / es.json
│   ├── hooks/
│   │   ├── useProfile.ts              # ✅ distingue 404/401/otros errores
│   │   ├── useUpsertProfile.ts        # ✅
│   │   ├── useOAuth.ts                # ✅ handler compartido login/signup
│   │   └── __tests__/useOAuth.test.ts # ✅
│   ├── squema/
│   │   ├── auth.schema.ts             # ✅ Zod login/signup (mensajes = claves i18n)
│   │   └── onboarding.schema.ts       # ✅ Zod onboarding
│   └── __tests__/
│       └── validation.test.ts         # ✅
├── contexts/
│   └── AuthContext.tsx                # ✅ signIn, signUp, signInWithOAuth, signOut
├── types/
│   └── genders.ts                 # ✅ GENDERS (enum compartido con schema Zod)
├── lib/
│   ├── i18n.ts                        # ✅ init i18next (import en root _layout)
│   ├── authErrors.ts                  # ✅ error.code Supabase → clave i18n
│   ├── auth/oauth.ts                  # ✅ signInWithProvider — PKCE, único flujo OAuth
│   ├── supabase.ts                    # ✅ SecureStore adapter, flowType: 'pkce'
│   ├── api.ts                         # ✅ Axios + interceptor Bearer
│   └── queryClient.ts                 # ✅
├── contexts/__tests__/AuthContext.test.tsx  # ✅
├── .github/workflows/ci.yml           # ✅ lint + typecheck + test
├── .husky/ + .lintstagedrc.json       # ✅ pre-commit: typecheck
├── .nvmrc                             # ✅ Node 22
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

### Tarea 2b: OAuth Google/Apple/Facebook ✅ Implementado (vía `useOAuth`, no `OAuthButton.tsx` separado)

- Botones "Continue with Google/Apple/Facebook" en login y signup
- `lib/auth/oauth.ts` (`signInWithProvider`) — PKCE completo: `signInWithOAuth` +
  `WebBrowser.openAuthSessionAsync` + `exchangeCodeForSession` (no `setSession` con
  tokens en la URL, como en el `google-oauth.ts` implicit ya eliminado)
- Deep link único `mobileapp://auth/callback`
- Error handling: cancelado (sin mensaje), error mapeado vía `authErrors.ts`
- Probado en simulador iOS (2026-09-22): Google end-to-end; Facebook y Apple
  pendientes de configuración externa (ver log 2026-09-22)

**Definición hecha:** `lib/auth/oauth.ts`, deep link config en `app.json`

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

