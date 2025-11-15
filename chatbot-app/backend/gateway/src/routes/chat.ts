import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { errorHandler, createError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get conversations for a user
router.get('/conversations', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const { page = 1, limit = 20, status } = req.query;

    // Forward request to chat service
    const response = await axios.get('http://localhost:3002/api/chat/conversations', {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        limit,
        status
      }
    });

    // Forward the response from chat service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Chat service unavailable', 503));
    }
  }
}));

// Get conversation details
router.get('/conversations/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const { id } = req.params;

    // Forward request to chat service
    const response = await axios.get(`http://localhost:3002/api/chat/conversations/${id}`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from chat service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Chat service unavailable', 503));
    }
  }
}));

// Create new conversation
router.post('/conversations', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);

    // Forward request to chat service
    const response = await axios.post('http://localhost:3002/api/chat/conversations', req.body, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from chat service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Chat service unavailable', 503));
    }
  }
}));

// Send message
router.post('/conversations/:id/messages', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const { id } = req.params;

    // Forward request to chat service
    const response = await axios.post(`http://localhost:3002/api/chat/conversations/${id}/messages`, req.body, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from chat service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Chat service unavailable', 503));
    }
  }
}));

// Get messages in a conversation
router.get('/conversations/:id/messages', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Forward request to chat service
    const response = await axios.get(`http://localhost:3002/api/chat/conversations/${id}/messages`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        limit
      }
    });

    // Forward the response from chat service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Chat service unavailable', 503));
    }
  }
}));

// Mark conversation as read
router.patch('/conversations/:id/read', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const { id } = req.params;

    // Forward request to chat service
    const response = await axios.patch(`http://localhost:3002/api/chat/conversations/${id}/read`, {}, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from chat service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Chat service unavailable', 503));
    }
  }
}));

// Delete conversation
router.delete('/conversations/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);
    const { id } = req.params;

    // Forward request to chat service
    const response = await axios.delete(`http://localhost:3002/api/chat/conversations/${id}`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from chat service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Chat service unavailable', 503));
    }
  }
}));

// WebSocket connection endpoint (for future implementation)
router.get('/socket', (req: Request, res: Response) => {
  res.json({
    message: 'WebSocket endpoint available at ws://localhost:3002',
    instructions: 'Connect to the chat service directly for WebSocket functionality'
  });
});

export { router as chatRoutes };