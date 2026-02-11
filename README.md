# Panel React + Laravel API

UI de prueba tecnica para listar, filtrar y crear posts contra la API de Laravel.

## Requisitos

- Node.js 18+
- API de Laravel corriendo (ver proyecto `laravel-prueba-yslas`)

## Configuracion

Crear un archivo `.env` en la raiz con la URL de la API:

```
VITE_API_BASE_URL=http://0.0.0.0:8000
```


## Docker 

Se incluye un Dockerfile y `docker-compose.yml` para facilitar pruebas locales.


- Levantar el contenedor:

```
docker compose up -d --build
```


- La UI quedará disponible en `http://127.0.0.1:5173`


## Funcionalidades

- Listado con filtros (busqueda, estado, rango de fechas, per_page)
- Paginacion
- Creacion de posts con validaciones en cliente
- Estados de carga, error y vacio

## Notas de la API

- Endpoints usados:
	- `GET /api/posts`
	- `POST /api/posts`
- La UI usa el header `Accept: application/json`.

## Tests

Se incluyeron pruebas unitarias básicas con Vitest y React Testing Library.

- Ejecutar las pruebas:

```bash
npm test
```

- Qué se testea actualmente:
	- Render básico de la aplicación: se monta la UI dentro de un `QueryClientProvider` y se verifica que componentes principales (cabecera, estado de listado vacío, formulario de creación) se renderizan correctamente.
	- El test mockea `fetch` para devolver una respuesta vacía ({ data: [], meta: { total: 0 } }).



