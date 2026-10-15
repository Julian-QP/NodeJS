import { useEffect, useRef, useState } from "react";

export default function Tarea({ tarea, onEliminar, onToggle, onEditar }) {
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(tarea.titulo);
  const inputRef = useRef(null);
  const clickTimerRef = useRef(null);

  useEffect(() => {
    if (editando) inputRef.current?.focus();
  }, [editando]);

  useEffect(() => () => clearTimeout(clickTimerRef.current), []);

  async function guardarTitulo(e) {
    e.preventDefault();
    const nuevoTitulo = titulo.trim();
    if (!nuevoTitulo || nuevoTitulo === tarea.titulo) {
      setTitulo(tarea.titulo);
      setEditando(false);
      return;
    }
    try {
      await onEditar(nuevoTitulo);
      setEditando(false);
    } catch {
      // Mantener el input abierto para que se pueda corregir o reintentar.
    }
  }

  return (
    <li className={tarea.completada ? "tarea completada" : "tarea"}>
      {editando ? (
        <form className="formulario-edicion" onSubmit={guardarTitulo}>
          <input
            ref={inputRef}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setTitulo(tarea.titulo);
                setEditando(false);
              }
            }}
            aria-label="Editar título de la tarea"
          />
          <button type="submit">Guardar</button>
        </form>
      ) : (
        <span
          onClick={(e) => {
            if (e.detail === 1) {
              clickTimerRef.current = setTimeout(onToggle, 250);
            } else {
              clearTimeout(clickTimerRef.current);
            }
          }}
          onDoubleClick={() => {
            clearTimeout(clickTimerRef.current);
            setTitulo(tarea.titulo);
            setEditando(true);
          }}
          title="Clic para completar; doble clic para editar"
        >
          {tarea.titulo}
        </span>
      )}
      <button onClick={onEliminar} className="btn-eliminar" title="Eliminar">
        🗑️
      </button>
    </li>
  );
}
