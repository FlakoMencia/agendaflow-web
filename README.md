# AgendaFlow Web

Frontend web de AgendaFlow, una plataforma SaaS multiempresa orientada a reservas y gestión de
citas. Este repositorio será responsable de la experiencia de administradores, gerentes,
recepcionistas, especialistas y clientes; actualmente contiene solo el bootstrap técnico y visual.

## Estado

**Fase 0 — Bootstrap técnico y visual.** El workspace establece compilación, routing, pruebas,
configuración tipada y un sistema visual inicial. No implementa todavía procesos de negocio.

## Stack

- Node.js 24.18.1 y npm 11.16.0.
- Angular y Angular CLI 22.0.x, TypeScript administrado por Angular.
- Aplicación standalone, Angular Router, strict mode y SCSS.
- PrimeNG Community 22.0.0, `@primeuix/themes` 3.0.0 y PrimeIcons 8.0.0.
- Vitest mediante el builder oficial de pruebas de Angular 22.

## Requisitos e instalación

Se requieren exactamente Node.js 24.18.1 y npm 11.16.0. Se recomienda un administrador de
versiones como NVM; el archivo `.nvmrc` permite seleccionar la versión del proyecto:

```bash
nvm install 24.18.1
nvm use 24.18.1
node --version
npm --version
npm install
```

`package-lock.json` forma parte del repositorio y debe conservarse para instalaciones
reproducibles.

## Desarrollo, pruebas y build

```bash
npm start
npm test
npm run test:ci
npm run build
```

`npm start` expone por defecto la aplicación en `http://localhost:4200`. `test:ci` ejecuta las
pruebas una sola vez con `ng test --watch=false`; el build de producción se genera en `dist/`.
SSR, SSG y prerender están deshabilitados.

## Rutas actuales

- `/`: página técnica de bootstrap.
- `**`: página accesible de error 404.

No existen rutas funcionales de autenticación, agenda, clientes u organizaciones.

## Configuración de API

La URL tipada de desarrollo es `http://localhost:8080/api/v1` y está definida mediante un
`InjectionToken` en `src/app/core/config/api.config.ts`. Todavía no hay servicios HTTP ni llamadas
reales. En fases posteriores, cada configuración de build proporcionará un valor distinto al mismo
token; no se requiere una librería para leer `.env`.

## Organización

```text
src/app/
├── core/       # Configuración, infraestructura transversal, layout y seguridad futura
├── features/   # Límites de funcionalidades futuras, actualmente vacíos
└── shared/     # Elementos reutilizables futuros, actualmente vacíos
```

Solo existen `AppComponent`, `BootstrapPageComponent` y `NotFoundPageComponent`. Las páginas se
cargan de forma diferida desde el router standalone.

## Estrategia visual y accesibilidad

El preset `AgendaFlowPreset` extiende Aura con design tokens de PrimeNG. La paleta utiliza teal
`#0F766E`/`#115E59`, acento `#0284C7`, fondo `#F8FAFC`, superficie blanca, bordes `#E2E8F0` y texto
Slate. El layout emplea Grid y Flexbox, fuentes del sistema, sombras discretas, foco visible,
landmarks semánticos y adaptación a `prefers-reduced-motion`.

Los componentes PrimeNG se importan individualmente para favorecer tree shaking. No se usan
selectores internos frágiles ni componentes PRO.

## PrimeNG Community y licencias

Este proyecto usa el paquete Community estable `primeng@22.0.0` y no necesita ni contiene una
clave. No debe crearse una licencia ficticia ni guardarse una clave en `environment.ts`, `.env` o
Git. Si en el futuro se adopta una edición Commercial/LTS, la clave y el pass key obtenidos en
PrimeStore deberán verificarse antes del bootstrap siguiendo la
[documentación oficial de PrimeNG](https://primeng.org/lts). Su aprovisionamiento se resolverá
mediante configuración local ignorada, sin literales versionados. El bootstrap actual no ejecuta
esa verificación y compila sin credenciales.

## Documentación y repositorios relacionados

- [Arquitectura](docs/architecture/README.md)
- [Desarrollo](docs/development/README.md)
- [Interfaz](docs/ui/README.md)
- [`agendaflow-api`](../agendaflow-api/README.md) — backend principal.
- [`agendaflow-notification-service`](../agendaflow-notification-service/README.md) — servicio de
  notificaciones futuro.

Los enlaces a repositorios hermanos son referencias de integración; este bootstrap no los modifica
ni depende de su ejecución.

## Aún no implementado

- Login, JWT, guards, interceptores y roles.
- Organizaciones, sucursales, especialistas, servicios, clientes y citas.
- Calendario, dashboard funcional, formularios y CRUD.
- Integración HTTP, estado global y notificaciones.
- SSR, PWA, contenedores, despliegue y automatización CI/CD.
