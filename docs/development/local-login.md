# Login local

## Requisitos

- `agendaflow-api` ejecutándose en `http://localhost:8080`.
- PostgreSQL y migraciones del backend disponibles.
- Un usuario activo con password, una membresía activa en una organización activa y roles/permisos
  asignados.
- CORS del backend habilitado para `http://localhost:4200`.

No se incluyen usuarios seed ni credenciales en este repositorio.

## Ejecución

```bash
npm install
npm start
```

Abre `http://localhost:4200/login` e introduce email, password y el ID positivo de la organización
de la membresía. El ID será reemplazado por selección de organización en una fase futura.

Después del login, recargar la misma pestaña dispara `/auth/me`. Cerrar sesión elimina el token
localmente; no se llama a un endpoint de logout inexistente. Si la API devuelve 401 por expiración
o token inválido, la aplicación termina la sesión y vuelve a login.

No publiques el token desde DevTools, logs, query params o capturas. La URL de API se cambia por
ambiente sustituyendo el provider de `API_CONFIG`; no se colocan secretos en esa configuración.
