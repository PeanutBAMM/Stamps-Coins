import AsyncStorage from '@react-native-async-storage/async-storage';
import { errorService } from './errorService';

const OFFLINE_QUEUE_KEY = 'offline_scan_queue';

export interface PendingScan {
    id: string;
    imageUri: string;
    createdAt: string;
    retryCount: number;
}

/**
 * Offline Queue Service
 * Handles storing and processing scans when network is unavailable.
 */
export const offlineQueueService = {
    /**
     * Add a scan to the offline queue
     */
    async addToQueue(imageUri: string): Promise<string> {
        const pendingScan: PendingScan = {
            id: `scan-${Date.now()}`,
            imageUri,
            createdAt: new Date().toISOString(),
            retryCount: 0,
        };

        try {
            const queue = await this.getQueue();
            queue.push(pendingScan);
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
        } catch (error: any) {
            errorService.handleError(error, 'offlineQueueService.addToQueue', { scanId: pendingScan.id });
        }

        errorService.addBreadcrumb({
            category: 'offline',
            message: `Scan added to offline queue: ${pendingScan.id}`,
        });

        return pendingScan.id;
    },

    /**
     * Get all pending scans from queue
     */
    async getQueue(): Promise<PendingScan[]> {
        try {
            const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error: any) {
            errorService.handleError(error, 'offlineQueueService.getQueue');
            return [];
        }
    },

    /**
     * Remove a scan from queue after successful processing
     */
    async removeFromQueue(scanId: string): Promise<void> {
        try {
            const queue = await this.getQueue();
            const filtered = queue.filter(scan => scan.id !== scanId);
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
        } catch (error: any) {
            errorService.handleError(error, 'offlineQueueService.removeFromQueue', { scanId });
        }
    },

    /**
     * Check if there are pending scans
     */
    async hasPendingScans(): Promise<boolean> {
        const queue = await this.getQueue();
        return queue.length > 0;
    },

    /**
     * Get count of pending scans
     */
    async getPendingCount(): Promise<number> {
        const queue = await this.getQueue();
        return queue.length;
    },

    /**
     * Clear entire queue (e.g., on successful sync)
     */
    async clearQueue(): Promise<void> {
        try {
            await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
        } catch (error: any) {
            errorService.handleError(error, 'offlineQueueService.clearQueue');
        }
    },

    /**
     * Increment retry count for a scan
     */
    async incrementRetry(scanId: string): Promise<void> {
        try {
            const queue = await this.getQueue();
            const updated = queue.map(scan =>
                scan.id === scanId
                    ? { ...scan, retryCount: scan.retryCount + 1 }
                    : scan
            );
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
        } catch (error: any) {
            errorService.handleError(error, 'offlineQueueService.incrementRetry', { scanId });
        }
    },

    /**
     * Remove scans that have exceeded max retries
     */
    async pruneFailedScans(maxRetries: number = 3): Promise<PendingScan[]> {
        const queue = await this.getQueue();
        const failed = queue.filter(scan => scan.retryCount >= maxRetries);
        const remaining = queue.filter(scan => scan.retryCount < maxRetries);
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
        return failed;
    },
};

export default offlineQueueService;
