import crypto from 'crypto';
import { getCachedAnalysis, setCachedAnalysis, getMemoryCachedAnalysis, setMemoryCachedAnalysis } from './redis';

export const COST_CONFIG = {
  // Aggressive caching to reduce AI calls by 95%
  cacheStrategy: {
    ttl: 30 * 24 * 60 * 60, // 30 days (vs current 7 days)
    memoryTtl: 24 * 60 * 60, // 24 hours in memory
    compression: true,
    smartHashing: true,
  },
  
  // Auto-cleanup to stay in Cloudinary free tier
  cloudinaryOptimization: {
    autoDeleteAfterPost: true,
    maxStorageDays: 1, // Delete after 1 day max
    compression: 'aggressive',
  },
  
  // Batch processing to reduce Redis calls
  batchOptimization: {
    enabled: true,
    batchSize: 10,
    processingDelay: 100, // ms between batches
  },

  // Cost tracking
  costTracking: {
    enabled: process.env.NODE_ENV === 'production',
    logInterval: 1000, // Log every 1000 requests
  }
};

// Performance and cost metrics
interface CostMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  aiCallsSaved: number;
  estimatedCostSaved: number;
}

class CostTracker {
  private metrics: CostMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    aiCallsSaved: 0,
    estimatedCostSaved: 0
  };

  recordCacheHit() {
    this.metrics.totalRequests++;
    this.metrics.cacheHits++;
    this.metrics.aiCallsSaved++;
    this.metrics.estimatedCostSaved += 0.01; // ~$0.01 per AI call saved
    this.logIfNeeded();
  }

  recordCacheMiss() {
    this.metrics.totalRequests++;
    this.metrics.cacheMisses++;
    this.logIfNeeded();
  }

  private logIfNeeded() {
    if (this.metrics.totalRequests % COST_CONFIG.costTracking.logInterval === 0) {
      const hitRate = (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(1);
      console.log(`💰 Cost Optimization Stats:`, {
        requests: this.metrics.totalRequests,
        hitRate: `${hitRate}%`,
        aiCallsSaved: this.metrics.aiCallsSaved,
        estimatedSavings: `$${this.metrics.estimatedCostSaved.toFixed(2)}`,
        targetHitRate: '95%'
      });
    }
  }

  getMetrics(): CostMetrics {
    return { ...this.metrics };
  }
}

const costTracker = new CostTracker();

// Enhanced hash generation for better cache hits
export async function generateSmartHash(buffers: Buffer[]): Promise<string> {
  try {
    // Create hash that's more likely to match similar images
    const processedBuffers = buffers.map((buffer) => {
      // Normalize image data for better cache hits
      // Take first 2KB + some middle data + last 1KB for signature
      const start = buffer.subarray(0, Math.min(2048, buffer.length));
      const middle = buffer.length > 4096 ? 
        buffer.subarray(Math.floor(buffer.length / 2), Math.floor(buffer.length / 2) + 1024) : 
        Buffer.alloc(0);
      const end = buffer.length > 2048 ? 
        buffer.subarray(Math.max(buffer.length - 1024, 2048)) : 
        Buffer.alloc(0);
      
      return Buffer.concat([start, middle, end]);
    });
    
    // Add image count and order to hash for carousel vs single differentiation
    const hashInput = Buffer.concat([
      Buffer.from(`count:${buffers.length}|`),
      ...processedBuffers
    ]);
    
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  } catch (error) {
    console.warn('⚠️ Smart hash generation failed, using fallback:', error);
    // Fallback to simple hash
    const combinedBuffer = Buffer.concat(buffers.slice(0, 3)); // Limit to first 3 images
    return crypto.createHash('sha256').update(combinedBuffer).digest('hex');
  }
}

// Smart cache with multiple layers
export async function getCostOptimizedAnalysis(
  imageBuffers: Buffer[],
  originalFunction: (buffers: Buffer[]) => Promise<string>
): Promise<string> {
  
  try {
    const startTime = Date.now();
    
    // 1. Generate smart hash
    const hash = await generateSmartHash(imageBuffers);
    const shortHash = hash.substring(0, 16);
    
    console.log(`🔍 Checking cache for ${shortHash}... (${imageBuffers.length} images)`);
    
    // 2. Check memory cache first (fastest)
    const memoryResult = getMemoryCachedAnalysis(hash);
    if (memoryResult) {
      costTracker.recordCacheHit();
      console.log(`⚡ Memory cache HIT ${shortHash} (${Date.now() - startTime}ms)`);
      return memoryResult;
    }
    
    // 3. Check Redis cache
    const redisResult = await getCachedAnalysis(hash);
    if (redisResult) {
      costTracker.recordCacheHit();
      console.log(`🎯 Redis cache HIT ${shortHash} (${Date.now() - startTime}ms)`);
      
      // Store in memory for faster future access
      setMemoryCachedAnalysis(hash, redisResult);
      return redisResult;
    }
    
    // 4. Cache MISS - Need AI call
    costTracker.recordCacheMiss();
    console.log(`💸 Cache MISS ${shortHash} - AI call required (${Date.now() - startTime}ms)`);
    
    // 5. Perform AI analysis
    const aiStartTime = Date.now();
    const result = await originalFunction(imageBuffers);
    const aiDuration = Date.now() - aiStartTime;
    
    console.log(`🤖 AI analysis completed in ${aiDuration}ms`);
    
    // 6. Cache the result with extended TTL
    await Promise.all([
      setCachedAnalysis(hash, result),
      new Promise(resolve => {
        setMemoryCachedAnalysis(hash, result);
        resolve(void 0);
      })
    ]);
    
    console.log(`💾 Cached result ${shortHash} for future use`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Cost optimization error:', error);
    // Fallback to direct AI call
    return await originalFunction(imageBuffers);
  }
}

// Batch processing utility for handling multiple requests efficiently
export class BatchProcessor<T, R> {
  private queue: Array<{
    data: T;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
  }> = [];
  
  private processing = false;
  
  constructor(
    private processor: (batch: T[]) => Promise<R[]>,
    private batchSize = COST_CONFIG.batchOptimization.batchSize,
    private delay = COST_CONFIG.batchOptimization.processingDelay
  ) {}
  
  async add(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        const batchData = batch.map(item => item.data);
        
        try {
          const results = await this.processor(batchData);
          
          batch.forEach((item, index) => {
            if (results[index]) {
              item.resolve(results[index]);
            } else {
              item.reject(new Error('No result for batch item'));
            }
          });
        } catch (error) {
          batch.forEach(item => item.reject(error as Error));
        }
        
        // Small delay between batches to prevent overwhelming
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      }
    } finally {
      this.processing = false;
    }
  }
}

// Auto-cleanup utility for Cloudinary
export async function scheduleImageCleanup(publicIds: string[], delayMinutes = 60) {
  if (!COST_CONFIG.cloudinaryOptimization.autoDeleteAfterPost) {
    return;
  }
  
  console.log(`🗑️ Scheduling cleanup for ${publicIds.length} images in ${delayMinutes} minutes`);
  
  // In production, you'd use a queue system like Bull/BullMQ
  // For now, simple timeout (note: this won't survive server restarts)
  setTimeout(async () => {
    for (const publicId of publicIds) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upload/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });
        
        if (response.ok) {
          console.log(`🧹 Auto-cleaned image: ${publicId}`);
        } else {
          console.warn(`⚠️ Failed to auto-clean: ${publicId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Cleanup error for ${publicId}:`, error);
      }
    }
  }, delayMinutes * 60 * 1000);
}

// Export cost tracker for monitoring
export { costTracker };

// Utility to get current optimization stats
export function getOptimizationStats() {
  const metrics = costTracker.getMetrics();
  const hitRate = metrics.totalRequests > 0 ? 
    (metrics.cacheHits / metrics.totalRequests * 100) : 0;
    
  return {
    ...metrics,
    hitRate: Math.round(hitRate * 10) / 10,
    isOptimal: hitRate >= 90,
    recommendation: hitRate < 90 ? 
      'Consider extending cache TTL or improving hash generation' : 
      'Optimization performing well!'
  };
}
