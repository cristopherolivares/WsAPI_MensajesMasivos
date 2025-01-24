import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

const router = Router();

// Verificar y crear el directorio "uploads" si no existe
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Ruta para manejar las subidas de archivos
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }

  const filePath = path.join(uploadsDir, req.file.filename);

  // Leer y procesar el archivo CSV
  const phoneNumbers: string[] = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      if (row.phone) {
        phoneNumbers.push(row.phone);
      }
    })
    .on("end", () => {
      console.log("Archivo CSV procesado:", phoneNumbers);
      res.status(200).json({ message: "Archivo subido y procesado exitosamente.", phoneNumbers });
    })
    .on("error", (err) => {
      console.error("Error al procesar el CSV:", err);
      res.status(500).json({ message: "Error al procesar el archivo CSV." });
    });
});

export { router };
