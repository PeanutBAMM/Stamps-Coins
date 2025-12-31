export type ItemCategory = 'stamp' | 'coin' | 'other';

export interface AIIdentificationResult {
    name: string;
    description: string;
    category: ItemCategory;
    year?: number;
    country?: string;
    condition_estimate: string;
    confidence: number;
    estimated_value_range?: {
        min: number;
        max: number;
        currency: string;
    };
    metadata?: Record<string, any>;
}

export interface MarketPriceResult {
    price: number;
    currency: string;
    source: string;
    last_updated: string;
    confidence: number;
}

export interface ProcessScanResponse {
    success: boolean;
    itemId?: string;
    identification?: AIIdentificationResult;
    error?: string;
}
