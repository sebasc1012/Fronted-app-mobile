# Finanzas al Día — Contexto de la aplicación móvil

## Propósito del producto

**Finanzas al Día** ayuda a organizar obligaciones financieras recurrentes. El MVP
permitirá registrar pagos mensuales, saber cuándo vencen, recibir recordatorios y
marcarlos como realizados.

Apple y Google se usarán exclusivamente para **inicio de sesión social**. Esta app no
procesará pagos mediante Apple Pay o Google Pay durante el MVP.

## MVP definido

1. Registro e inicio de sesión con email/contraseña, Google y Apple.
2. Onboarding y perfil básico.
3. Crear, editar, archivar y consultar obligaciones recurrentes.
4. Ver próximos vencimientos y pagos pendientes.
5. Recibir recordatorios y registrar una obligación como pagada.

No pertenecen al MVP las transferencias de dinero, pasarelas de pago, sincronización
bancaria, inversiones, créditos ni analítica financiera avanzada.

## Stack técnico

- React Native + Expo 57 + Expo Router + TypeScript.
- Supabase JS + Expo SecureStore para identidad y sesión.
- Axios + TanStack Query para comunicación y caché remota.
- React Hook Form + Zod para formularios y validación.
- NativeWind para estilos.
- Backend Node.js + Express + Prisma/PostgreSQL en el repositorio hermano.

## Principios de implementación

- Aplicar SOLID y Clean Code: componentes pequeños, hooks con una responsabilidad y
  lógica de negocio fuera de las pantallas.
- Organizar el código por módulos de producto: `auth`, `profile`, `obligations` y
  `reminders`.
- Usar Expo Router para separar rutas públicas, onboarding y rutas protegidas.
- Mantener secretos fuera de la app; solo claves publicables usan `EXPO_PUBLIC_`.
- El estado de sesión vive en `AuthContext`; los datos del servidor se gestionan con
  hooks de TanStack Query.

## Autenticación

El flujo actual usa email y contraseña con Supabase. La sesión se persiste en
SecureStore, y Axios añade el Bearer token hacia el backend.

El siguiente alcance es integrar Google Sign-In (OAuth de Supabase) y Sign in with
Apple. Ambos deben compartir sesión, logout, errores, carga y guardas de ruta. No
usar SDKs o APIs de Apple Pay/Google Pay.

## Estado técnico actual

- [x] Cliente Supabase con persistencia en SecureStore.
- [x] Login, registro, confirmación de correo y logout con email/contraseña.
- [x] Envío del `access_token` al backend mediante Axios.
- [x] Guardas iniciales de rutas autenticadas y de autenticación.
- [ ] Contrato de perfil compatible con backend.
- [ ] Finalización persistente de onboarding.
- [ ] Inicio de sesión con Google y Apple.
- [ ] Módulos de obligaciones financieras y recordatorios.
- [ ] Pruebas automatizadas de auth, navegación y datos.

## Limitaciones conocidas

- El backend devuelve `{ profile: ... }`, mientras `useProfile` espera un perfil
  directo; la navegación según onboarding no es fiable hasta resolverlo.
- La app no puede marcar `onboardingCompleted`; terminar u omitir onboarding no tiene
  una transición persistida.
- No existe un manejo centralizado de respuestas `401` para limpiar sesión y volver
  a login.

## Próximo orden de trabajo

1. Unificar contrato de perfil y completar onboarding.
2. Implementar Google Sign-In y Sign in with Apple de extremo a extremo.
3. Diseñar entidades y pantallas de obligaciones financieras.
4. Definir estrategia de recordatorios y notificaciones.
5. Añadir cobertura de pruebas y actualizar este archivo tras cada hito.
