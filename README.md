# AgendaFlow Web

Frontend Angular de AgendaFlow, una plataforma SaaS multiempresa para reservas y gestión de citas.
Este repositorio proporciona la experiencia web administrativa y consume exclusivamente la API
principal de AgendaFlow.

## Estado

**Fase 4 — servicios, especialistas y disponibilidad.** Están implementados el catálogo de
servicios, categorías, asignaciones a sucursales, perfiles de especialistas, asignaciones de
sucursales y servicios, disponibilidad recurrente y schedule blocks. Se conservan el shell,
organizaciones, sucursales, autenticación JWT, sesión, guards, permisos y manejo de 401/403 de las
fases anteriores.

Todavía no existen citas, calendario de reservas, clientes, selector de organización, refresh token
ni administración de usuarios.

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

`package-lock.json` permanece versionado para instalaciones reproducibles. La Fase 4 no agrega
dependencias.

## Desarrollo, pruebas y build

```bash
npm start
npm run test:ci
npm run build
npm audit --omit=dev
```

La web se sirve en `http://localhost:4200`; el build se genera en `dist/agendaflow-web`. SSR, SSG
y prerender permanecen deshabilitados. Todos los features de negocio se cargan mediante rutas lazy.

## API y sesión local

La configuración tipada de desarrollo apunta a `http://localhost:8080/api/v1`. Para ejecutar el
flujo completo:

1. inicia `agendaflow-api` en el puerto 8080 con CORS habilitado para `http://localhost:4200`;
2. prepara un usuario, membresía y permisos activos en el backend;
3. inicia sesión con el `organizationId` de esa membresía;
4. ejecuta `npm start`.

El `organizationId` usado por servicios, especialistas y horarios proviene siempre de la sesión
activa. No existe un campo editable para cambiar el tenant y no hay datos mock en runtime.

El navegador conserva únicamente el access token en `sessionStorage`. El interceptor agrega
`Authorization: Bearer` solo a la API principal; un 401 limpia la sesión y un 403 dirige a
`/access-denied`. Guards y ocultamiento de acciones mejoran la UX, pero el backend valida siempre
JWT, tenant y permisos.

## Rutas de Fase 4

Servicios:

- `/services` y `/services/:serviceId` — `SERVICES_VIEW`.
- `/services/new` y `/services/:serviceId/edit` — `SERVICES_MANAGE`.
- `/services/categories` — lectura con `SERVICES_VIEW`, cambios con `SERVICES_MANAGE`.

Especialistas y horarios:

- `/specialists` y `/specialists/:specialistId` — `SPECIALISTS_VIEW`.
- `/specialists/new` y `/specialists/:specialistId/edit` — `SPECIALISTS_MANAGE`.
- `/specialists/:specialistId/availability` — `SCHEDULE_VIEW`; cambios con `SCHEDULE_MANAGE`.

Las rutas anteriores de login, dashboard, organizaciones, sucursales, acceso denegado y 404 siguen
disponibles.

## Estructura

```text
src/app/
├── core/                    # API, HTTP, shell, sesión, interceptor y guards
├── features/
│   ├── auth/                # login
│   ├── organizations/       # organizaciones
│   ├── branches/            # sucursales
│   ├── services/            # categorías, servicios y asignaciones a branches
│   └── specialists/         # perfiles, asignaciones, availability y blocks
├── shared/                  # componentes visuales reutilizables
└── testing/                 # fixtures y contratos solo para pruebas
```

Los IDs PostgreSQL `BIGINT`/Java `Long` se representan como `number` mientras permanezcan dentro de
`Number.MAX_SAFE_INTEGER`. Los valores monetarios son de presentación; no se implementa aritmética
financiera compleja en el frontend.

## UI, disponibilidad y errores

AgendaFlow extiende Aura con teal/slate, superficies claras, foco visible y layouts responsive. Las
tablas de escritorio se convierten en cards en móvil. Availability usa siete cards semanales; los
schedule blocks usan filas compactas. No se instala FullCalendar ni se dibujan slots o citas.

Los formularios realizan validaciones básicas y el backend sigue siendo fuente de verdad. Un
solapamiento conserva abierto el editor y muestra un mensaje específico. Los servicios compartidos
traducen errores conocidos 400/403/404/409 sin exponer mensajes internos.

Documentación adicional:

- [Arquitectura](docs/architecture/README.md)
- [Desarrollo](docs/development/README.md)
- [Servicios y especialistas](docs/ui/services-and-specialists.md)
- [Disponibilidad y bloqueos](docs/ui/availability.md)
- [Autenticación](docs/architecture/authentication.md)

## PrimeNG Community

El proyecto usa PrimeNG Community y compila sin claves guardadas en Git. No se incluyen componentes
PRO. Si en el futuro se adquiere una licencia comercial, debe proporcionarse solo mediante
configuración local ignorada y conforme a la documentación oficial de PrimeNG; nunca en `.env`,
archivos de ambiente o código fuente versionado.

## Repositorios relacionados

- [`agendaflow-api`](../agendaflow-api/README.md) — backend principal.
- [`agendaflow-notification-service`](../agendaflow-notification-service/README.md) — microservicio
  de notificaciones; Angular no le envía tokens ni solicitudes directas.

## Aún no implementado

- Appointments, calendario de citas, clientes, lista de espera, pagos y notificaciones.
- Cálculo de slots, drag-and-drop de agenda y FullCalendar.
- Refresh token, cookies HttpOnly, revocación, MFA, invitaciones y selector de organización.
- Administración de usuarios, NgRx, integración directa con Quarkus, Docker, Azure y CI/CD.
