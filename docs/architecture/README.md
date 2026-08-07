# Arquitectura

AgendaFlow Web usa componentes standalone, rutas lazy y un application shell común. La Fase 3
incorpora sesión con Signals, interceptor Bearer y autorización sin NgRx.

## Capas principales

```text
AppComponent
├── estado de restauración
└── Router
    ├── /login (público)
    ├── AppShellComponent (autenticado)
    │   ├── TopbarComponent
    │   ├── SidebarComponent
    │   └── RouterOutlet de features
    └── 404 técnico (público)
```

`core/security` contiene modelos del contrato, sesión, storage, interceptor y guards.
`features/auth` contiene solo la página de login. Organizaciones y sucursales conservan modelos,
servicios HTTP y páginas propias.

Los servicios construyen URLs desde `API_CONFIG`; el interceptor se restringe a esa base. Las
páginas usan Signals locales para carga/error/guardado y Reactive Forms tipados. Los IDs se validan
como enteros positivos y se representan como `number`, con el límite de `Number.MAX_SAFE_INTEGER`.

Más detalle en [autenticación](authentication.md) y
[routing y guards](routing-and-guards.md).
