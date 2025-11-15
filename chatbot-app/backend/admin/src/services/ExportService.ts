import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/chatbot'
});

export interface SystemMetrics {
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  systemUptime: string;
  memoryUsage: number;
  cpuUsage: number;
}

export class ExportService {
  static async exportConversations(conversationIds: string[], format: string = 'json'): Promise<any> {
    try {
      const query = `
        SELECT c.*, m.content as last_message, m.created_at as last_message_time
        FROM conversations c
        LEFT JOIN (
          SELECT conversation_id, content, created_at
          FROM messages
          ORDER BY created_at DESC
        ) m ON c.id = m.conversation_id
        WHERE c.id = ANY($1)
        ORDER BY c.started_at DESC
      `;
      
      const result = await pool.query(query, [conversationIds]);
      const conversations = result.rows;
      
      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(conversations, null, 2);
        
        case 'csv':
          return this.convertToCSV(conversations);
        
        case 'xml':
          return this.convertToXML(conversations);
        
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting conversations:', error);
      throw error;
    }
  }

  static async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Get total conversations
      const conversationsQuery = 'SELECT COUNT(*) FROM conversations';
      const conversationsResult = await pool.query(conversationsQuery);
      const totalConversations = parseInt(conversationsResult.rows[0].count);

      // Get total messages
      const messagesQuery = 'SELECT COUNT(*) FROM messages';
      const messagesResult = await pool.query(messagesQuery);
      const totalMessages = parseInt(messagesResult.rows[0].count);

      // Get active users (last 30 days)
      const activeUsersQuery = `
        SELECT COUNT(*) FROM users 
        WHERE last_login >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      `;
      const activeUsersResult = await pool.query(activeUsersQuery);
      const activeUsers = parseInt(activeUsersResult.rows[0].count);

      // Mock system metrics (in a real implementation, you'd get these from system monitoring)
      const systemUptime = '15d 8h 32m';
      const memoryUsage = 65.4; // MB
      const cpuUsage = 12.3; // %

      return {
        totalConversations,
        totalMessages,
        activeUsers,
        systemUptime,
        memoryUsage,
        cpuUsage
      };
    } catch (error) {
      console.error('Error getting system metrics:', error);
      throw error;
    }
  }

  private static convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  private static convertToXML(data: any[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<conversations>\n';
    
    data.forEach(conversation => {
      xml += '  <conversation>\n';
      Object.entries(conversation).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += '  </conversation>\n';
    });
    
    xml += '</conversations>';
    return xml;
  }
}