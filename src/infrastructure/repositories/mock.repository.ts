// import { Lead } from "../../domain/lead";
// import LeadRepository from "../../domain/lead.repository";

// class MockRepository implements LeadRepository {
//   getDetail(id: string): Promise<Lead | null | undefined> {
//       throw new Error("Method not implemented.");
//   }
//   save(): Promise<Lead> {
//     const MOCK_LEAD: Lead = {
//       uuid: "00---000",
//       message: "test",
//       phone: "00000",
//     };
//     return Promise.resolve(MOCK_LEAD);
//   }
// }

// export default MockRepository



import mysql from 'mysql2/promise';
import { Lead } from "../../domain/lead";
import LeadRepository from "../../domain/lead.repository";
import * as path from 'path'; // Import the path module
import * as fs from 'fs';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST,       // Cambiado a usar variables de entorno
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

class MySQLRepository implements LeadRepository {
  private db: mysql.Connection;

  constructor() {
    this.db = null!;
  }

  // Conexión a la base de datos
  async connect() {
    if (!this.db) {
      this.db = await mysql.createConnection(dbConfig);
    }
  }

  // Guardar un nuevo lead en la base de datos
  
  async save({
    message,
    phone,
    image,
  }: {
    message: string;
    phone: string;
    image?: string;
  }): Promise<Lead> {
    await this.connect();
  
    const [result] = await this.db.execute<mysql.ResultSetHeader>(
      'INSERT INTO leads (message, phone, image) VALUES (?, ?, ?)',
      [message, phone, image || null]
    );
  
    const uuid = result.insertId.toString();
    return new Lead({ message, phone, image });
  }

  // Obtener los detalles de un lead por su id
  async getDetail(id: string): Promise<Lead | null | undefined> {
    await this.connect();

    // Seleccionar un lead por su uuid
    const [rows] = await this.db.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM leads WHERE uuid = ?',
      [id]
    );

    // Verificar si se encontraron filas
    if (rows.length === 0) {
      return null;
    }

    // Obtener el primer registro
    const lead = rows[0];

    // Retornar el objeto Lead
    return new Lead({ message: lead.message, phone: lead.phone });
  }
}

export default MySQLRepository;





