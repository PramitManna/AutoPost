import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getOptimizationStats } from '@/lib/cost-optimizer';

export async function GET() {
  try {
    const redis = getRedisClient();
    const optimizationStats = getOptimizationStats();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0-optimized',
      services: {
        redis: {
          available: !!redis,
          type: process.env.RAILWAY_REDIS_URL ? 'Railway (Production)' : 
                process.env.UPSTASH_REDIS_REST_URL ? 'Upstash (Development)' : 'None',
          status: redis ? 'connected' : 'fallback'
        },
        gemini: {
          available: !!process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          status: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
        },
        cloudinary: {
          available: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
          autoCleanup: process.env.AUTO_DELETE_IMAGES === 'true',
          status: (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) ? 'configured' : 'missing'
        },
        meta: {
          available: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
          status: (process.env.META_APP_ID && process.env.META_APP_SECRET) ? 'configured' : 'missing'
        }
      },
      costOptimization: {
        enabled: process.env.COST_OPTIMIZATION_ENABLED === 'true',
        cacheHitRate: `${optimizationStats.hitRate}%`,
        totalRequests: optimizationStats.totalRequests,
        estimatedSavings: `$${optimizationStats.estimatedCostSaved.toFixed(2)}`,
        performance: optimizationStats.isOptimal ? 'optimal' : 'needs_improvement',
        recommendation: optimizationStats.recommendation
      },
      deployment: {
        environment: process.env.NODE_ENV || 'development',
        readyForProduction: (
          !!redis && 
          !!process.env.GEMINI_API_KEY && 
          !!process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.COST_OPTIMIZATION_ENABLED === 'true'
        ),
        estimatedCapacity: redis ? (
          process.env.RAILWAY_REDIS_URL ? '5000+ users' : '100 users (Upstash free tier)'
        ) : '50 users (memory only)',
        monthlyCost: process.env.RAILWAY_REDIS_URL ? '$5-12' : '$0 (limited scale)'
      }
    };

    // Test Redis connection
    if (redis) {
      try {
        if ('ping' in redis && typeof redis.ping === 'function') {
          await redis.ping();
          health.services.redis.status = 'connected';
        }
      } catch (error) {
        health.services.redis.status = 'error';
        console.warn('Redis ping failed:', (error as Error).message);
      }
    }

    const statusCode = health.deployment.readyForProduction ? 200 : 206; // 206 = Partial Content

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache',
        'X-Health-Check': 'autopost-v2',
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
      services: {
        redis: { status: 'unknown' },
        gemini: { status: 'unknown' },
        cloudinary: { status: 'unknown' },
        meta: { status: 'unknown' }
      }
    }, { status: 500 });
  }
}
