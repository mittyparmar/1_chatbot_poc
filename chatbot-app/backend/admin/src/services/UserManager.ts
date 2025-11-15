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

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userRetention: number;
  avgSessionDuration: number;
}

export class UserManager {
  static async getAnalytics(startDate?: string, endDate?: string): Promise<UserAnalytics> {
    let whereClause = '';
    const queryParams: any[] = [];
    let paramIndex = 1;
    
    if (startDate) {
      whereClause += ` WHERE created_at >= $${paramIndex}`;
      queryParams.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereClause += whereClause ? ` AND created_at <= $${paramIndex}` : ` WHERE created_at <= $${paramIndex}`;
      queryParams.push(endDate);
      paramIndex++;
    }
    
    // Total users
    const totalQuery = `SELECT COUNT(*) FROM users${whereClause}`;
    const totalResult = await pool.query(totalQuery, queryParams);
    const totalUsers = parseInt(totalResult.rows[0].count);
    
    // Active users (logged in within last 30 days)
    const activeQuery = `
      SELECT COUNT(*) FROM users 
      WHERE last_login >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      ${whereClause.replace('created_at', 'last_login')}
    `;
    const activeResult = await pool.query(activeQuery, queryParams);
    const activeUsers = parseInt(activeResult.rows[0].count);
    
    // New users (created within last 7 days)
    const newQuery = `
      SELECT COUNT(*) FROM users 
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
      ${whereClause}
    `;
    const newResult = await pool.query(newQuery, queryParams);
    const newUsers = parseInt(newResult.rows[0].count);
    
    // User retention (users who logged in more than once)
    const retentionQuery = `
      SELECT COUNT(*) FROM users 
      WHERE last_login > created_at
      ${whereClause}
    `;
    const retentionResult = await pool.query(retentionQuery, queryParams);
    const returningUsers = parseInt(retentionResult.rows[0].count);
    const userRetention = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;
    
    // Average session duration (mock data for now)
    const avgSessionDuration = 15.5; // minutes
    
    return {
      totalUsers,
      activeUsers,
      newUsers,
      userRetention: parseFloat(userRetention.toFixed(2)),
      avgSessionDuration: parseFloat(avgSessionDuration.toFixed(2))
    };
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