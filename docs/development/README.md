# Desarrollo

Usa Node.js 24.18.1, npm 11.16.0 y el CLI local del workspace.

```bash
npm install
npm start
npm run test:ci
npm run build
npm audit --omit=dev
```

La web corre en `http://localhost:4200` y consume exclusivamente
`http://localhost:8080/api/v1`. Para probar Fase 6 localmente, inicia sesión con una organización
activa y combina `APPOINTMENTS_VIEW` con `APPOINTMENTS_UPDATE`, `APPOINTMENTS_CANCEL` y
`APPOINTMENTS_COMPLETE` según la acción.

Flujo manual sugerido: crear una cita, abrir su detalle, confirmar, hacer check-in, iniciar y
completar; crear otra cita pasada para comprobar no-show; revisar el historial después de cada
transición. El backend permanece como autoridad de status y hora.

Las pruebas HTTP usan `HttpTestingController`; fixtures y stubs solo existen en tests. No se guardan
credenciales o tokens. Consulta [login local](local-login.md) para preparar una sesión junto con
`agendaflow-api`.
