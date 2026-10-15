# ✅ App de Tareas — React + Node.js

## Como ejecutar

### 1. Backend
    cd server
    npm install
    Copy-Item .env.example .env
    # Edita server/.env y reemplaza MONGODB_URI con la URI de Atlas
    npm run dev        # corre en http://localhost:3001

### 2. Frontend (en otra terminal)
    cd client
    npm install
    npm run dev        # corre en http://localhost:5173

Abre http://localhost:5173 en el navegador.

## Endpoints de la API

| Metodo | Ruta               | Descripcion              |
|--------|--------------------|--------------------------|
| GET    | /api/tareas        | Obtener todas las tareas |
| POST   | /api/tareas        | Crear una tarea          |
| PUT    | /api/tareas/:id    | Editar titulo/estado     |
| DELETE | /api/tareas/:id    | Eliminar una tarea       |

#### Configurar MongoDB Atlas (M0, 512 MB)

1. En [MongoDB Atlas](https://www.mongodb.com/atlas), crea un proyecto y un
   cluster **M0 Free**.
2. En **Network Access**, agrega la IP desde la que ejecutarás la aplicación.
   Evita permitir acceso desde cualquier IP en una instalación real.
3. En **Database Access**, crea un usuario de base de datos y guarda su
   contraseña.
4. En el cluster, elige **Connect → Drivers → Node.js** y copia la URI
   `mongodb+srv://...` que proporciona Atlas.
5. Pega esa URI como valor de `MONGODB_URI` en `server/.env`. Reemplaza los
   marcadores de usuario, contraseña y cluster; si la contraseña contiene
   caracteres especiales, codifícala para URL. Añade `/tareas` antes de los
   parámetros de conexión para usar la base de datos `tareas`.
6. Inicia el backend. Solo comenzará a escuchar después de conectarse a MongoDB;
   si la URI o el acceso a Atlas fallan, mostrará el error de conexión.

El archivo `server/.env` está excluido de Git. No lo subas al repositorio ni
compartas la URI o las credenciales. Las tareas se guardan en la colección
`tareas`; persisten al reiniciar el backend.

La aplicación muestra el total completado, permite eliminar las completadas
con solicitudes `DELETE` secuenciales y editar el título con doble clic
(se guarda mediante `PUT`). El `PUT /api/tareas/:id` acepta `completada`,
`titulo` o ambos.

## Prueba rapida de la API (sin navegador)

    curl http://localhost:3001/api/tareas
    curl -X POST http://localhost:3001/api/tareas -H "Content-Type: application/json" -d '{"titulo":"Mi tarea"}'
