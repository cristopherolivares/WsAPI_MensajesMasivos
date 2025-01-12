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
  }: {
    message: string;
    phones: string[];
  }) {
    const responsesDbSave = [];
    const responsesExSave = [];
  
    for (const phone of phones) {
      const responseDbSave = await this.leadRepository.save({ message, phone });
      const responseExSave = await this.leadExternal.sendMsg({ message, phone });
  
      responsesDbSave.push(responseDbSave);
      responsesExSave.push(responseExSave);
    }
  
    return { responsesDbSave, responsesExSave };
  }
}  
