import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/chatbot'
});

export interface MessageData {
  id?: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any[];
  createdAt?: Date;
  messageType?: string;
}

export class MessageManager {
  static async createMessage(messageData: Omit<MessageData, 'id' | 'createdAt'>): Promise<MessageData> {
    const id = uuidv4();
    const createdAt = new Date();
    
    const query = `
      INSERT INTO messages (id, conversation_id, sender_id, content, attachments, created_at, message_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      id,
      messageData.conversationId,
      messageData.senderId,
      messageData.content,
      JSON.stringify(messageData.attachments || []),
      createdAt,
      messageData.messageType || 'text'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<MessageData | null> {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByConversationId(conversationId: string): Promise<MessageData[]> {
    const query = 'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC';
    const result = await pool.query(query, [conversationId]);
    return result.rows;
  }

  static async updateMessage(id: string, content: string): Promise<void> {
    const query = 'UPDATE messages SET content = $1 WHERE id = $2';
    await pool.query(query, [content, id]);
  }

  static async deleteMessage(id: string): Promise<void> {
    const query = 'DELETE FROM messages WHERE id = $1';
    await pool.query(query, [id]);
  }
}