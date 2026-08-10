# Servicios y especialistas

## Rutas y permisos

| Área | Lectura | Escritura | Rutas |
| --- | --- | --- | --- |
| Catálogo | `SERVICES_VIEW` | `SERVICES_MANAGE` | `/services`, `/services/new`, `/services/:serviceId`, `/services/:serviceId/edit`, `/services/categories` |
| Especialistas | `SPECIALISTS_VIEW` | `SPECIALISTS_MANAGE` | `/specialists`, `/specialists/new`, `/specialists/:specialistId`, `/specialists/:specialistId/edit` |
| Horarios | `SCHEDULE_VIEW` | `SCHEDULE_MANAGE` | `/specialists/:specialistId/availability` |

Los guards protegen cada ruta y la interfaz oculta acciones que el usuario no puede ejecutar. El
backend continúa siendo la autoridad para tenant y permisos.

## Contratos y formularios

`ServiceCategoriesApiService`, `ServicesApiService`, `SpecialistsApiService` y
`AvailabilityApiService` reflejan los DTO de Fase 4. Las listas de servicios y especialistas usan
paginación del servidor. Categorías, formularios, asignaciones y errores 400/403/404/409 no usan
datos mock en runtime.

El detalle de un servicio muestra y actualiza su disponibilidad por sucursal. El contrato actual
lista servicios por sucursal, por lo que la pantalla consulta las sucursales de la organización
activa y cruza sus asignaciones. El detalle de especialista permite actualizar sucursal principal,
estado de asignación y, cuando aplica, duración o precio personalizado por servicio.

No existe borrado en estas pantallas porque los controllers inspeccionados no lo exponen.
