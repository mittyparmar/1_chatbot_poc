import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { errorHandler, createError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get user profile
router.get('/user-profile/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Forward request to personalization service
    const response = await axios.get(`http://localhost:3005/user-profile/${userId}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Create or update user profile
router.put('/user-profile/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Forward request to personalization service
    const response = await axios.put(`http://localhost:3005/user-profile/${userId}`, req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Add context data
router.post('/context', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward request to personalization service
    const response = await axios.post('http://localhost:3005/context', req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Get user context
router.get('/context/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Forward request to personalization service
    const response = await axios.get(`http://localhost:3005/context/${userId}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Get recommendations
router.post('/recommendations', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward request to personalization service
    const response = await axios.post('http://localhost:3005/recommendations', req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Update user preferences
router.patch('/user-profile/:userId/preferences', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Forward request to personalization service
    const response = await axios.patch(`http://localhost:3005/user-profile/${userId}/preferences`, req.body, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Get user preferences
router.get('/user-profile/:userId/preferences', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Forward request to personalization service
    const response = await axios.get(`http://localhost:3005/user-profile/${userId}/preferences`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Get user behavior analytics
router.get('/analytics/:userId/behavior', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Forward request to personalization service
    const response = await axios.get(`http://localhost:3005/analytics/${userId}/behavior`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        startDate,
        endDate
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Get personalization insights
router.get('/insights/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Forward request to personalization service
    const response = await axios.get(`http://localhost:3005/insights/${userId}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Export user data
router.post('/export/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { format = 'json', includePreferences = true, includeHistory = true } = req.body;

    // Forward request to personalization service
    const response = await axios.post(`http://localhost:3005/export/${userId}`, 
      { format, includePreferences, includeHistory }, {
      timeout: 30000, // Longer timeout for export
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Handle binary data
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=user-data-${userId}.${format}`);
    
    // Send the binary data
    res.send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

// Delete user data (GDPR compliance)
router.delete('/user-profile/:userId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Forward request to personalization service
    const response = await axios.delete(`http://localhost:3005/user-profile/${userId}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from personalization service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Personalization service unavailable', 503));
    }
  }
}));

export { router as personalizationRoutes };