import { useEffect, useState } from "react";
import Formulario from "./components/Formulario.jsx";
import ListaTareas from "./components/ListaTareas.jsx";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"
).replace(/\/+$/, "");
const API = `${API_BASE}/tareas`;

async function comprobarRespuesta(res, mensaje) {
  if (res.ok) return;
  let detalle;
  try {
    detalle = (await res.json()).error;
  } catch {
    detalle = null;
  }
  throw new Error(detalle || mensaje);
}

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [error, setError] = useState(null);

  // Cargar tareas al montar el componente
  useEffect(() => {
    cargarTareas();
  }, []);

  async function cargarTareas() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("No se pudieron cargar las tareas");
      setTareas(await res.json());
    } catch (err) {
      setErrorCarga(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function agregarTarea(titulo) {
    try {
      setError(null);
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      });
      await comprobarRespuesta(res, "No se pudo agregar la tarea");
      const nueva = await res.json();
      setTareas((actuales) => [...actuales, nueva]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function eliminarTarea(id) {
    try {
      setError(null);
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      await comprobarRespuesta(res, "No se pudo eliminar la tarea");
      setTareas((actuales) => actuales.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleTarea(id) {
    const tarea = tareas.find((t) => t.id === id);
    if (!tarea) return;
    try {
      setError(null);
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completada: !tarea.completada }),
      });
      await comprobarRespuesta(res, "No se pudo actualizar la tarea");
      const actualizada = await res.json();
      setTareas((actuales) =>
        actuales.map((t) => (t.id === id ? actualizada : t))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function editarTarea(id, titulo) {
    try {
      setError(null);
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      });
      await comprobarRespuesta(res, "No se pudo editar la tarea");
      const actualizada = await res.json();
      setTareas((actuales) =>
        actuales.map((t) => (t.id === id ? actualizada : t))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function eliminarCompletadas() {
    const completadas = tareas.filter((t) => t.completada);
    try {
      setError(null);
      for (const tarea of completadas) {
        const res = await fetch(`${API}/${tarea.id}`, { method: "DELETE" });
        await comprobarRespuesta(res, `No se pudo eliminar "${tarea.titulo}"`);
        setTareas((actuales) => actuales.filter((t) => t.id !== tarea.id));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) return <p className="estado">Cargando...</p>;
  if (errorCarga) return <p className="estado">❌ {errorCarga}</p>;

  const completadas = tareas.filter((t) => t.completada).length;

  return (
    <main className="contenedor">
      <h1>✅ Mis tareas</h1>
      <p className="contador">
        {completadas} de {tareas.length} tareas completadas
      </p>
      <Formulario onAgregar={agregarTarea} />
      {error && <p className="mensaje-error" role="alert">❌ {error}</p>}
      {completadas > 0 && (
        <button className="btn-eliminar-completadas" onClick={eliminarCompletadas}>
          Eliminar completadas
        </button>
      )}
      <ListaTareas
        tareas={tareas}
        onEliminar={eliminarTarea}
        onToggle={toggleTarea}
        onEditar={editarTarea}
      />
    </main>
  );
}
