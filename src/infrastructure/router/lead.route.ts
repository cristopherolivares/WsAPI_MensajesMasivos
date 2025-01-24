import express, { Router } from "express";
import multer from "multer";
import LeadCtrl from "../controller/lead.ctrl";
import container from "../ioc";

const router: Router = Router();
const upload = multer({ dest: "uploads/" });

const leadCtrl: LeadCtrl = container.get("lead.ctrl");

// Ruta para enviar mensajes
router.post("/", upload.single("file"), leadCtrl.sendCtrl);

export { router };
