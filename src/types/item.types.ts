export type ItemCondition = 'Mint' | 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface Item {
    id: string;
    vault_id: string;
    user_id: string;
    name: string;
    description: string;
    category: string;
    image_url: string;
    market_price: number;
    manual_value?: number | null;
    condition: ItemCondition;
    confidence_score: number;
    year?: number;
    country?: string;
    material?: string;
    weight?: string;
    created_at: string;
    updated_at: string;
    last_price_update?: string;
    ignore_market_updates?: boolean;
}

export interface UpdateItemDTO {
    name?: string;
    description?: string;
    vault_id?: string;
    manual_value?: number | null;
    ignore_market_updates?: boolean;
    condition?: ItemCondition;
}
