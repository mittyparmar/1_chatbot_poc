import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { errorHandler, createError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Admin authentication middleware (would be implemented separately)
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.substring(7);
  
  // In a real implementation, validate the token and check admin role
  // For now, we'll just forward the token to the admin service
  req.headers['authorization'] = `Bearer ${token}`;
  next();
};

// Get all conversations with filtering
router.get('/conversations', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, userId, status, startDate, endDate } = req.query;

    // Forward request to admin service
    const response = await axios.get('http://localhost:3003/api/admin/conversations', {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        limit,
        userId,
        status,
        startDate,
        endDate
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Get conversation details
router.get('/conversations/:id', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Forward request to admin service
    const response = await axios.get(`http://localhost:3003/api/admin/conversations/${id}`, {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Assign conversation to admin
router.post('/conversations/:id/assign', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    // Forward request to admin service
    const response = await axios.post(`http://localhost:3003/api/admin/conversations/${id}/assign`, 
      { adminId }, {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Update conversation status
router.patch('/conversations/:id/status', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Forward request to admin service
    const response = await axios.patch(`http://localhost:3003/api/admin/conversations/${id}/status`, 
      { status }, {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Export conversation data
router.post('/conversations/export', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationIds, format = 'json' } = req.body;

    // Forward request to admin service
    const response = await axios.post('http://localhost:3003/api/admin/conversations/export', 
      { conversationIds, format }, {
      timeout: 30000, // Longer timeout for export
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Handle binary data
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=conversations.${format}`);
    
    // Send the binary data
    res.send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Get user analytics
router.get('/analytics/users', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    // Forward request to admin service
    const response = await axios.get('http://localhost:3003/api/admin/analytics/users', {
      timeout: 15000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      },
      params: {
        startDate,
        endDate
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Get system metrics
router.get('/analytics/system', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward request to admin service
    const response = await axios.get('http://localhost:3003/api/admin/analytics/system', {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Get admin activity logs
router.get('/logs', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, action, startDate, endDate } = req.query;

    // Forward request to admin service
    const response = await axios.get('http://localhost:3003/api/admin/logs', {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        limit,
        action,
        startDate,
        endDate
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Get all users
router.get('/users', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    // Forward request to admin service
    const response = await axios.get('http://localhost:3003/api/admin/users', {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        limit,
        role,
        search
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Get user details
router.get('/users/:id', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Forward request to admin service
    const response = await axios.get(`http://localhost:3003/api/admin/users/${id}`, {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

// Update user role
router.patch('/users/:id/role', requireAdmin, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Forward request to admin service
    const response = await axios.patch(`http://localhost:3003/api/admin/users/${id}/role`, 
      { role }, {
      timeout: 10000,
      headers: {
        'Authorization': req.headers['authorization'] as string,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from admin service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Admin service unavailable', 503));
    }
  }
}));

export { router as adminRoutes };