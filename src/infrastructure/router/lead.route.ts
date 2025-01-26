import express, { Router } from "express";
import multer from "multer";
import path from "path";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";

const router: Router = Router();

// Configurar almacenamiento personalizado con Multer
const storage = multer.diskStorage({
  destination: "uploads/", // Carpeta de destino
  filename: (req, file, cb) => {
    // Generar un nombre único manteniendo la extensión del archivo
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname); // Obtener extensión del archivo
    cb(null, `${uniqueSuffix}${extension}`); // Guardar con nombre único y extensión
  },
});

const upload = multer({ storage });

const leadCtrl: LeadCtrl = container.get("lead.ctrl");

// Configurar las rutas
router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 }, // Archivo CSV
    { name: "image", maxCount: 1 }, // Imagen adjunta
  ]),
  leadCtrl.sendCtrl
);

export { router };

