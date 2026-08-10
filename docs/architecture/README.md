# Arquitectura

AgendaFlow Web usa componentes standalone, rutas lazy y un application shell común. La sesión,
el interceptor Bearer y los guards permanecen en `core/security`; no se usa un store global.

## Capas principales

```text
AppComponent
└── Router
    ├── /login (público)
    ├── AppShellComponent (autenticado)
    │   ├── organizaciones y sucursales
    │   ├── catálogo de servicios
    │   └── especialistas, disponibilidad y bloqueos
    └── 404 técnico (público)
```

Cada feature de Fase 4 contiene modelos de contrato, servicios HTTP y páginas standalone. Las
páginas usan Signals locales para `loading`, datos, `saving` y errores; los formularios son Reactive
Forms tipados. Los clientes construyen las URLs desde `API_CONFIG`, reciben siempre el
`organizationId` de la sesión activa y dejan la autenticación al interceptor.

Los IDs PostgreSQL `BIGINT` se representan como `number` dentro de `Number.MAX_SAFE_INTEGER`. Los
importes se muestran como números decimales sin realizar cálculos financieros en el navegador.

Más detalle en [autenticación](authentication.md), [routing y guards](routing-and-guards.md),
[servicios y especialistas](../ui/services-and-specialists.md) y
[disponibilidad](../ui/availability.md).
