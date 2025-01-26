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
  
    // Procesar archivo CSV
    if (files.file && files.file.length > 0) {
      try {
        const filePath = files.file[0].path; // Ruta del CSV
        phoneNumbers = await this.parseCsv(filePath);
        // No elimines el archivo aquí si necesitas conservarlo
      } catch (err) {
        return res.status(400).send({ error: "Error al procesar el archivo CSV" });
      }
    }
  
    // Procesar imagen
    if (files.image && files.image.length > 0) {
      imagePath = files.image[0].path; // Ruta de la imagen
    }
  
    if (phoneNumbers.length === 0) {
      return res.status(400).send({ error: "No se encontraron números de teléfono en el archivo CSV" });
    }
  
    const response = await this.leadCreator.sendMessageAndSave({
      message,
      phones: phoneNumbers,
      image: imagePath,
    });
    res.send(response);
  };
  

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


