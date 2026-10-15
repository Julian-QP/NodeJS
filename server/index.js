require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Tarea = require("./models/Tarea");

const app = express();
app.use(cors());
app.use(express.json());

function validarId(id) {
  return mongoose.isValidObjectId(id);
}

// GET - Obtener todas las tareas
app.get("/api/tareas", async (req, res, next) => {
  try {
    const tareas = await Tarea.find().sort({ _id: 1 }).lean();
    res.json(tareas.map(({ _id, titulo, completada }) => ({
      id: _id.toString(),
      titulo,
      completada,
    })));
  } catch (error) {
    next(error);
  }
});

// POST - Crear una tarea
app.post("/api/tareas", async (req, res, next) => {
  const titulo = req.body?.titulo;
  if (typeof titulo !== "string" || !titulo.trim()) {
    return res.status(400).json({ error: "El titulo es obligatorio" });
  }
  try {
    const nueva = await Tarea.create({ titulo: titulo.trim() });
    res.status(201).json({
      id: nueva._id.toString(),
      titulo: nueva.titulo,
      completada: nueva.completada,
    });
  } catch (error) {
    next(error);
  }
});

// PUT - Actualizar estado o titulo
app.put("/api/tareas/:id", async (req, res, next) => {
  if (!validarId(req.params.id)) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const cambios = {};
  const body = req.body ?? {};
  if (Object.hasOwn(body, "completada")) {
    if (typeof body.completada !== "boolean") {
      return res.status(400).json({ error: "El estado debe ser booleano" });
    }
    cambios.completada = body.completada;
  }
  if (Object.hasOwn(body, "titulo")) {
    if (typeof body.titulo !== "string" || !body.titulo.trim()) {
      return res.status(400).json({ error: "El titulo es obligatorio" });
    }
    cambios.titulo = body.titulo.trim();
  }
  if (Object.keys(cambios).length === 0) {
    return res.status(400).json({ error: "No hay cambios para guardar" });
  }

  try {
    const tarea = await Tarea.findByIdAndUpdate(
      req.params.id,
      { $set: cambios },
      { new: true, runValidators: true }
    ).lean();
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({
      id: tarea._id.toString(),
      titulo: tarea.titulo,
      completada: tarea.completada,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE - Eliminar una tarea
app.delete("/api/tareas/:id", async (req, res, next) => {
  if (!validarId(req.params.id)) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }
  try {
    const tarea = await Tarea.findByIdAndDelete(req.params.id);
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error("Error en la API:", error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  const mensaje = status === 400
    ? "El cuerpo de la solicitud no es valido"
    : "Error interno al procesar la solicitud";
  res.status(status).json({ error: mensaje });
});

async function iniciarServidor() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Falta configurar la variable MONGODB_URI");

  const maxIntentos = 5;
  for (let intento = 1; ; intento += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 8000,
      });
      break;
    } catch (error) {
      if (!error.hasErrorLabel?.("RetryableError") || intento >= maxIntentos) {
        throw error;
      }
      const esperaMs = Math.min(1000 * 2 ** (intento - 1), 8000);
      console.warn(
        `Atlas no disponible (intento ${intento}/${maxIntentos}); reintentando en ${esperaMs / 1000}s.`
      );
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
    }
  }

  const puerto = process.env.PORT || 3001;
  app.listen(puerto, () => {
    console.log(`API corriendo en http://localhost:${puerto}`);
    console.log("Conectado a MongoDB Atlas");
  });
}

iniciarServidor().catch((error) => {
  console.error("No se pudo iniciar la API:", error);
  process.exitCode = 1;
});
