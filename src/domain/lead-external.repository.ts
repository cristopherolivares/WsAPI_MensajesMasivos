export default interface LeadExternal {
    sendMsg({
      message,
      phone,
      image,
    }: {
      message: string;
      phone: string;
      image?: string;
    }): Promise<any>;
  }
  