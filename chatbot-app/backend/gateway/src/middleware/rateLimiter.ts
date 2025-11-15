import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitInfo {
  totalHits: number;
  resetTime: number;
  remainingHits: number;
}

class RateLimiter {
  private redisClient: any;
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      keyGenerator: (req: Request) => req.ip,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options
    };

    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.redisClient.on('error', (err: Error) => {
        console.error('Redis error:', err);
        // Fallback to in-memory store if Redis is unavailable
        this.redisClient = null;
      });

      await this.redisClient.connect();
    } catch (error) {
      console.warn('Redis connection failed, using in-memory rate limiting');
      this.redisClient = null;
    }
  }

  private async getRateLimitInfo(key: string): Promise<RateLimitInfo> {
    if (!this.redisClient) {
      // Fallback to in-memory store
      return this.getInMemoryRateLimitInfo(key);
    }

    try {
      const currentHits = await this.redisClient.get(key);
      const hits = currentHits ? parseInt(currentHits) : 0;
      const resetTime = Date.now() + this.options.windowMs;
      const remainingHits = Math.max(0, this.options.maxRequests - hits);

      return {
        totalHits: hits,
        resetTime,
        remainingHits
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return this.getInMemoryRateLimitInfo(key);
    }
  }

  private async incrementRateLimit(key: string): Promise<RateLimitInfo> {
    if (!this.redisClient) {
      return this.incrementInMemoryRateLimit(key);
    }

    try {
      const multi = this.redisClient.multi();
      multi.incr(key);
      multi.expire(key, Math.ceil(this.options.windowMs / 1000));
      
      const results = await multi.exec();
      const hits = results[0];
      const resetTime = Date.now() + this.options.windowMs;
      const remainingHits = Math.max(0, this.options.maxRequests - hits);

      return {
        totalHits: hits,
        resetTime,
        remainingHits
      };
    } catch (error) {
      console.error('Redis rate limit increment error:', error);
      return this.incrementInMemoryRateLimit(key);
    }
  }

  private getInMemoryRateLimitInfo(key: string): RateLimitInfo {
    // Simple in-memory implementation for fallback
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    // Clean up old entries
    Object.keys(this.memoryStore).forEach(k => {
      if (this.memoryStore[k].timestamp < windowStart) {
        delete this.memoryStore[k];
      }
    });

    const entry = this.memoryStore[key];
    const hits = entry ? entry.count : 0;
    const resetTime = now + this.options.windowMs;
    const remainingHits = Math.max(0, this.options.maxRequests - hits);

    return {
      totalHits: hits,
      resetTime,
      remainingHits
    };
  }

  private incrementInMemoryRateLimit(key: string): RateLimitInfo {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    // Clean up old entries
    Object.keys(this.memoryStore).forEach(k => {
      if (this.memoryStore[k].timestamp < windowStart) {
        delete this.memoryStore[k];
      }
    });

    const entry = this.memoryStore[key];
    if (!entry || entry.timestamp < windowStart) {
      this.memoryStore[key] = { count: 1, timestamp: now };
    } else {
      this.memoryStore[key].count++;
    }

    const hits = this.memoryStore[key].count;
    const resetTime = now + this.options.windowMs;
    const remainingHits = Math.max(0, this.options.maxRequests - hits);

    return {
      totalHits: hits,
      resetTime,
      remainingHits
    };
  }

  private memoryStore: { [key: string]: { count: number; timestamp: number } } = {};

  middleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = this.options.keyGenerator!(req);
      const rateLimitInfo = await this.getRateLimitInfo(key);

      // Add rate limit info to response headers
      res.set({
        'X-RateLimit-Limit': this.options.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimitInfo.remainingHits.toString(),
        'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
        'X-RateLimit-Total': rateLimitInfo.totalHits.toString()
      });

      // Check if limit exceeded
      if (rateLimitInfo.totalHits >= this.options.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(this.options.windowMs / 1000)
        });
      }

      // Store the original res.end to intercept successful responses
      const originalEnd = res.end;
      res.end = (...args: any[]) => {
        if (!this.options.skipSuccessfulRequests) {
          this.incrementRateLimit(key);
        }
        originalEnd.apply(res, args);
      };

      // Store the original res.status to intercept error responses
      const originalStatus = res.status;
      res.status = (code: number) => {
        if (code >= 400 && !this.options.skipFailedRequests) {
          this.incrementRateLimit(key);
        }
        return originalStatus.call(res, code);
      };

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
}

// Create and export the rate limiter instance
export const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  keyGenerator: (req: Request) => {
    // Use IP + path for more granular rate limiting
    return `${req.ip}:${req.path}`;
  }
}).middleware;

// Export the RateLimiter class for custom configurations
export { RateLimiter };