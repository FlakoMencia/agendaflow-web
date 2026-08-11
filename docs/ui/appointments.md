# Citas

El feature `appointments` consume exclusivamente los contratos reales del API principal. La agenda
envía filtros de fecha, sucursal, especialista, cliente y estado al servidor; los presets **Today**
y **Upcoming 30 days** solo completan esos mismos parámetros y nunca descargan el dataset completo.

## Lifecycle operativo

Las acciones disponibles siguen `AppointmentStatusPolicy` y los permisos de la sesión:

- `PENDING`: confirmar, reprogramar, cancelar y no-show cuando ya llegó la hora.
- `CONFIRMED`: check-in, reprogramar, cancelar y no-show cuando corresponde.
- `CHECKED_IN`: iniciar; no-show sigue disponible si el backend lo admite por hora.
- `IN_PROGRESS`: completar.
- `COMPLETED`, `CANCELLED`, `NO_SHOW` y `RESCHEDULED`: sin acciones mutantes.

Completar, no-show y cancelar requieren confirmación. Mientras existe una petición se bloquean
nuevos submits. Una transición inválida `409` conserva el error visible y vuelve a consultar
appointment e historial; `403` continúa bajo el manejo global de autorización.

El historial se presenta del evento más reciente al más antiguo con estado anterior, nuevo estado,
razón y timestamp.

## Reserva y notificaciones

Booking y reschedule consultan `/availability/slots`. Ante `409`, mantienen el contexto, limpian el
slot y refrescan disponibilidad. El éxito depende únicamente del API Spring. La web no llama al
Notification Service, no espera el envío eventual y nunca muestra “email sent”.

No se usa FullCalendar, drag-and-drop, WebSocket, SSE ni mocks en runtime.
