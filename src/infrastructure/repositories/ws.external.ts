import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import { image as imageQr } from "qr-image";
import LeadExternal from "../../domain/lead-external.repository";


import { existsSync, readFileSync } from "fs";
import path from "path";
/**
 * Extendemos los super poderes de whatsapp-web
 */
class WsTransporter extends Client implements LeadExternal {
  private status = false;

  constructor() {
    super({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          "--disable-setuid-sandbox",
          "--unhandled-rejections=strict",
        ],
      },
    });

    console.log("Iniciando....");

    this.initialize();

    this.on("ready", () => {
      this.status = true;
      console.log("LOGIN_SUCCESS");
    });

    this.on("auth_failure", () => {
      this.status = false;
      console.log("LOGIN_FAIL");
    });

    this.on("qr", (qr) => {
      console.log("Escanea el codigo QR que esta en la carepta tmp");
      this.generateImage(qr);
    });
  }

  /**
   * Enviar mensaje de WS
   * @param lead
   * @returns
   */
  async sendMsg({
    message,
    phone,
    image,
    document,
  }: {
    message?: string; // Mensaje opcional
    phone: string;
    image?: string; // Imagen en Base64 o ruta
    document?: string; // Documento en Base64 o ruta
  }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
  
      let media: MessageMedia | undefined;
  
      // Procesar imagen si se proporciona
      if (image) {
        if (existsSync(image)) {
          const mimeType = this.getMimeType(image);
          const base64Image = readFileSync(image).toString("base64");
          media = new MessageMedia(mimeType, base64Image, path.basename(image));
        } else if (image.startsWith("data:") || image.startsWith("http")) {
          media = image.startsWith("http")
            ? await MessageMedia.fromUrl(image)
            : new MessageMedia(
                image.split(";")[0].split(":")[1],
                image.split(",")[1],
                "image"
              );
        }
      }
  
      // Enviar el archivo o mensaje
      if (media) {
        const response = await this.sendMessage(`${phone}@c.us`, media, {
          caption: message || "", // Texto opcional
        });
        return { id: response.id.id };
      } else if (message) {
        const response = await this.sendMessage(`${phone}@c.us`, message);
        return { id: response.id.id };
      } else {
        return Promise.resolve({ error: "No content to send" });
      }
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
  
  
  // Obtener tipo MIME para imágenes y documentos
  // private getMimeType(filePath: string): string {
  //   const ext = path.extname(filePath).toLowerCase();
  //   switch (ext) {
  //     case ".png":
  //       return "image/png";
  //     case ".jpg":
  //     case ".jpeg":
  //       return "image/jpeg";
  //     case ".gif":
  //       return "image/gif";
  //     case ".pdf":
  //       return "application/pdf";
  //     case ".doc":
  //     case ".docx":
  //       return "application/msword";
  //     default:
  //       throw new Error("Unsupported file format");
  //   }
  // }
  
  private getMimeType(filePath: string): string {
    const mime = require("mime-types");
    const mimeType = mime.lookup(filePath);
    if (!mimeType) {
      throw new Error("Unsupported file format");
    }
    return mimeType;
  }
  
  
  getStatus(): boolean {
    return this.status;
  }

  private generateImage = (base64: string) => {
    const path = `${process.cwd()}/tmp`;
    let qr_svg = imageQr(base64, { type: "svg", margin: 4 });
    qr_svg.pipe(require("fs").createWriteStream(`${path}/qr.svg`));
    console.log(`⚡ Recuerda que el QR se actualiza cada minuto ⚡'`);
    console.log(`⚡ Actualiza F5 el navegador para mantener el mejor QR⚡`);
  };
}

export default WsTransporter;
