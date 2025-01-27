import { Request, Response } from "express";
import { LeadCreate } from "../../application/lead.create";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";

class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
    if (!files) {
      return res.status(400).send({ error: "No se enviaron archivos" });
    }
  
    let phoneNumbers: string[] = [];
    let messages: string[] = [];
    let imagePath: string | undefined;
  
    try {
      // Procesar archivo CSV de teléfonos
      if (files.file && files.file.length > 0) {
        const filePath = files.file[0].path;
        phoneNumbers = await this.parseCsv(filePath);
        this.deleteFile(filePath); // Eliminar archivo CSV después de procesarlo
      }
  
      // Procesar archivo TXT de mensajes (si existe)
      if (files.message && files.message.length > 0) {
        const messagePath = files.message[0].path;
        const messageContent = this.parseTxt(messagePath); // Leer contenido completo
        this.deleteFile(messagePath); // Eliminar archivo TXT después de procesarlo
        messages.push(messageContent); // Agregar el contenido completo como un único mensaje
      }
  
      // Procesar imagen (si existe)
      if (files.image && files.image.length > 0) {
        imagePath = files.image[0].path;
      }
  
      // Validación básica
      if (phoneNumbers.length === 0) {
        return res.status(400).send({ error: "No se encontraron números de teléfono en el archivo CSV" });
      }
  
      if (!messages[0] && !imagePath) {
        return res.status(400).send({ error: "No se encontró mensaje ni imagen para enviar" });
      }
  
      // Enviar mensajes y/o imágenes a todos los números
      const response = await this.leadCreator.sendMessageAndSave({
        message: messages[0], // Puede ser undefined si no hay mensaje
        phones: phoneNumbers,
        image: imagePath, // Puede ser undefined si no hay imagen
      });
  
      // Después de enviar los mensajes, eliminar la imagen si fue cargada
      if (imagePath) {
        this.deleteFile(imagePath);
      }
  
      return res.send({ response });
    } catch (err) {
      if (err instanceof Error) {
        return res.status(500).send({ error: "Error procesando archivos", details: err.message });
      } else {
        return res.status(500).send({ error: "Error procesando archivos", details: "Unknown error occurred" });
      }
    }
  };
  
  

  // Método para eliminar archivos
  private deleteFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error eliminando archivo: ${filePath}`, err);
      } else {
        console.log(`Archivo eliminado: ${filePath}`);
      }
    });
  }

  // Método para procesar archivo CSV
  private parseCsv(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const phoneNumbers: string[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          if (row.phone) phoneNumbers.push(row.phone.trim());
        })
        .on("end", () => resolve(phoneNumbers))
        .on("error", (error) => reject(error));
    });
  }

  // Método para procesar archivo TXT
  private parseTxt(filePath: string): string {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8").trim();
      return fileContent; // Retorna el contenido completo como un solo mensaje
    } catch (error) {
      console.error("Error leyendo el archivo TXT:", error);
      return "";
    }
  }
}

export default LeadCtrl;



