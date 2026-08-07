# AgendaFlow Web

Frontend Angular de AgendaFlow, una plataforma SaaS multiempresa para reservas y gestión de citas.
Este repositorio proporciona la experiencia web administrativa y consume exclusivamente la API
principal de AgendaFlow.

## Estado

**Fase 3 — Login, sesión y autorización.** Están implementados el inicio de sesión contra la API,
la restauración mediante `/auth/me`, el Bearer interceptor, los guards y la navegación basada en
permisos. Las pantallas funcionales actuales siguen limitadas a organizaciones y sucursales.

No hay refresh token, cookies, registro, recuperación de contraseña, selector de organización ni
administración de usuarios.

## Stack y requisitos

- Node.js 24.18.1 y npm 11.16.0.
- Angular/CLI 22.0.x, TypeScript strict, componentes standalone, Router, Reactive Forms, Signals y
  `HttpClient`.
- PrimeNG Community 22.0.0, `@primeuix/themes` 3.0.0, Aura personalizado y PrimeIcons 8.0.0.
- SCSS y Vitest mediante los builders oficiales de Angular.

Se recomienda NVM y la versión declarada en `.nvmrc`:

```bash
nvm install 24.18.1
nvm use 24.18.1
node --version
npm --version
npm install
```

`package-lock.json` debe permanecer versionado para instalaciones reproducibles.

## Desarrollo, pruebas y build

```bash
npm start
npm run test:ci
npm run build
```

La web se sirve en `http://localhost:4200`; el build se genera en `dist/agendaflow-web`. SSR, SSG
y prerender permanecen deshabilitados.

## API y login local

La configuración tipada de desarrollo apunta a `http://localhost:8080/api/v1`. Para ejecutar el
flujo completo:

1. inicia `agendaflow-api` en el puerto 8080 con CORS habilitado para `http://localhost:4200`;
2. prepara en el backend un usuario activo, una membresía activa y sus roles/permisos;
3. conoce el `organizationId` de esa membresía;
4. ejecuta `npm start` y abre `http://localhost:4200/login`.

El campo `organizationId` del login es temporal hasta que exista un selector de organizaciones. No
se incluyen credenciales ni datos mock en runtime.

## Sesión y seguridad

El navegador conserva únicamente el access token bajo una clave de `sessionStorage`. En una
recarga, la aplicación llama `GET /auth/me` y reconstruye usuario, organización activa, roles y
permisos desde el backend; el JWT no se decodifica como fuente de autorización.

El interceptor agrega `Authorization: Bearer` solo a URLs bajo la base de AgendaFlow API, nunca a
`/auth/login`, URLs externas ni al microservicio Quarkus. Un 401 limpia la sesión y vuelve a login
con una URL de retorno interna; un 403 dirige a `/access-denied`. El logout es local: elimina el
token y los Signals, pero el token emitido podría seguir siendo válido en el servidor hasta
expirar.

`sessionStorage` es accesible a JavaScript y, por tanto, depende de prevenir XSS; también está
aislado por pestaña, sobrevive recargas en esa pestaña y normalmente se elimina al cerrarla. Esta
fase no implementa cookies HttpOnly, revocación ni refresh token.

Los guards y el filtrado de navegación mejoran la UX, pero no son la barrera de seguridad. El
backend valida siempre JWT, organización activa, rol y permiso.

## Rutas

Públicas:

- `/login`
- wildcard 404 técnico

Autenticadas:

- `/dashboard`
- `/access-denied`
- `/organizations` y `/organizations/:organizationId` — `ORGANIZATION_VIEW`
- `/organizations/new` — rol `PLATFORM_ADMIN`
- `/organizations/:organizationId/edit` — `ORGANIZATION_UPDATE`
- `/organizations/:organizationId/branches` — `BRANCHES_VIEW`
- creación/edición de sucursales — `BRANCHES_MANAGE`

Los módulos técnicos futuros también se filtran por sus permisos de consulta. Un usuario normal ve
solo su organización activa; un `PLATFORM_ADMIN` conserva el listado paginado global.

## Estructura

```text
src/app/
├── core/
│   ├── config/       # API y preset visual
│   ├── http/         # errores, paginación y formularios
│   ├── layout/       # shell, topbar, sidebar, 403 y 404
│   └── security/     # sesión, modelos, storage, interceptor y guards
├── features/
│   ├── auth/         # login
│   ├── organizations/# listado, detalle, creación y edición
│   └── branches/     # listado y formularios anidados
├── shared/           # componentes visuales reutilizables
└── testing/          # fixtures disponibles únicamente para pruebas
```

Los IDs PostgreSQL `BIGINT`/Java `Long` se representan como `number` mientras estén dentro de
`Number.MAX_SAFE_INTEGER`; no se convierten en UUID.

## Sistema visual, accesibilidad y PrimeNG

AgendaFlow extiende Aura con teal/slate, superficies claras, contraste, foco visible y layouts
responsive. Login, shell, menús y errores usan controles con nombre accesible, landmarks y estados
que no dependen solo del color. No se usa `innerHTML` para datos de API.

El proyecto usa PrimeNG Community y compila sin claves. No debe guardarse una licencia en Git,
`.env` ni archivos de ambiente. Una futura licencia comercial legítima deberá proporcionarse solo
mediante configuración local ignorada, siguiendo la documentación oficial de PrimeNG.

Documentación adicional:

- [Flujo de autenticación](docs/architecture/authentication.md)
- [Routing y guards](docs/architecture/routing-and-guards.md)
- [Login local](docs/development/local-login.md)
- [UI de autenticación](docs/ui/authentication.md)

## Repositorios relacionados

- [`agendaflow-api`](../agendaflow-api/README.md) — backend principal.
- [`agendaflow-notification-service`](../agendaflow-notification-service/README.md) — microservicio
  de notificaciones; Angular no le envía tokens ni solicitudes directas.

## Aún no implementado

- Refresh token, cookies HttpOnly, revocación, MFA y autenticación social.
- Registro, recuperación de contraseña, invitaciones y selector de organización.
- Administración de usuarios, clientes, especialistas, servicios, citas y calendario.
- Dashboard funcional, NgRx, integración directa con Quarkus, Docker, Azure y CI/CD.
