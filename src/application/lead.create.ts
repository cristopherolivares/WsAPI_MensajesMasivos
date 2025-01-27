import LeadExternal from "../domain/lead-external.repository";
import LeadRepository from "../domain/lead.repository";

export class LeadCreate {
  private leadRepository: LeadRepository;
  private leadExternal: LeadExternal;
  constructor(respositories: [LeadRepository, LeadExternal]) {
    const [leadRepository, leadExternal] = respositories;
    this.leadRepository = leadRepository;
    this.leadExternal = leadExternal;
  }

  public async sendMessageAndSave({
    message,
    phones,
    image,
  }: {
    message?: string; // Cambiado a opcional
    phones: string[];
    image?: string; // URL o base64 de la imagen
  }) {
    const responsesDbSave = [];
    const responsesExSave = [];
  
    for (const phone of phones) {
      // Si 'message' es undefined, asigna una cadena vacía u otro valor predeterminado
      const safeMessage = message ?? '';
  
      // Guarda en la base de datos (puede incluir mensaje vacío)
      const responseDbSave = await this.leadRepository.save({ 
        message: safeMessage, 
        phone, 
        image 
      });
  
      // Envía el mensaje si existe un texto o una imagen
      let responseExSave;
      if (message || image) {
        responseExSave = await this.leadExternal.sendMsg({ 
          message: safeMessage, 
          phone, 
          image 
        });
      } else {
        responseExSave = { error: "Neither message nor image provided" };
      }
  
      responsesDbSave.push(responseDbSave);
      responsesExSave.push(responseExSave);
    }
  
    return { responsesDbSave, responsesExSave };
  }
  
  
  
}  
