/**
 * Supabase Query Optimization Utilities
 * Provides caching, select optimization, and query batching helpers.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorService } from './errorService';

const CACHE_PREFIX = 'supabase_cache_';
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

/**
 * Query optimization configuration per table
 * Defines which columns to select by default to minimize data transfer
 */
export const OPTIMIZED_SELECTS = {
    items: 'id, vault_id, user_id, name, description, category, image_url, manual_value, market_price, condition, confidence_score, year, country, material, weight, created_at, updated_at, last_price_update, ignore_market_updates',
    items_list: 'id, vault_id, user_id, name, description, category, image_url, manual_value, market_price, condition, confidence_score, created_at, updated_at',
    items_value: 'id, manual_value, market_price',
    vaults: 'id, name, type, icon, color, created_at',
    vaults_with_count: 'id, name, type, icon, color, items:items(count)',
    profiles: 'id, username, pro_status, region, currency, item_count',
    portfolio_history: 'id, total_value, date',
};

export const queryOptimizer = {
    /**
     * Get data from cache if valid, otherwise return null
     */
    async getFromCache<T>(key: string): Promise<T | null> {
        try {
            const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
            if (!cached) return null;

            const entry: CacheEntry<T> = JSON.parse(cached);
            const isExpired = Date.now() - entry.timestamp > entry.ttl;

            if (isExpired) {
                await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
                return null;
            }

            errorService.addBreadcrumb({
                category: 'cache',
                message: `Cache hit: ${key}`,
            });

            return entry.data;
        } catch {
            return null;
        }
    },

    /**
     * Store data in cache with TTL
     */
    async setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): Promise<void> {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                ttl: ttlMs,
            };
            await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
        } catch (error) {
            console.warn('Cache write failed:', error);
        }
    },

    /**
     * Invalidate cache for a specific key or pattern
     */
    async invalidateCache(keyPattern: string): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const matchingKeys = keys.filter(k =>
                k.startsWith(CACHE_PREFIX) && k.includes(keyPattern)
            );
            await AsyncStorage.multiRemove(matchingKeys);
        } catch (error) {
            console.warn('Cache invalidation failed:', error);
        }
    },

    /**
     * Clear all Supabase cache
     */
    async clearAllCache(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
            await AsyncStorage.multiRemove(cacheKeys);
        } catch (error) {
            console.warn('Cache clear failed:', error);
        }
    },

    /**
     * Get optimized select for a table
     */
    getOptimizedSelect(table: keyof typeof OPTIMIZED_SELECTS): string {
        return OPTIMIZED_SELECTS[table] || '*';
    },

    /**
     * Wrap a query function with caching
     */
    async withCache<T>(
        cacheKey: string,
        queryFn: () => Promise<T>,
        ttlMs: number = DEFAULT_TTL_MS
    ): Promise<T> {
        // Try cache first
        const cached = await this.getFromCache<T>(cacheKey);
        if (cached !== null) return cached;

        // Execute query
        const result = await queryFn();

        // Store in cache
        await this.setCache(cacheKey, result, ttlMs);

        return result;
    },
};

export default queryOptimizer;
