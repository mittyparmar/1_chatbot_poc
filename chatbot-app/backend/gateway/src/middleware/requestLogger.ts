import { Request, Response, NextFunction } from 'express';

export interface RequestLog {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Log request details
  const logData: Partial<RequestLog> = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent') || 'Unknown',
    timestamp: new Date().toISOString()
  };

  // Get user ID from request if available (after authentication)
  if (req.user && typeof req.user === 'object' && 'id' in req.user) {
    logData.userId = (req.user as any).id;
  }

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding?: any) {
    const responseTime = Date.now() - start;
    
    // Complete the log data
    const completedLog: RequestLog = {
      ...logData,
      statusCode: res.statusCode,
      responseTime
    } as RequestLog;

    // Log the request
    logRequest(completedLog);

    // Call original end
    originalEnd.call(this, chunk, encoding);
  } as any;

  next();
};

function logRequest(logData: RequestLog) {
  const { method, url, ip, userAgent, statusCode, responseTime, timestamp, userId } = logData;
  
  // Log format: [timestamp] method statusCode url ip responseTime userId
  const logMessage = `[${timestamp}] ${method} ${statusCode} ${url} ${ip} ${responseTime}ms ${userId || 'anonymous'}`;
  
  // Colorize based on status code
  let colorizedLog = logMessage;
  if (statusCode >= 500) {
    console.error(`\x1b[31m${logMessage}\x1b[0m`); // Red for server errors
  } else if (statusCode >= 400) {
    console.warn(`\x1b[33m${logMessage}\x1b[0m`); // Yellow for client errors
  } else if (statusCode >= 300) {
    console.log(`\x1b[36m${logMessage}\x1b[0m`); // Cyan for redirects
  } else {
    console.log(`\x1b[32m${logMessage}\x1b[0m`); // Green for success
  }

  // Log detailed information for slow requests (> 1 second)
  if (responseTime > 1000) {
    console.warn(`\x1b[33mSlow request detected: ${responseTime}ms for ${url}\x1b[0m`);
  }

  // Log security-related events
  if (statusCode === 401 || statusCode === 403) {
    console.warn(`\x1b[31mSecurity event: ${statusCode} for ${url} from ${ip}\x1b[0m`);
  }
}

// Export a function to get request statistics
export function getRequestStats(): any {
  // In a real implementation, this would aggregate logs and return statistics
  return {
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    slowRequests: 0
  };
}

// Export middleware for specific logging needs
export const logRequestDetails = (req: Request, res: Response, next: NextFunction) => {
  console.log('Request Details:', {
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  });
  next();
};

// Export middleware for error logging
export const logError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error Details:', {
    error: error.message,
    stack: error.stack,
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      user: req.user
    },
    timestamp: new Date().toISOString()
  });
  next();
};