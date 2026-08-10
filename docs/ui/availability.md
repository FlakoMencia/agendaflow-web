# Disponibilidad y bloqueos

La ruta `/specialists/:specialistId/availability` representa siete días mediante cards responsive.
Cada regla muestra horario, sucursal, vigencia y estado. El editor inline permite crear o modificar
reglas con validación básica de `startTime < endTime` y rango de vigencia coherente.

Los schedule blocks se listan con paginación backend y permiten crear o editar tipo, intervalo,
sucursal opcional, motivo y estado. Los campos `datetime-local` se convierten a un ISO 8601 con
offset válido antes de enviar el DTO.

Angular no replica el algoritmo de solapamientos. `SCHEDULE_OVERLAP` y `RESOURCE_CONFLICT` se
traducen a mensajes específicos, accesibles, y el formulario permanece abierto para corregirlo.
Tampoco se calculan slots ni citas: disponibilidad y bloqueos son únicamente configuración de
agenda para una fase posterior.
