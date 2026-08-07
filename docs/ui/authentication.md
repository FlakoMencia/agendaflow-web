# UI de autenticación

La pantalla de login usa el sistema visual AgendaFlow: superficie clara, foco visible, jerarquía de
encabezados, labels persistentes y mensajes asociados mediante `aria-describedby`.

El botón se deshabilita durante el envío y el componente ignora submits adicionales. Después de un
fallo se borra el password y se muestra un mensaje genérico que no confirma si existen el email o
la organización. Los estados 423 y de red usan textos seguros.

La topbar presenta solo nombre, email dentro del menú de sesión y organización activa; no utiliza
avatar ni datos ficticios. El sidebar elimina enlaces no autorizados y muestra un estado útil si no
hay módulos de negocio disponibles. `/access-denied` explica el 403 sin revelar detalles internos.

La navegación sigue siendo operable por teclado, los menús exponen estado expandido y las
animaciones globales respetan `prefers-reduced-motion`.
