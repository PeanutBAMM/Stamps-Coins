import { offlineQueueService, PendingScan } from '../offlineQueueService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock errorService
jest.mock('../errorService', () => ({
    errorService: { addBreadcrumb: jest.fn() },
}));

describe('offlineQueueService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addToQueue', () => {
        it('should add scan to queue and return ID', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const id = await offlineQueueService.addToQueue('file:///test.jpg');

            expect(id).toContain('scan-');
            expect(AsyncStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('getQueue', () => {
        it('should return empty array when queue is empty', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const queue = await offlineQueueService.getQueue();

            expect(queue).toEqual([]);
        });

        it('should return parsed queue when data exists', async () => {
            const mockQueue: PendingScan[] = [
                { id: 'scan-1', imageUri: 'file:///test.jpg', createdAt: '2024-01-01', retryCount: 0 },
            ];
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));

            const queue = await offlineQueueService.getQueue();

            expect(queue.length).toBe(1);
            expect(queue[0].id).toBe('scan-1');
        });
    });

    describe('removeFromQueue', () => {
        it('should remove specific scan from queue', async () => {
            const mockQueue: PendingScan[] = [
                { id: 'scan-1', imageUri: 'file:///1.jpg', createdAt: '2024-01-01', retryCount: 0 },
                { id: 'scan-2', imageUri: 'file:///2.jpg', createdAt: '2024-01-02', retryCount: 0 },
            ];
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));

            await offlineQueueService.removeFromQueue('scan-1');

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                'offline_scan_queue',
                expect.not.stringContaining('scan-1')
            );
        });
    });

    describe('hasPendingScans', () => {
        it('should return true when queue has items', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[{"id":"scan-1"}]');

            const hasPending = await offlineQueueService.hasPendingScans();

            expect(hasPending).toBe(true);
        });

        it('should return false when queue is empty', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const hasPending = await offlineQueueService.hasPendingScans();

            expect(hasPending).toBe(false);
        });
    });

    describe('pruneFailedScans', () => {
        it('should remove scans exceeding max retries', async () => {
            const mockQueue: PendingScan[] = [
                { id: 'scan-1', imageUri: 'file:///1.jpg', createdAt: '2024-01-01', retryCount: 3 },
                { id: 'scan-2', imageUri: 'file:///2.jpg', createdAt: '2024-01-02', retryCount: 1 },
            ];
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));

            const failed = await offlineQueueService.pruneFailedScans(3);

            expect(failed.length).toBe(1);
            expect(failed[0].id).toBe('scan-1');
        });
    });
});
