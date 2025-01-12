import { Request, Response } from "express";
import { LeadCreate } from "../../application/lead.create";

class LeadCtrl {
  constructor(private readonly leadCreator: LeadCreate) {}

  public sendCtrl = async ({ body }: Request, res: Response) => {
    const { message, phones, image } = body;
  
    if (!Array.isArray(phones) || phones.length === 0) {
      return res.status(400).send({ error: "Phones must be a non-empty array" });
    }
  
    const response = await this.leadCreator.sendMessageAndSave({ message, phones, image });
    res.send(response);
  };
  
  
}

export default LeadCtrl;
