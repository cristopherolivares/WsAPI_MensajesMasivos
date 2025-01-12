import { Lead } from "./lead";

/**
 * Esta la interfaz que debe de cumplir el repositorio de infraestructura
 * mysql o mongo o etc
 */
export default interface LeadRepository {
  save({
    message,
    phone,
    image,
  }: {
    message: string;
    phone: string;
    image?: string;
  }): Promise<Lead | undefined | null>;
  
  getDetail(id:string):Promise<Lead | null | undefined>
}
