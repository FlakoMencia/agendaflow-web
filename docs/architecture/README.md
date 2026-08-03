# Arquitectura

AgendaFlow Web utiliza componentes standalone, rutas lazy y un application shell común. La Fase 2
introduce el primer vertical slice funcional sin incorporar estado global ni autenticación.

## Flujo principal

```text
AppComponent
└── AppShellComponent
    ├── TopbarComponent
    ├── SidebarComponent
    └── PageContainerComponent
        └── RouterOutlet
            ├── organizations/pages
            └── branches/pages
```

El sidebar incluye `Organizations`; las sucursales se abren siempre desde su organización. La ruta
técnica `/branches` se conserva como placeholder, pero no permite operar una sucursal fuera de su
contexto padre.

## Features

`features/organizations` contiene:

- `models/organization.model.ts`: `Organization`, `OrganizationSummary`, requests y estados.
- `services/organizations-api.service.ts`: listado paginado, detalle, creación y actualización.
- `pages`: listado, detalle y formulario compartido para crear/editar.

`features/branches` contiene:

- `models/branch.model.ts`: respuesta y requests exactos del backend.
- `services/branches-api.service.ts`: operaciones siempre anidadas por `organizationId`.
- `pages`: listado por organización y formulario compartido para crear/editar.

El backend devuelve `OrganizationResponse` también en el listado; por eso
`OrganizationSummary` es un alias explícito de `Organization`, sin inventar un contrato adicional.
`PageResponse<T>` reproduce `content`, `page`, `size`, `totalElements`, `totalPages`, `first` y
`last`.

## HTTP, estado y errores

`provideHttpClient` habilita la infraestructura oficial. Cada servicio construye sus URLs desde
`API_CONFIG`; no existe cliente genérico, interceptor JWT ni uso de credenciales. Los errores se
normalizan en `core/http` y traducen códigos conocidos del backend a mensajes seguros.

Las páginas usan Signals locales para `loading`, datos, error y `saving`. Cada navegación dispara
una sola carga intencional; `saving` evita dobles envíos. No se utiliza NgRx, Signal Store externo,
BehaviorSubject global ni caché ficticia.

## Rutas

Las siete rutas funcionales bajo `/organizations` se cargan de forma diferida. `/` continúa
redirigiendo a `/dashboard`; los placeholders técnicos previos y el wildcard 404 permanecen dentro
del shell.

Los identificadores se validan como enteros positivos seguros antes de llamar a la API. Se modelan
como `number` por requisito de contrato, con la limitación documentada de
`Number.MAX_SAFE_INTEGER`.
