# AgendaFlow Web

Frontend Angular de AgendaFlow, una plataforma SaaS multiempresa para reservas y gestión de citas.
Este repositorio ofrece la experiencia web de administración y consume la API principal de
AgendaFlow.

## Estado

**Fase 2 — Organizaciones y sucursales.** El primer módulo funcional permite listar, crear,
consultar y editar organizaciones, además de listar, crear y editar sus sucursales. La aplicación
mantiene el application shell responsive de la fase anterior y todavía no implementa
autenticación.

## Stack

- Node.js 24.18.1 y npm 11.16.0.
- Angular y Angular CLI 22.0.x, TypeScript administrado por Angular, strict mode y componentes
  standalone.
- Angular Router, Reactive Forms, Signals y `HttpClient` oficiales.
- PrimeNG Community 22.0.0, `@primeuix/themes` 3.0.0, preset Aura y PrimeIcons 8.0.0.
- SCSS y Vitest mediante los builders oficiales de Angular 22.

## Requisitos e instalación

Se requieren exactamente Node.js 24.18.1 y npm 11.16.0. Se recomienda NVM; `.nvmrc` contiene la
versión del proyecto.

```bash
nvm install 24.18.1
nvm use 24.18.1
node --version
npm --version
npm install
```

`package-lock.json` se conserva para instalaciones reproducibles.

## Desarrollo, pruebas y build

```bash
npm start
npm run test:ci
npm run build
```

La aplicación se sirve en `http://localhost:4200`. El build de producción se genera en `dist/`;
SSR, SSG y prerender permanecen deshabilitados.

## Integración con AgendaFlow API

La URL de desarrollo es `http://localhost:8080/api/v1` y se proporciona mediante el token tipado
`API_CONFIG`. Para trabajar localmente, inicia primero `agendaflow-api` en el puerto 8080 y luego
ejecuta `npm start`. La API debe permitir el origen `http://localhost:4200`; Angular no modifica ni
elude CORS.

`OrganizationsApiService` consume los cuatro endpoints de organizaciones y `BranchesApiService`
consume los cuatro endpoints anidados bajo `/organizations/{organizationId}/branches`. Toda
operación de sucursal exige `organizationId`; no existe una llamada basada únicamente en
`branchId`.

Los IDs PostgreSQL `BIGINT`/Java `Long` se representan como `number` mientras permanezcan dentro
del rango entero seguro de JavaScript (`Number.MAX_SAFE_INTEGER`). No se convierten a UUID.

## Rutas funcionales

- `/organizations`
- `/organizations/new`
- `/organizations/:organizationId`
- `/organizations/:organizationId/edit`
- `/organizations/:organizationId/branches`
- `/organizations/:organizationId/branches/new`
- `/organizations/:organizationId/branches/:branchId/edit`

Las rutas técnicas anteriores (`/dashboard`, `/appointments`, `/customers`, `/specialists`,
`/services`, `/branches` y `/settings`) y la página 404 siguen disponibles. Los módulos aún no
implementados continúan mostrando placeholders honestos, sin datos simulados.

## Organización del módulo

```text
src/app/
├── core/
│   ├── config/       # URL tipada de API y preset visual
│   ├── http/         # paginación, errores y validación compartida
│   └── layout/       # application shell
├── features/
│   ├── organizations/# modelos, servicio y páginas de organizaciones
│   └── branches/     # modelos, servicio y páginas anidadas de sucursales
└── shared/           # PageHeader, EmptyState y StatusBadge
```

Los listados mantienen Signals explícitas para `loading`, datos y error. Los formularios usan
Reactive Forms tipados y un estado `saving` que impide dobles envíos. Los errores `400`, `404`,
`409`, de red e inesperados se transforman en mensajes seguros; no se presentan HTML, JSON crudo,
stack traces ni detalles internos.

## Sistema visual y accesibilidad

El tema AgendaFlow extiende Aura con teal, slate, superficies claras y foco visible. Los listados
usan PrimeNG Table en escritorio y tarjetas equivalentes en móvil para evitar desplazamiento
horizontal descontrolado. Formularios, breadcrumbs, estados, mensajes y acciones conservan
landmarks, labels, jerarquía de encabezados, navegación por teclado y `prefers-reduced-motion`.

Más detalle en [arquitectura](docs/architecture/README.md),
[desarrollo](docs/development/README.md) y [sistema visual](docs/ui/README.md).

## PrimeNG Community y licencia

El proyecto usa la edición Community y compila sin claves. No debe guardarse ninguna licencia en
Git, `.env` ni archivos de ambiente. Si en el futuro se adopta una edición Commercial/LTS, la
credencial legítima deberá proporcionarse mediante configuración local ignorada y siguiendo la
[documentación oficial de PrimeNG](https://primeng.org/lts).

## Repositorios relacionados

- [`agendaflow-api`](../agendaflow-api/README.md) — backend principal.
- [`agendaflow-notification-service`](../agendaflow-notification-service/README.md) — microservicio
  de notificaciones futuro.

## Aún no implementado

- Login, JWT, guards, interceptor de autenticación, roles y permisos.
- Clientes, especialistas, catálogo de servicios, citas y calendario.
- Dashboard funcional, estado global, NgRx o integraciones de notificación.
- Eliminación de organizaciones o sucursales.
- SSR, PWA, Docker, despliegue y CI/CD.
