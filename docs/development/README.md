# Desarrollo

## Entorno local

Usa Node.js 24.18.1, npm 11.16.0 y el CLI local del workspace.

```bash
npm install
npm start
npm run test:ci
npm run build
```

La web se ejecuta en `http://localhost:4200` y espera la API en
`http://localhost:8080/api/v1`. Para una ejecución conjunta, inicia `agendaflow-api` con su perfil
local y después la web. La configuración CORS del backend debe permitir
`http://localhost:4200`; no se agregan workarounds CORS en Angular.

## Contratos y formularios

Los modelos TypeScript se mantienen alineados con `OrganizationCreateRequest`,
`OrganizationUpdateRequest`, `OrganizationResponse`, `BranchCreateRequest`,
`BranchUpdateRequest`, `BranchResponse`, `PageResponse` y `ApiErrorResponse` del backend. Antes de
ampliar un campo o ruta se debe actualizar primero el contrato real; no se agregan propiedades de
conveniencia al payload.

Los formularios son Reactive Forms tipados. Las cadenas vacías opcionales se normalizan a `null`,
los códigos de país y moneda se envían en mayúsculas y las coordenadas respetan rango y seis
decimales. `organizationId` proviene exclusivamente de la ruta y no forma parte del formulario de
sucursal.

## Errores y pruebas

`mapApiError` reconoce not-found, validación, conflicto, red y error inesperado. Los errores de
campo del backend se conectan con mensajes accesibles del formulario. Nunca se presenta la
respuesta cruda del servidor.

Las pruebas de servicios usan `provideHttpClientTesting` y `HttpTestingController`. Las pruebas de
componentes emplean dobles exclusivamente dentro de archivos de prueba; la aplicación productiva
no contiene datos simulados ni fallback local. La cobertura actual incluye URLs, verbos, payloads,
paginación, estados de listado, retry, validación, creación, bloqueo de doble submit y aislamiento
de sucursales.

La autenticación sigue ausente de forma intencional: no hay login, JWT, guards, roles ni
interceptor de autenticación.
