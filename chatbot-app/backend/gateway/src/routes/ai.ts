import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { errorHandler, createError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Process message with AI
router.post('/process-message', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, conversationId, userId, context = {} } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/process-message', 
      { message, conversationId, userId, context }, {
      timeout: 30000, // Longer timeout for AI processing
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Analyze sentiment
router.post('/sentiment', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/sentiment', 
      { text }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Extract entities
router.post('/entities', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/entities', 
      { text }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Classify intent
router.post('/intent', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/intent', 
      { text }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Generate response
router.post('/generate-response', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, context = {}, options = {} } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/generate-response', 
      { message, context, options }, {
      timeout: 30000, // Longer timeout for response generation
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Summarize conversation
router.post('/summarize', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId, maxLength = 200 } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/summarize', 
      { conversationId, maxLength }, {
      timeout: 30000, // Longer timeout for summarization
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Analyze conversation quality
router.post('/analyze-quality', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/analyze-quality', 
      { conversationId }, {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Get AI model information
router.get('/models', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward request to AI service
    const response = await axios.get('http://localhost:3007/api/ai/models', {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Get AI model performance metrics
router.get('/metrics', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Forward request to AI service
    const response = await axios.get('http://localhost:3007/api/ai/metrics', {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Train custom model (admin only)
router.post('/train', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainingData, modelType, options = {} } = req.body;

    // Forward request to AI service
    const response = await axios.post('http://localhost:3007/api/ai/train', 
      { trainingData, modelType, options }, {
      timeout: 300000, // Very long timeout for training
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Get training job status
router.get('/train/:jobId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;

    // Forward request to AI service
    const response = await axios.get(`http://localhost:3007/api/ai/train/${jobId}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Forward the response from AI service
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

// Export AI model
router.post('/export/:modelId', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { modelId } = req.params;
    const { format = 'pickle' } = req.body;

    // Forward request to AI service
    const response = await axios.post(`http://localhost:3007/api/ai/export/${modelId}`, 
      { format }, {
      timeout: 60000, // Long timeout for export
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Handle binary data
    });

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=model-${modelId}.${format}`);
    
    // Send the binary data
    res.send(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(createError('AI service unavailable', 503));
    }
  }
}));

export { router as aiRoutes };