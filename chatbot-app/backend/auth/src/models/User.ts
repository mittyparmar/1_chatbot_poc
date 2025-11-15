import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/chatbot'
});

export interface UserData {
  id?: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  preferences?: any;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export class User {
  static async create(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserData> {
    const id = uuidv4();
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const query = `
      INSERT INTO users (id, email, password_hash, name, role, preferences, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      id,
      userData.email,
      userData.passwordHash,
      userData.name,
      userData.role,
      JSON.stringify(userData.preferences || {}),
      createdAt,
      updatedAt
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<UserData | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<UserData | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async updateLastLogin(userId: string): Promise<void> {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    await pool.query(query, [userId]);
  }

  static async updatePreferences(userId: string, preferences: any): Promise<void> {
    const query = 'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await pool.query(query, [JSON.stringify(preferences), userId]);
  }
}