# Sistema visual

La Fase 2 conserva el preset Aura personalizado y la paleta teal/slate de AgendaFlow. Los nuevos
flujos reutilizan `PageHeaderComponent`, `EmptyStateComponent`, `StatusBadgeComponent` y el
application shell, sin crear un framework interno de formularios.

## Patrones funcionales

- Los listados presentan encabezado, acción primaria, carga, error con retry, vacío y paginación.
- PrimeNG Table se usa en escritorio; en móvil los mismos registros se muestran como tarjetas
  semánticas para mantener legibles datos y acciones sin scroll horizontal descontrolado.
- Los formularios agrupan identidad, contacto, ubicación y configuración en superficies claras,
  con labels visibles, campos obligatorios, errores asociados y submit bloqueado durante guardado.
- El detalle de organización separa identidad, contacto, ubicación, configuración regional y
  reglas principales de reservas; los valores ausentes se muestran como `Not provided`.
- Las sucursales muestran siempre la organización padre, breadcrumbs, dirección, estado activo y
  acción de edición.

## Estados y confirmaciones

Los mensajes PrimeNG informan errores y confirmaciones de creación/edición sin diálogos
intrusivos. Los estados usan texto e icono además de color. `StatusBadgeComponent` contempla los
estados de organización `active`, `pending`, `suspended`, `inactive` y los estados ya disponibles
para fases posteriores.

## Responsive y accesibilidad

Se mantienen foco visible, enlace para saltar navegación, landmarks, jerarquía de encabezados,
controles con nombre accesible y operación mediante teclado. En pantallas pequeñas, las acciones
principales ocupan el ancho disponible y los grupos de campos pasan a una sola columna. Las
transiciones respetan `prefers-reduced-motion`.

Los estilos se apoyan en clases propias y tokens; no usan `::ng-deep`, selectores internos frágiles
de PrimeNG, componentes PRO, gradientes fuertes ni animaciones decorativas.
