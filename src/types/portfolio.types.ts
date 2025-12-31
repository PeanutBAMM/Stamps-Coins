export interface PortfolioHistory {
    id: string;
    user_id: string;
    total_value: number;
    date: string; // ISO date string YYYY-MM-DD
}

export interface AssetPerformance {
    item_id: string;
    name: string;
    image_url: string | null;
    current_value: number;
    change_percentage: number; // 24h change
    change_value: number; // 24h change in currency
}

export interface PortfolioSummary {
    total_value: number;
    change_24h_value: number;
    change_24h_percentage: number;
}
