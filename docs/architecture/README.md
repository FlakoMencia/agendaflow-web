# Arquitectura

AgendaFlow Web utiliza componentes standalone y rutas con carga diferida. `AppComponent` contiene
exclusivamente el `RouterOutlet` raíz; el router carga `AppShellComponent` y, dentro de él, la página
técnica correspondiente a cada módulo.

```text
AppComponent
└── AppShellComponent
    ├── TopbarComponent
    ├── SidebarComponent
    └── PageContainerComponent
        └── RouterOutlet (página lazy)
```

## Application shell

- `TopbarComponent` presenta la marca, el entorno técnico y el control accesible del menú móvil.
- `SidebarComponent` concentra la navegación principal y su estado activo.
- `PageContainerComponent` aporta el landmark principal y el destino del enlace para saltar la
  navegación.
- `AppShellComponent` coordina apertura, cierre, tecla Escape, overlay y restauración del foco en
  pantallas pequeñas.

En escritorio la navegación lateral permanece visible. En resoluciones menores al breakpoint
centralizado, se convierte en un panel superpuesto y devuelve el foco al botón que lo abrió al
cerrarse.

## Rutas y páginas

Las rutas `/dashboard`, `/appointments`, `/customers`, `/specialists`, `/services`, `/branches` y
`/settings` son hijas lazy del shell. `/` redirige a `/dashboard` y el wildcard presenta la página
404 dentro del mismo marco visual.

En esta fase las siete rutas usan `ModulePlaceholderPageComponent`: una composición técnica de
`PageHeaderComponent` y `EmptyStateComponent` cuyo contenido declara honestamente que cada módulo
se implementará en una fase posterior. No contiene datos de demostración ni lógica de negocio.

## Límites de carpetas

- `core`: configuración transversal, shell, layout e infraestructura futura.
- `features`: límites de los módulos funcionales, aún sin implementaciones de negocio.
- `shared`: componentes visuales reutilizables y sin conocimiento de dominio.

No existe `SharedModule`: los componentes se importan directamente para preservar el enfoque
standalone y facilitar el tree shaking. Tampoco existen servicios HTTP, guards, interceptores,
autenticación ni estado global.
