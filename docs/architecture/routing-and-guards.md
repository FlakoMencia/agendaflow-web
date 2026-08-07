# Routing y guards

`/login` y el wildcard 404 técnico son públicos. El application shell usa `authGuard` y
`authChildGuard`; cada ruta sensible agrega `permissionGuard` con `permissions` o `roles` en
`route.data`.

| Ruta                         | Requisito de UX       |
| ---------------------------- | --------------------- |
| `/organizations` y detalle   | `ORGANIZATION_VIEW`   |
| `/organizations/new`         | `PLATFORM_ADMIN`      |
| edición de organización      | `ORGANIZATION_UPDATE` |
| listado de sucursales        | `BRANCHES_VIEW`       |
| creación/edición de sucursal | `BRANCHES_MANAGE`     |

`PLATFORM_ADMIN` replica el override explícito del backend. `guestGuard` evita volver a login con
una sesión válida. `authGuard` conserva únicamente URLs de retorno internas; valores externos o
que apunten a login se reemplazan por una ruta segura.

El sidebar filtra accesos con la sesión confirmada por `/auth/me`, pero ocultar un enlace no
autoriza ni protege una operación. Los guards son controles de UX; Spring Security y las reglas
multi-tenant del backend siguen siendo la barrera definitiva. Las respuestas 403 se manejan aunque
el botón o enlace no estuviera visible.
