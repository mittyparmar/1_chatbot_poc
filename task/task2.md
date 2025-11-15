# Task 2: Core Services Development

## Overview
This task focuses on developing the core backend microservices that form the foundation of the chatbot application. We'll implement the Authentication Service, Chat Service, and Admin Service with their basic functionality.

## Objectives
- Develop Authentication Service with JWT-based authentication
- Build Chat Service with WebSocket support
- Create Admin Service with basic management features
- Implement Personalization Service foundation
- Set up service-to-service communication
- Develop API Gateway for routing and load balancing

## Detailed Steps

### 2.1 Authentication Service Development

#### 2.1.1 Service Setup
```bash
cd backend/auth
npm init -y
npm install express bcryptjs jsonwebtoken cors helmet morgan dotenv
npm install @types/express @types/bcryptjs @types/jsonwebtoken @types/cors @types/morgan typescript --save-dev
```

**auth/src/server.ts**:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Authentication Service running on port ${PORT}`);
});
```

#### 2.1.2 Authentication Routes
**auth/src/routes/auth.ts**:
```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validateRequest } from '../middleware/validation';
import { authSchema, loginSchema } from '../schemas/auth';

const router = express.Router();

// Register
router.post('/register', validateRequest(authSchema), async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      name,
      role
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRoutes };
```

#### 2.1.3 User Model
**auth/src/models/User.ts**:
```typescript
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
```

### 2.2 Chat Service Development

#### 2.2.1 Service Setup
```bash
cd backend/chat
npm init -y
npm install express socket.io cors helmet morgan dotenv uuid
npm install @types/express @types/cors @types/morgan @types/uuid typescript --save-dev
```

**chat/src/server.ts**:
```typescript
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet');
import morgan from 'morgan';
import dotenv from 'dotenv';
import { chatRoutes } from './routes/chat';
import { errorHandler } from './middleware/errorHandler';
import { socketHandler } from './socket/socketHandler';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socketHandler(socket, io);
});

// Routes
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'chat' });
});

// Error handling
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});
```

#### 2.2.2 Socket.IO Handler
**chat/src/socket/socketHandler.ts**:
```typescript
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ConversationManager } from '../services/ConversationManager';
import { MessageManager } from '../services/MessageManager';

export const socketHandler = (socket: Socket, io: SocketIOServer) => {
  const conversationManager = new ConversationManager();
  const messageManager = new MessageManager();

  // Join conversation
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation
  socket.on('leave-conversation', (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('send-message', async (data: {
    conversationId: string;
    content: string;
    messageType: string;
    attachments?: any[];
  }) => {
    try {
      const { conversationId, content, messageType, attachments } = data;
      
      // Save message to database
      const message = await messageManager.createMessage({
        conversationId,
        senderId: socket.id,
        content,
        messageType,
        attachments: attachments || []
      });

      // Emit message to conversation participants
      io.to(conversationId).emit('new-message', {
        id: message.id,
        conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        attachments: message.attachments,
        createdAt: message.createdAt
      });

      // Emit typing indicator
      socket.to(conversationId).emit('user-typing', {
        userId: socket.id,
        typing: false
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; typing: boolean }) => {
    const { conversationId, typing } = data;
    socket.to(conversationId).emit('user-typing', {
      userId: socket.id,
      typing
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
};
```

#### 2.2.3 Conversation Manager
**chat/src/services/ConversationManager.ts**:
```typescript
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

  static async updateStatus(id: string, status: string): Promise<void> {
    const query = 'UPDATE conversations SET status = $1, ended_at = CASE WHEN $2 = \'ended\' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = $3';
    await pool.query(query, [status, status, id]);
  }

  static async assignAdmin(conversationId: string, adminId: string): Promise<void> {
    const query = 'UPDATE conversations SET admin_id = $1 WHERE id = $2';
    await pool.query(query, [adminId, conversationId]);
  }
}
```

### 2.3 Admin Service Development

#### 2.3.1 Service Setup
```bash
cd backend/admin
npm init -y
npm install express cors helmet morgan dotenv pg
npm install @types/express @types/cors @types/morgan @types/pg typescript --save-dev
```

**admin/src/server.ts**:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { adminRoutes } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin routes require authentication
app.use('/api/admin', authMiddleware);

// Routes
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'admin' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
```

#### 2.3.2 Admin Routes
**admin/src/routes/admin.ts**:
```typescript
import express from 'express';
import { ConversationManager } from '../services/ConversationManager';
import { MessageManager } from '../services/MessageManager';
import { UserManager } from '../services/UserManager';
import { exportService } from '../services/ExportService';

const router = express.Router();

// Get all conversations with filtering
router.get('/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, status, startDate, endDate } = req.query;
    
    const conversations = await ConversationManager.getAll({
      page: Number(page),
      limit: Number(limit),
      userId: userId as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation details
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await ConversationManager.findById(id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await MessageManager.findByConversationId(id);
    
    res.json({
      conversation,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign conversation to admin
router.post('/conversations/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;
    
    await ConversationManager.assignAdmin(id, adminId);
    
    res.json({ message: 'Conversation assigned successfully' });
  } catch (error) {
    console.error('Error assigning conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update conversation status
router.patch('/conversations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await ConversationManager.updateStatus(id, status);
    
    res.json({ message: 'Conversation status updated successfully' });
  } catch (error) {
    console.error('Error updating conversation status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export conversation data
router.post('/conversations/export', async (req, res) => {
  try {
    const { conversationIds, format = 'json' } = req.body;
    
    const exportData = await exportService.exportConversations(conversationIds, format);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=conversations.${format}`);
    
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user analytics
router.get('/analytics/users', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await UserManager.getAnalytics(startDate as string, endDate as string);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system metrics
router.get('/analytics/system', async (req, res) => {
  try {
    const metrics = await exportService.getSystemMetrics();
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminRoutes };
```

### 2.4 Personalization Service Foundation

#### 2.4.1 Service Setup
```bash
cd backend/personalization
npm init -y
npm install express cors helmet morgan dotenv fastapi uvicorn pydantic python-multipart
npm install @types/express @types/cors @types/morgan typescript --save-dev
```

**personalization/src/main.py**:
```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

from services.user_profile import UserProfileService
from services.context_engine import ContextEngine
from services.recommendation import RecommendationService

load_dotenv()

app = FastAPI(title="Personalization Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Services
user_profile_service = UserProfileService()
context_engine = ContextEngine()
recommendation_service = RecommendationService()

# Pydantic models
class UserProfile(BaseModel):
    user_id: str
    browsing_history: List[dict]
    location_data: dict
    conversation_preferences: dict
    last_updated: str

class ContextData(BaseModel):
    user_id: str
    conversation_id: str
    message_content: str
    timestamp: str

class RecommendationRequest(BaseModel):
    user_id: str
    context: dict
    limit: int = 5

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "personalization"}

@app.post("/user-profile")
async def create_user_profile(profile: UserProfile):
    try:
        result = await user_profile_service.create_profile(profile.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    try:
        profile = await user_profile_service.get_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/user-profile/{user_id}")
async def update_user_profile(user_id: str, profile: UserProfile):
    try:
        result = await user_profile_service.update_profile(user_id, profile.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/context")
async def add_context_data(context: ContextData):
    try:
        result = await context_engine.add_context(context.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/context/{user_id}")
async def get_user_context(user_id: str):
    try:
        context = await context_engine.get_context(user_id)
        return context
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = await recommendation_service.get_recommendations(
            request.user_id, request.context, request.limit
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3005)
```

### 2.5 API Gateway Development

#### 2.5.1 Gateway Setup
```bash
cd backend/gateway
npm init -y
npm express cors helmet morgan dotenv @hapi/h2o2 @hapi/joi
npm install @types/express @types/cors @types/morgan @types/hapi__h2o2 @types/hapi__joi typescript --save-dev
```

**gateway/src/server.ts**:
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import H2o2 from '@hapi/h2o2';
import Joi from '@hapi/joi';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load balancing plugin
app.register(H2o2);

// Service routes
const services = {
  auth: {
    host: 'auth-service',
    port: 3001,
    protocol: 'http'
  },
  chat: {
    host: 'chat-service',
    port: 3002,
    protocol: 'http'
  },
  admin: {
    host: 'admin-service',
    port: 3003,
    protocol: 'http'
  },
  personalization: {
    host: 'personalization-service',
    port: 3005,
    protocol: 'http'
  }
};

// Auth service routes
app.route('/api/auth*').proxy({
  host: services.auth.host,
  port: services.auth.port,
  protocol: services.auth.protocol,
  passThrough: true
});

// Chat service routes
app.route('/api/chat*').proxy({
  host: services.chat.host,
  port: services.chat.port,
  protocol: services.chat.protocol,
  passThrough: true
});

// Admin service routes
app.route('/api/admin*').proxy({
  host: services.admin.host,
  port: services.admin.port,
  protocol: services.admin.protocol,
  passThrough: true
});

// Personalization service routes
app.route('/api/personalization*').proxy({
  host: services.personalization.host,
  port: services.personalization.port,
  protocol: services.personalization.protocol,
  passThrough: true
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal gateway error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

## Deliverables

1. ✅ Authentication Service with JWT authentication
2. ✅ Chat Service with WebSocket support
3. ✅ Admin Service with basic management features
4. ✅ Personalization Service foundation
5. ✅ API Gateway with routing and load balancing
6. ✅ Service-to-service communication setup
7. ✅ Database models and migrations
8. ✅ Error handling middleware
9. ✅ Health check endpoints
10. ✅ Docker configurations for all services

## Success Criteria

- All services can start successfully
- Authentication works with JWT tokens
- WebSocket connections establish properly
- API Gateway routes requests correctly
- Database operations function as expected
- Error handling works across all services

## Dependencies

- Task 1 must be completed first
- PostgreSQL database must be running
- Redis must be available for caching
- Docker must be configured for containerization
- Kubernetes cluster must be available for deployment

## Notes

- Ensure proper environment variables are set for all services
- Test service communication before proceeding to frontend development
- Security configurations will be enhanced in later tasks
- Monitor service health and performance during development
- Database migrations should be handled carefully to avoid data loss