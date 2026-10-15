import { useState } from "react";

export default function Formulario({ onAgregar }) {
  const [titulo, setTitulo] = useState("");

  async function manejarEnvio(e) {
    e.preventDefault();
    if (!titulo.trim()) return;
    try {
      await onAgregar(titulo.trim());
      setTitulo("");
    } catch {
      // El error se muestra en App; conserva el texto para reintentar.
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="formulario">
      <input
        type="text"
        placeholder="Nueva tarea..."
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <button type="submit">Agregar</button>
    </form>
  );
}
