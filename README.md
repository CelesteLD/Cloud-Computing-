# Lab04 — Computación en la Nube

Aplicación web con arquitectura MVC que ejecuta binarios C++ desde un frontend React a través de una API REST en Flask.

## Estructura

```
lab04/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── app.py                  # Controlador Flask
│   ├── requirements.txt
│   ├── binaries/
│   │   └── sum.cpp             # Binario de suma
│   └── descriptors/
│       └── sum.json            # Descriptor de la operación
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.jsx             # Controlador React
        ├── App.css
        ├── index.js
        ├── components/
        │   ├── OperationSelector.jsx
        │   ├── OperationForm.jsx
        │   └── ResultDisplay.jsx
        └── services/
            └── api.js          # Modelo: capa de acceso a la API
```

## Levantar la app

```bash
cd lab04
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Añadir una nueva operación

1. Crea el binario en `backend/binaries/nombre.cpp`
2. Crea su descriptor en `backend/descriptors/nombre.json`
3. Reconstruye: `docker-compose up --build`

### Formato del descriptor JSON

```json
{
  "id": "nombre_unico",
  "name": "Nombre visible",
  "description": "Descripción breve",
  "binary": "nombre_ejecutable",
  "category": "Categoría",
  "inputs": [
    {
      "name": "param1",
      "label": "Etiqueta visible",
      "type": "number",
      "placeholder": "Ej: 42"
    }
  ]
}
```

## API endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/operations` | Lista todas las operaciones disponibles |
| POST | `/api/run/:id` | Ejecuta la operación con el ID dado |
| GET | `/api/health` | Health check |