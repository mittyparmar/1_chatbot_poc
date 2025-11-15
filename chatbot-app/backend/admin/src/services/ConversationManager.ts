import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/chatbot'
});

export interface ConversationData {
  id?: string;
  userId: string;
  adminId?: string;
  title?: string;
  metadata?: any;
  startedAt?: Date;
  endedAt?: Date;
  status?: string;
}

export interface ConversationQueryOptions {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class ConversationManager {
  static async create(conversationData: Omit<ConversationData, 'id' | 'startedAt'>): Promise<ConversationData> {
    const id = uuidv4();
    const startedAt = new Date();
    
    const query = `
      INSERT INTO conversations (id, user_id, admin_id, title, metadata, started_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      id,
      conversationData.userId,
      conversationData.adminId,
      conversationData.title,
      JSON.stringify(conversationData.metadata || {}),
      startedAt,
      conversationData.status || 'active'
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<ConversationData | null> {
    const query = 'SELECT * FROM conversations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<ConversationData[]> {
    const query = 'SELECT * FROM conversations WHERE user_id = $1 ORDER BY started_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getAll(options: ConversationQueryOptions = {}): Promise<{ conversations: ConversationData[], total: number }> {
    const { page = 1, limit = 20, userId, status, startDate, endDate } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      whereClause += ` WHERE user_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }
    
    if (status) {
      whereClause += whereClause ? ` AND status = $${paramIndex}` : ` WHERE status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (startDate) {
      whereClause += whereClause ? ` AND started_at >= $${paramIndex}` : ` WHERE started_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereClause += whereClause ? ` AND started_at <= $${paramIndex}` : ` WHERE started_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }
    
    const countQuery = `SELECT COUNT(*) FROM conversations${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);
    
    const dataQuery = `
      SELECT * FROM conversations${whereClause}
      ORDER BY started_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataParams = [...queryParams, limit, offset];
    const dataResult = await pool.query(dataQuery, dataParams);
    
    return {
      conversations: dataResult.rows,
      total
    };
  }

  static async updateStatus(id: string, status: string): Promise<void> {
    const query = 'UPDATE conversations SET status = $1, ended_at = CASE WHEN $2 = \'ended\' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = $3';
    await pool.query(query, [status, status, id]);
  }

  static async assignAdmin(conversationId: string, adminId: string): Promise<void> {
    const query = 'UPDATE conversations SET admin_id = $1 WHERE id = $2';
    await pool.query(query, [adminId, conversationId]);
  }
}