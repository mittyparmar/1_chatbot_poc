import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { errorHandler, createError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Export all conversations
router.post('/export/conversations', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format = 'json', filters = {} } = req.body;

    // Forward request to data service
    const response = await axios.post('http://localhost:3006/api/data/export/conversations', 
      { format, filters }, {
      timeout: 60000, // Longer timeout for large exports
      headers: {
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
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Export user data
router.post('/export/users', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format = 'json', userIds = [], includePreferences = true } = req.body;

    // Forward request to data service
    const response = await axios.post('http://localhost:3006/api/data/export/users', 
      { format, userIds, includePreferences }, {
      timeout: 60000, // Longer timeout for large exports
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Handle binary data
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
    
    // Send the binary data
    res.send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Export analytics data
router.post('/export/analytics', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format = 'json', dateRange = {}, metrics = [] } = req.body;

    // Forward request to data service
    const response = await axios.post('http://localhost:3006/api/data/export/analytics', 
      { format, dateRange, metrics }, {
      timeout: 60000, // Longer timeout for large exports
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Handle binary data
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=analytics.${format}`);
    
    // Send the binary data
    res.send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Import data
router.post('/import', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file, type, options = {} } = req.body;

    // Forward request to data service
    const response = await axios.post('http://localhost:3006/api/data/import', 
      { file, type, options }, {
      timeout: 300000, // Very long timeout for imports
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from data service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Create backup
router.post('/backup', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { includeUsers = true, includeConversations = true, includeAnalytics = true } = req.body;

    // Forward request to data service
    const response = await axios.post('http://localhost:3006/api/data/backup', 
      { includeUsers, includeConversations, includeAnalytics }, {
      timeout: 300000, // Long timeout for backup creation
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Handle binary data
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=backup.tar.gz');
    
    // Send the binary data
    res.send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Restore from backup
router.post('/restore', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { backupFile, overwrite = false } = req.body;

    // Forward request to data service
    const response = await axios.post('http://localhost:3006/api/data/restore', 
      { backupFile, overwrite }, {
      timeout: 600000, // Very long timeout for restore
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from data service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Get data statistics
router.get('/statistics', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward request to data service
    const response = await axios.get('http://localhost:3006/api/data/statistics', {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from data service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Validate data integrity
router.get('/validate', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward request to data service
    const response = await axios.get('http://localhost:3006/api/data/validate', {
      timeout: 30000, // Long timeout for validation
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from data service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Clean up old data
router.delete('/cleanup', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { olderThan, types = [] } = req.body;

    // Forward request to data service
    const response = await axios.delete('http://localhost:3006/api/data/cleanup', {
      timeout: 60000, // Long timeout for cleanup
      headers: {
        'Content-Type': 'application/json'
      },
      data: { olderThan, types }
    });

    // Forward the response from data service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

// Get data schema
router.get('/schema', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    // Forward request to data service
    const response = await axios.get('http://localhost:3006/api/data/schema', {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      params: { type }
    });

    // Forward the response from data service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('Data service unavailable', 503));
    }
  }
}));

export { router as dataRoutes };