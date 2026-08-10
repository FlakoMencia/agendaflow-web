# Desarrollo

Usa Node.js 24.18.1, npm 11.16.0 y el CLI local del workspace.

```bash
npm install
npm start
npm run test:ci
npm run build
npm audit --omit=dev
```

La web se ejecuta en `http://localhost:4200` y espera la API en
`http://localhost:8080/api/v1`. Para probar los módulos de Fase 4, la sesión debe exponer una
organización activa y los permisos de consulta o gestión correspondientes. No hay selector manual
de organización ni workaround CORS en Angular.

Los modelos TypeScript deben mantenerse alineados con los records reales del backend. Las pruebas
HTTP usan `HttpTestingController`; los dobles y fixtures existen únicamente en archivos de prueba.
No se guardan credenciales, access tokens ni secretos en el repositorio.

Consulta [login local](local-login.md) para preparar una sesión junto con `agendaflow-api`.
