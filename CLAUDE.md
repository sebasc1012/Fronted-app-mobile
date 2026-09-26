@AGENTS.md

# Fincho — Mobile app (CLAUDE.md)

App iOS/Android de Fincho. Expo SDK 57 + React Native 0.86 + React 19.2 + Expo Router
(CNG, React Compiler, `typedRoutes`) + NativeWind 4 + TanStack Query + Axios + Supabase
Auth (PKCE, SecureStore) + i18next (en/es) + Zod + react-hook-form. TypeScript ~6.0.

**Fuente de verdad: la wiki** (`../App Mobile/wiki/`). Estado, decisiones e historial
están allí; ver el `CLAUDE.md` de la raíz para las reglas de documentación.

- Arquitectura (gate de rutas, auth, `useProfile`, OAuth, i18n): `../App Mobile/wiki/concepts/arquitectura-frontend.md`
- Backlog y Definición de Hecho: `../App Mobile/wiki/task/Historias de Usuario.md`
- Estado: `../App Mobile/wiki/concepts/estado-proyecto.md`
- PKCE: `../App Mobile/wiki/concepts/pkce-oauth.md`

## Comandos

```bash
npm start            # Metro (dev build)
npm run ios          # expo run:ios
npm run android      # expo run:android
npm run typecheck
npm run lint
npm test             # Jest + React Native Testing Library
```

Node 22 (`.nvmrc`). Pre-commit (Husky) corre typecheck; CI corre lint, typecheck y tests.

## Estructura

```
src/app/            # rutas: _layout.tsx (gate único), (auth)/, (app)/ (NativeTabs; account/ con Stack)
src/components/ui/  # Input, Button, Select, Avatar, ScreenHeader, GlassPanel, AuthBackground, icons/
src/hooks/          # useProfile, useUpsertProfile, useOAuth
src/squema/         # schemas Zod (mensajes = claves i18n)
src/locales/        # en.json, es.json
contexts/           # AuthContext
lib/                # supabase, api (Axios + Bearer), queryClient, i18n, authErrors, auth/oauth (PKCE)
```

Alias `@/*` → `./src/*`. Tests en `__tests__/` junto al código.

## Reglas críticas

- **Gate único:** solo `src/app/_layout.tsx` decide entre `(auth)` y `(app)` (`Stack.Protected`, `isAuthorized = session && onboardingCompleted`). Después de login, logout u onboarding **no navegar a mano** (`router.replace`): cambiar la sesión o invalidar `["profile"]` y dejar que el gate reaccione. Navegar a mano ya causó dos veces "Maximum update depth exceeded".
- El backend responde `{ profile }`; tipar las respuestas de Axios con su forma real.
- `useProfile`: 404 = sin perfil (onboarding); 401 = sesión inválida (forzar `signOut`); otros errores se lanzan.
- Supabase JS solo para auth; datos del backend con Axios + TanStack Query (sin `useState`/`useEffect` para fetching).
- OAuth solo por `lib/auth/oauth.ts` (PKCE, deep link `mobileapp://auth/callback`).
- Ningún texto hardcodeado: todo por `t()` con claves en `en.json` y `es.json` (misma estructura; hay test de paridad).
- Cada tab de `NativeTabs` es una ruta; íconos SF Symbols (iOS) / Material (Android).
- Con `typedRoutes`, una ruta nueva no tipa hasta levantar Metro.
- Toda historia cumple la Definición de Hecho del backlog (accesibilidad, i18n, claro/oscuro, tests).
