# Arquitectura

AgendaFlow Web usa Angular standalone, rutas lazy y un application shell común. Sesión, interceptor
Bearer y guards viven en `core`; no se usa un store global.

Los features de clientes y appointments tienen rutas lazy propias. Cada página operativa mantiene
estado con Signals locales y usa Reactive Forms tipados. Los servicios HTTP construyen URLs desde
`API_CONFIG` y reciben el `organizationId` de la sesión activa.

El lifecycle de citas separa responsabilidades:

- `AppointmentsApiService` conoce los endpoints organization-scoped.
- `AppointmentActionsComponent` deriva acciones visibles de status y permisos sin hacer HTTP.
- La página detalle coordina confirmaciones, llamadas, mensajes y refresh del historial.
- Spring API sigue siendo autoridad para tenant, permisos y transiciones.

Los estilos exclusivos de agenda, slots, history y acciones viven en componentes lazy. Esto redujo
el bundle inicial de 542.31 kB a 541.22 kB sin cambiar budgets.

Más detalle en [autenticación](authentication.md), [routing y guards](routing-and-guards.md),
[servicios y especialistas](../ui/services-and-specialists.md), [disponibilidad](../ui/availability.md),
[clientes](../ui/customers.md) y [citas](../ui/appointments.md).
