import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { errorHandler, createError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Forward authentication requests to the auth service
router.post('/register', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/register', req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.get('User-Agent')
      }
    });

    // Forward the response from auth service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // Forward the error response from auth service
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Authentication service unavailable', 503));
    }
  }
}));

router.post('/login', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.get('User-Agent')
      }
    });

    // Forward the response from auth service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // Forward the error response from auth service
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Authentication service unavailable', 503));
    }
  }
}));

router.post('/refresh', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/refresh', req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.get('User-Agent')
      }
    });

    // Forward the response from auth service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // Forward the error response from auth service
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Authentication service unavailable', 503));
    }
  }
}));

// Validate JWT token
router.post('/validate', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Forward validation to auth service
    const response = await axios.post('http://localhost:3001/api/auth/validate', { token }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from auth service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // Forward the error response from auth service
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Authentication service unavailable', 503));
    }
  }
}));

// Get user profile (protected route)
router.get('/profile', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Forward request to auth service
    const response = await axios.get('http://localhost:3001/api/auth/profile', {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from auth service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // Forward the error response from auth service
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Authentication service unavailable', 503));
    }
  }
}));

// Logout (invalidate token)
router.post('/logout', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.substring(7);

    // Forward request to auth service
    const response = await axios.post('http://localhost:3001/api/auth/logout', { token }, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from auth service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      // Forward the error response from auth service
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Authentication service unavailable', 503));
    }
  }
}));

export { router as authRoutes };