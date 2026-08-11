# Clientes

El feature `customers` refleja el contrato HTTP de Fase 5: listado paginado, alta, consulta y
edición dentro de la organización activa. Nombre y apellido son obligatorios; email y teléfono son
opcionales. Los formularios son Reactive Forms tipados y los estados de carga, error y datos usan
Signals locales.

La tabla ofrece una vista compacta en escritorio y cards en móvil. El detalle muestra contacto,
dirección, consentimientos y notas internas, y enlaza a la agenda filtrada por cliente. Las acciones
se ocultan según `CUSTOMERS_VIEW`, `CUSTOMERS_CREATE` y `CUSTOMERS_UPDATE`, sin reemplazar la
autorización del backend.
