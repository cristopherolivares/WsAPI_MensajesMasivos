import { Request, Response } from "express";
import { LeadCreate } from "../../application/lead.create";
import csvParser from "csv-parser";
import fs from "fs";

class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async (req: Request, res: Response) => {
    const { message } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
    if (!files) {
      return res.status(400).send({ error: "No se enviaron archivos" });
    }
  
    let phoneNumbers: string[] = [];
    let imagePath: string | undefined;
  
    try {
      // Procesar archivo CSV
      if (files.file && files.file.length > 0) {
        const filePath = files.file[0].path;
        phoneNumbers = await this.parseCsv(filePath);
        this.deleteFile(filePath); // Eliminar archivo CSV después de procesarlo
      }
  
      // Procesar imagen
      if (files.image && files.image.length > 0) {
        imagePath = files.image[0].path;
      }
  
      if (phoneNumbers.length === 0) {
        return res.status(400).send({ error: "No se encontraron números de teléfono en el archivo CSV" });
      }
  
      // Enviar mensajes
      const response = await this.leadCreator.sendMessageAndSave({
        message,
        phones: phoneNumbers,
        image: imagePath,
      });
  
      // Después de enviar los mensajes, eliminar la imagen si fue cargada
      if (imagePath) {
        this.deleteFile(imagePath);
      }
  
      return res.send(response);
    } catch (err) {
      return res.status(500).send({ error: "Error procesando archivos" });
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
}

export default LeadCtrl;


