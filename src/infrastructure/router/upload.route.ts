import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/", upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]), (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || (!files.file && !files.image)) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }

  const csvFilePath = files.file?.[0]?.path;
  const imagePath = files.image?.[0]?.path;

  if (csvFilePath) {
    const phoneNumbers: string[] = [];
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on("data", (row) => {
        if (row.phone) {
          phoneNumbers.push(row.phone);
        }
      })
      .on("end", () => {
        res.status(200).json({
          message: "Archivo procesado correctamente.",
          phoneNumbers,
          imagePath,
        });
      })
      .on("error", (err) => {
        res.status(500).json({ message: "Error procesando el CSV", error: err.message });
      });
  } else {
    res.status(200).json({ message: "Imagen subida correctamente", imagePath });
  }
});

export { router };

