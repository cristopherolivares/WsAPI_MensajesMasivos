import express, { Router } from "express";
import multer from "multer";
import path from "path";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";

const router: Router = Router();

// Configurar Multer para mantener el nombre original
const storage = multer.diskStorage({
  destination: "uploads/", // Carpeta de destino
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Usar el nombre original del archivo
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


