# Autenticación y sesión

## Flujo

1. `/login` envía `email`, `password` y el `organizationId` temporal a
   `POST /api/v1/auth/login`.
2. La respuesta aporta access token, membresía, usuario, organización activa, roles y permisos.
3. Solo el access token se conserva en `sessionStorage`; el resto permanece en Signals en memoria.
4. En una recarga, `AuthSessionService` busca el token y consulta `GET /api/v1/auth/me`.
5. `/auth/me` reconstruye la sesión desde el backend. El JWT no se usa como fuente de verdad en el
   navegador.

Los estados explícitos son `initial`, `authenticating`, `authenticated` y `unauthenticated`. La
restauración tiene un límite de tiempo para evitar un bloqueo indefinido.

## Interceptor

El interceptor funcional agrega Bearer solo cuando la URL pertenece a la base configurada de
AgendaFlow API. Excluye login y cualquier host o puerto externo, incluido Quarkus. Conserva los
headers existentes y no reintenta credenciales.

Ante 401 limpia token y sesión, y navega a login con una URL de retorno local validada. Ante 403
navega a `/access-denied`. Los mensajes visibles nunca exponen el JSON o stack trace del backend.

## Almacenamiento y logout

`sessionStorage` es por pestaña y sobrevive recargas de esa pestaña. Al ser accesible desde
JavaScript, requiere una política estricta contra XSS; no sustituye a una futura estrategia con
cookies HttpOnly. No se guardan password, formularios, roles, permisos, secretos ni datos de
organización.

El logout es exclusivamente local porque no existe endpoint de revocación: borra storage y Signals
y navega a login. El token podría conservar validez en el backend hasta su expiración.

No existen refresh token, cookies, revocación, MFA, login social ni criptografía propia.
