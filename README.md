# Panel React + Laravel API

UI de prueba tecnica para listar, filtrar y crear posts contra la API de Laravel.

## Requisitos

- Node.js 18+
- API de Laravel corriendo (ver proyecto `laravel-prueba-yslas`)

## Configuracion

1) Crear un archivo `.env` en la raiz con la URL de la API:

```
VITE_API_BASE_URL=http://0.0.0.0:8000
```

2) Instalar dependencias:

```
npm install
```

## Ejecutar

```
npm run dev
```

La app levanta en `http://127.0.0.1:5173`.

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

- Notas y siguientes pasos recomendados:
	- Actualmente hay un test sencillo que valida el render inicial. Es recomendable agregar pruebas para:
		- Validaciones del formulario (campos obligatorios, mensajes de error).
		- Creación de post con manejo exitoso y errores 422 (mockear respuestas de la API).
		- Paginación y acciones de publicar (optimistic updates / refetch).
	- Para tests más realistas, agregar `msw` (Mock Service Worker) y simular la API Laravel localmente.

