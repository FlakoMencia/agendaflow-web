# Sistema visual

La interfaz extiende el preset Aura mediante design tokens de PrimeNG y SCSS propio para la
composición. Busca una experiencia profesional, serena y legible durante jornadas prolongadas,
sin depender de selectores internos de componentes ni de elementos PRO.

## Paleta

| Uso | Valor |
| --- | --- |
| Primary 600 / 700 / 100 | `#0F766E` / `#115E59` / `#CCFBF1` |
| Accent | `#0284C7` |
| Background / Surface | `#F8FAFC` / `#FFFFFF` |
| Border | `#E2E8F0` |
| Text / Text muted | `#1E293B` / `#64748B` |
| Success / Warning / Danger | `#15803D` / `#B45309` / `#B91C1C` |

`src/styles/_tokens.scss` centraliza color, escala de espaciado, radios, sombras, ancho máximo de
página, dimensiones de topbar/sidebar, transiciones, anillo de foco y breakpoint. El layout usa
Grid y Flexbox; `styles.scss` reúne reset, tipografía, utilidades y composición.

## Componentes compartidos

- `PageHeaderComponent`: título, descripción opcional, breadcrumbs y área proyectable de acciones.
- `EmptyStateComponent`: estado vacío accesible con icono, explicación y acción opcional.
- `StatusBadgeComponent`: representa `active`, `inactive`, `pending`, `confirmed` y `cancelled` con
  texto, icono y color, de modo que el significado nunca depende solo del color.

Los componentes PrimeNG se importan individualmente. No se utiliza `::ng-deep`, selectores internos
frágiles, gradientes intensos ni animaciones decorativas excesivas.

## Responsive y accesibilidad

El shell mantiene el sidebar fijo en escritorio y lo transforma en drawer con overlay en móvil y
tablet. El botón de menú informa `aria-expanded`; el primer enlace recibe foco al abrir y el botón
recupera el foco al cerrar. Escape y el overlay también cierran el panel.

La aplicación incluye enlace para saltar navegación, landmarks semánticos, jerarquía de encabezados,
estado activo identificable, foco visible, controles con nombre accesible y navegación por teclado.
Las transiciones se desactivan cuando el sistema indica `prefers-reduced-motion: reduce`.
