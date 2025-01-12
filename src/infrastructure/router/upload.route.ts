import express, { Router } from "express";
import multer from "multer";
import path from "path";

const router: Router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No se subió ninguna imagen." });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ message: "Imagen subida exitosamente.", imageUrl });
});

export { router };
