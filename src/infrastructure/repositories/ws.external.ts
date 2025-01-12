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
  }: {
    message: string;
    phone: string;
    image?: string; // Ruta local o URL/Base64
  }): Promise<any> {
    try {
      if (!this.status) return Promise.resolve({ error: "WAIT_LOGIN" });
  
      if (image) {
        let media: MessageMedia;
  
        if (existsSync(image)) {
          // Si la imagen es un archivo local, leerla y convertirla
          const mimeType = this.getMimeType(image); // Función para obtener el tipo MIME
          const base64Image = readFileSync(image).toString("base64");
          media = new MessageMedia(mimeType, base64Image, path.basename(image));
        } else if (image.startsWith("data:") || image.startsWith("http")) {
          // Si la imagen es Base64 o una URL
          media = image.startsWith("http")
            ? await MessageMedia.fromUrl(image)
            : new MessageMedia(
                image.split(";")[0].split(":")[1], // Obtener el MIME
                image.split(",")[1], // Base64 puro
                "image" // Nombre genérico
              );
        } else {
          return Promise.resolve({ error: "INVALID_IMAGE_PATH" });
        }
  
        // Enviar la imagen con un mensaje opcional como pie de foto
        const response = await this.sendMessage(`${phone}@c.us`, media, {
          caption: message,
        });
        return { id: response.id.id };
      } else {
        // Si no hay imagen, solo envía el mensaje
        const response = await this.sendMessage(`${phone}@c.us`, message);
        return { id: response.id.id };
      }
    } catch (e: any) {
      return Promise.resolve({ error: e.message });
    }
  }
  
  // Obtener el tipo MIME del archivo basado en su extensión
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".png":
        return "image/png";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".gif":
        return "image/gif";
      default:
        throw new Error("Unsupported image format");
    }
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
