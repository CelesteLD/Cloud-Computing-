# ServiceX — Framework de Servicios Paralelos en la Nube

> Práctica 5 · Computación en la Nube · Máster en Ingeniería Informática · Universidad de La Laguna

ServiceX es un framework orientado a servicios que permite registrar, compilar y ejecutar rutinas paralelas escritas en C++ directamente desde un navegador web. Soporta operaciones numéricas, matriciales y procesamiento de imágenes con OpenMP y MPI, todo desplegado con Docker.

---

## Índice

1. [Arquitectura](#arquitectura)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Requisitos](#requisitos)
4. [Guía de despliegue](#guía-de-despliegue)
5. [Usar la plataforma](#usar-la-plataforma)
6. [Registrar un nuevo servicio](#registrar-un-nuevo-servicio)
7. [Requisitos del binario](#requisitos-del-binario)
8. [API REST](#api-rest)
9. [Tecnologías](#tecnologías)

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                       Navegador                         │
│                   React · ServiceX UI                   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / multipart
┌──────────────────────────▼──────────────────────────────┐
│                  Backend · Flask API                     │
│                                                         │
│  /api/operations   →  lista servicios disponibles       │
│  /api/register     →  compila .cpp · genera descriptor  │
│  /api/run/:id      →  ejecuta binario numérico          │
│  /api/run-image/:id →  ejecuta binario de imagen        │
│  /api/result/:job  →  sirve imagen procesada            │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  binaries/  │  │image_binaries│  │  descriptors/ │  │
│  │  (numérico) │  │  (OMP / MPI) │  │    (JSON)     │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

El framework sigue un modelo **genérico y extensible**: cada servicio queda descrito por un fichero JSON (`descriptors/`) que el frontend consume dinámicamente para renderizar el formulario correcto. Añadir un servicio no requiere tocar el código — solo subir el `.cpp` desde la interfaz.

---

## Estructura del proyecto

```
Cloud-Computing-/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── app.py                         # API REST (Flask)
│   ├── requirements.txt
│   ├── binaries/                      # Fuentes C++ de operaciones numéricas
│   │   ├── sum.cpp
│   │   ├── sum_float.cpp
│   │   ├── substract_float.cpp
│   │   ├── quotient.cpp
│   │   ├── multiply.cpp
│   │   ├── divide.cpp
│   │   ├── matrix_add.cpp
│   │   └── matrix_multiply.cpp
│   ├── image_binaries/                # Fuentes C++ de operaciones de imagen
│   │   └── (compilados en runtime vía /api/register)
│   ├── descriptors/                   # Descriptores JSON de cada servicio
│   │   ├── sum.json
│   │   ├── sum_float.json
│   │   ├── substract_float.json
│   │   ├── quotient.json
│   │   ├── multiply.json
│   │   ├── divide.json
│   │   ├── matrix_add.json
│   │   └── matrix_multiply.json
│   ├── uploads/                       # Imágenes de entrada temporales (no versionado)
│   └── outputs/                       # Imágenes procesadas temporales (no versionado)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.jsx                    # Controlador principal
        ├── App.css                    # Estilos globales (tema ServiceX)
        ├── index.js
        ├── components/
        │   ├── OperationSelector.jsx  # Sidebar con grupos por categoría
        │   ├── OperationForm.jsx      # Formulario dinámico para operaciones numéricas
        │   ├── ResultDisplay.jsx      # Resultado numérico / matricial
        │   ├── ImageOperationForm.jsx # Drag & drop + selector de paralelismo
        │   ├── ImageResultDisplay.jsx # Imagen resultado + tiempos de cómputo
        │   └── RegisterServiceModal.jsx # Modal de registro de nuevos servicios
        └── services/
            └── api.js                 # Capa de acceso a la API REST
```

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — macOS, Windows o Linux

No se necesita ninguna otra dependencia instalada en el sistema anfitrión. El contenedor del backend incluye `g++`, `openmpi`, `libpng` y `libpng++`.

---

## Guía de despliegue

### 1. Clonar el repositorio

```bash
git clone https://github.com/CelesteLD/Cloud-Computing-.git
cd Cloud-Computing-
```

### 2. Levantar los servicios

```bash
# Primera vez — construye las imágenes y compila los binarios numéricos
docker compose up --build

# Ejecuciones posteriores — arranca en segundos
docker compose up
```

### 3. Acceder a la plataforma

| Servicio | URL |
|----------|-----|
| Frontend (ServiceX UI) | http://localhost:3000 |
| Backend API | http://localhost:5001 |

### 4. Parar los servicios

```bash
docker compose down
```

### Notas de despliegue

- Los binarios numéricos se compilan automáticamente durante el `docker compose up --build`, por lo que no es necesario compilarlos manualmente.
- Los servicios de imagen (OpenMP, MPI, secuencial) **no están precompilados**. Se registran y compilan desde la interfaz web en runtime mediante el botón **+ Añadir servicio**.
- Los directorios `backend/uploads/` y `backend/outputs/` se crean automáticamente al arrancar. No se versionan.

---

## Usar la plataforma

### Operaciones numéricas y matriciales

1. Selecciona una operación en la barra lateral izquierda.
2. Rellena los parámetros en el formulario dinámico.
3. Pulsa **Ejecutar** — el resultado aparece debajo.

### Operaciones de procesamiento de imagen

1. Selecciona una operación de imagen (categoría *Procesamiento de Imagen*).
2. Arrastra una imagen PNG/JPG al área de carga, o haz clic para seleccionarla.
3. Elige el número de hilos o procesos (2 o 4).
4. Pulsa **Aplicar filtro**.
5. La imagen procesada aparece con sus tiempos de cómputo. Puedes descargarla con el botón **Descargar imagen**.

---

## Registrar un nuevo servicio

ServiceX permite añadir cualquier binario C++ como servicio sin modificar el código de la aplicación.

### Paso 1 — Pulsa "+ Añadir servicio" en la barra lateral

Se abrirá un modal con tres pasos.

### Paso 2 — Sube el fichero `.cpp`

Arrastra el fichero o haz clic para seleccionarlo. Solo se aceptan ficheros `.cpp`.

### Paso 3 — Rellena los metadatos

| Campo | Descripción |
|-------|-------------|
| Nombre | Nombre visible en la interfaz |
| Categoría | Agrupa el servicio en la barra lateral |
| Descripción | Texto descriptivo breve |
| Tipo de servicio | **Numérico** (lee argumentos CLI y escribe a stdout) o **Imagen** (lee/escribe PNG) |
| Tecnología | Solo para imagen: **Secuencial**, **OpenMP** o **MPI** |

### Paso 4 — Define los parámetros de entrada (solo servicios numéricos)

Pulsa **+ Añadir parámetro** por cada argumento que el binario lea desde `argv[]`, en orden. Para cada uno:

| Campo | Descripción |
|-------|-------------|
| Nombre interno | Nombre del argumento (ej. `a`, `b`) |
| Etiqueta visible | Texto que verá el usuario |
| Tipo | `number`, `text`, `matrix` o `select` |
| Placeholder | Texto de ayuda en el campo |

Para servicios de imagen, los parámetros (selector de hilos/procesos) se generan automáticamente según la tecnología elegida.

### Paso 5 — Registrar servicio

El backend compila el `.cpp` con el compilador adecuado:

| Tipo | Compilador |
|------|-----------|
| Numérico | `g++ -O2` |
| Imagen · Secuencial | `g++ -O2 -lpng` |
| Imagen · OpenMP | `g++ -O2 -fopenmp -lpng` |
| Imagen · MPI | `mpic++ -O2 -lpng` |

Si la compilación falla, el modal muestra el error completo de `g++`/`mpic++`. Si tiene éxito, el servicio aparece inmediatamente en la barra lateral, marcado con el badge **tuyo**.

### Eliminar un servicio

Los servicios registrados por el usuario muestran un botón **✕** en la barra lateral. Al pulsarlo aparece un diálogo de confirmación. Los servicios predefinidos no se pueden eliminar.

---

## Requisitos del binario

### Binario numérico

- Lee sus argumentos desde `argv[1]`, `argv[2]`, ... en el mismo orden en que se definieron los parámetros.
- Escribe el resultado a `stdout` (una línea de texto o una matriz).

```cpp
// Ejemplo mínimo: suma de dos enteros
int main(int argc, char *argv[]) {
    int a = atoi(argv[1]);
    int b = atoi(argv[2]);
    std::cout << a + b << std::endl;
    return 0;
}
```

### Binario de imagen

- Recibe la ruta de entrada en `argv[1]` y la ruta de salida en `argv[2]`.
- Para OpenMP: recibe el número de hilos en `argv[3]`.
- Para MPI: se lanza con `mpirun -np N`, el número de procesos lo gestiona MPI.
- Escribe a `stdout` un JSON con los tiempos al finalizar:

```cpp
// Salida obligatoria
cout << "{\"compute_sec\":" << compute
     << ",\"total_sec\":"   << total   << "}" << endl;
// Para OpenMP, añadir: ,\"threads\":" << num_threads
// Para MPI, añadir:    ,\"processes\":" << size
```

---

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/operations` | Lista todos los servicios disponibles con sus descriptores |
| `POST` | `/api/register` | Compila un `.cpp` y registra un nuevo servicio (`multipart/form-data`: `file` + `meta`) |
| `POST` | `/api/run/:id` | Ejecuta un servicio numérico (`application/json`) |
| `POST` | `/api/run-image/:id` | Ejecuta un servicio de imagen (`multipart/form-data`: `image` + params) |
| `GET` | `/api/result/:job_id` | Descarga la imagen procesada |
| `DELETE` | `/api/operations/:id` | Elimina un servicio registrado por el usuario |
| `GET` | `/api/health` | Health check |

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, nginx |
| Backend | Python 3.12, Flask |
| Cómputo paralelo | C++17, OpenMP, OpenMPI |
| Procesamiento de imagen | libpng, png++ |
| Contenedorización | Docker, docker-compose |
| Tipografía | Space Mono, Outfit (Google Fonts) |