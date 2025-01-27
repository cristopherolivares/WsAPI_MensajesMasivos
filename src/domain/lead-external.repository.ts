export default interface LeadExternal {
  sendMsg({
    message,
    phone,
    image,
  }: {
    message?: string; // Ahora es opcional
    phone: string;
    image?: string;
  }): Promise<any>;
  
  }
  