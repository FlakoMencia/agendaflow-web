# Desarrollo

Usa Node.js 24.18.1, npm 11.16.0 y el CLI local del workspace.

```bash
npm install
npm start
npm run test:ci
npm run build
```

La web se ejecuta en `http://localhost:4200` y espera la API en
`http://localhost:8080/api/v1`. No se agregan workarounds CORS en Angular.

Los modelos TypeScript deben mantenerse alineados con los records reales del backend. Las pruebas
HTTP usan `HttpTestingController`; los dobles y fixtures existen únicamente en archivos de prueba.
No se guardan credenciales, access tokens ni secretos en el repositorio.

Consulta [login local](local-login.md) para preparar una sesión junto con `agendaflow-api`.
