import { Request, Response } from "express";
import { LeadCreate } from "../../application/lead.create";
import csvParser from "csv-parser";
import fs from "fs";

class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async ({ body, file }: Request, res: Response) => {
    const { message, phones, image } = body;

    // Validar si hay un archivo CSV o una lista de números en el body
    let phoneNumbers: string[] = [];

    if (file) {
      // Procesar archivo CSV
      try {
        const filePath = file.path;
        phoneNumbers = await this.parseCsv(filePath);
        fs.unlinkSync(filePath); // Eliminar el archivo temporal después de leerlo
      } catch (err) {
        return res.status(400).send({ error: "Error al procesar el archivo CSV" });
      }
    } else if (Array.isArray(phones) && phones.length > 0) {
      phoneNumbers = phones;
    } else {
      return res.status(400).send({ error: "Se debe proporcionar un archivo CSV o una lista de números" });
    }

    const response = await this.leadCreator.sendMessageAndSave({ message, phones: phoneNumbers, image });
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

