# AgendaFlow Web

Frontend de AgendaFlow, una plataforma SaaS multiempresa para reservas y gestión de citas. Este
repositorio será responsable de la experiencia web de administradores, gerentes, recepcionistas,
especialistas y clientes.

## Estado

**Fase 1 — Sistema visual y application shell.** El workspace dispone de navegación responsive,
rutas técnicas lazy, componentes visuales compartidos y una base accesible. Los módulos de negocio
todavía no están implementados.

## Stack

- Node.js 24.18.1 y npm 11.16.0.
- Angular y Angular CLI 22.0.x, con TypeScript administrado por Angular.
- Aplicación standalone, Angular Router, strict mode y SCSS.
- PrimeNG Community 22.0.0, `@primeuix/themes` 3.0.0 y PrimeIcons 8.0.0.
- Vitest mediante el builder oficial de pruebas de Angular 22.

## Requisitos e instalación

Se requieren exactamente Node.js 24.18.1 y npm 11.16.0. Se recomienda un administrador de
versiones como NVM; `.nvmrc` permite seleccionar la versión del proyecto:

```bash
nvm install 24.18.1
nvm use 24.18.1
node --version
npm --version
npm install
```

`package-lock.json` debe conservarse para instalaciones reproducibles.

## Desarrollo, pruebas y build

```bash
npm start
npm test
npm run test:ci
npm run build
```

`npm start` sirve la aplicación en `http://localhost:4200`. `test:ci` ejecuta las pruebas una sola
vez con `ng test --watch=false`; el build de producción se genera en `dist/`. SSR, SSG y prerender
permanecen deshabilitados.

## Rutas

- `/` redirige a `/dashboard`.
- `/dashboard`, `/appointments`, `/customers`, `/specialists`, `/services`, `/branches` y
  `/settings` muestran páginas técnicas dentro del application shell.
- Cualquier ruta desconocida muestra la página 404.

Estas páginas no contienen métricas, tablas ni datos ficticios; cada una identifica explícitamente
el módulo como trabajo de una fase posterior.

## Configuración de API

La URL tipada de desarrollo es `http://localhost:8080/api/v1` y se define mediante un
`InjectionToken` en `src/app/core/config/api.config.ts`. Aún no existen servicios HTTP ni llamadas
reales. En fases posteriores, las configuraciones de build proporcionarán valores distintos al
mismo token sin incorporar una librería para leer `.env`.

## Organización

```text
src/app/
├── core/       # Configuración, application shell e infraestructura transversal
├── features/   # Límites de funcionalidades futuras, todavía sin lógica de negocio
└── shared/     # PageHeader, EmptyState y StatusBadge reutilizables
```

El shell standalone se compone de topbar, sidebar y contenedor principal. Las páginas se cargan de
forma diferida desde el router y los componentes se importan directamente, sin `SharedModule`.

## Sistema visual y accesibilidad

`AgendaFlowPreset` extiende Aura con design tokens de PrimeNG. La paleta usa teal `#0F766E` y
`#115E59`, acento `#0284C7`, fondo `#F8FAFC`, superficie blanca, borde `#E2E8F0` y texto
`#1E293B`. Los tokens SCSS centralizan espaciado, radios, sombras, dimensiones, transiciones, foco y
breakpoint.

El diseño combina Grid y Flexbox, tipografía del sistema, superficies sobrias y navegación lateral
responsive. Incluye enlace para saltar navegación, landmarks, foco visible, controles con nombre
accesible, operación por teclado y respeto a `prefers-reduced-motion`.

Más detalle en [arquitectura](docs/architecture/README.md) y [sistema visual](docs/ui/README.md).

## PrimeNG Community y licencia

El proyecto usa `primeng@22.0.0` Community y compila sin clave almacenada. No debe crearse una
licencia ficticia ni guardarse una clave en `environment.ts`, `.env` o Git. Si en el futuro se
adopta una edición Commercial/LTS, la credencial obtenida legítimamente se proporcionará mediante
configuración local ignorada y siguiendo la
[documentación oficial de PrimeNG](https://primeng.org/lts). El bootstrap actual no ejecuta esa
verificación.

## Documentación y repositorios relacionados

- [Arquitectura](docs/architecture/README.md)
- [Desarrollo](docs/development/README.md)
- [Interfaz](docs/ui/README.md)
- [`agendaflow-api`](../agendaflow-api/README.md) — backend principal.
- [`agendaflow-notification-service`](../agendaflow-notification-service/README.md) — servicio de
  notificaciones futuro.

Los enlaces a repositorios hermanos son referencias; este proyecto no los modifica ni depende de
su ejecución.

## Aún no implementado

- Login, JWT, guards, interceptores, roles y autorización.
- Organizaciones, sucursales, especialistas, servicios, clientes y citas.
- Calendario, dashboard funcional, formularios y CRUD.
- Integración HTTP, estado global y notificaciones.
- SSR, PWA, contenedores, despliegue y automatización CI/CD.
