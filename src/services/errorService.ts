import * as Sentry from '@sentry/react-native';

export type ErrorCategory = 'network' | 'auth' | 'scan' | 'payment' | 'database' | 'unknown';

interface BreadcrumbData {
    category: string;
    message: string;
    data?: Record<string, any>;
}

/**
 * Error Service - Centralized error handling with Sentry integration
 */
export const errorService = {
    /**
     * Capture and report an exception to Sentry
     */
    captureException(error: Error, category: ErrorCategory = 'unknown', extras?: Record<string, any>) {
        console.error(`[${category}] Error:`, error.message);

        Sentry.withScope((scope) => {
            scope.setTag('error_category', category);
            if (extras) {
                scope.setExtras(extras);
            }
            Sentry.captureException(error);
        });
    },

    /**
     * Set the current user for error tracking
     */
    setUser(userId: string | null, email?: string) {
        if (userId) {
            Sentry.setUser({
                id: userId,
                email: email,
            });
        } else {
            Sentry.setUser(null);
        }
    },

    /**
     * Add a breadcrumb for error context
     */
    addBreadcrumb({ category, message, data }: BreadcrumbData) {
        Sentry.addBreadcrumb({
            category,
            message,
            data,
            level: 'info',
        });
    },

    /**
     * Categorize an error based on its properties
     */
    categorizeError(error: Error): ErrorCategory {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
            return 'network';
        }
        if (message.includes('auth') || message.includes('session') || message.includes('token')) {
            return 'auth';
        }
        if (message.includes('scan') || message.includes('camera') || message.includes('image')) {
            return 'scan';
        }
        if (message.includes('payment') || message.includes('purchase') || message.includes('subscription')) {
            return 'payment';
        }
        if (message.includes('supabase') || message.includes('database') || message.includes('query')) {
            return 'database';
        }

        return 'unknown';
    },

    /**
     * Log and capture a categorized error
     */
    handleError(error: Error, context?: string) {
        const category = this.categorizeError(error);
        this.captureException(error, category, { context });
    },
};

export default errorService;
