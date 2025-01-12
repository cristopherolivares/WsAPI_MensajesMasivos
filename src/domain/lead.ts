import { v4 as uuid } from "uuid";

export class Lead {
  readonly uuid: string;
  readonly message: string;
  readonly phone: string;
  readonly image?: string;

  constructor({ message, phone, image }: { message: string; phone: string; image?: string }) {
    this.uuid = uuid();
    this.message = message;
    this.phone = phone;
    this.image = image;
  }
}

 