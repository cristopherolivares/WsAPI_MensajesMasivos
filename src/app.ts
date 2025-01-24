import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./infrastructure/router";
import fs from "fs";
import path from "path";

const port = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

// Middleware para servir archivos estáticos (archivos subidos)
app.use(express.static("tmp"));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Asegurándonos de que "/uploads" sea accesible

// Rutas de tu aplicación
app.use(`/`, routes);

app.listen(port, () => console.log(`Ready...${port}`));

// Eliminar archivos temporales regularmente (opcional, usando setInterval)
setInterval(() => {
  const dir = path.join(__dirname, "uploads");
  fs.readdir(dir, (err, files) => {
    if (err) return;
    for (const file of files) {
      fs.unlink(path.join(dir, file), () => {}); // Elimina archivos viejos en 'uploads'
    }
  });
}, 1000 * 60 * 60); // Cada hora

