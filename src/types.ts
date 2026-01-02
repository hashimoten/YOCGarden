export interface Stock {
    id: string; // Changed to string for easier generation
    name: string;
    symbol: string;
    yoc: number;
    dividend: number;
    shares: number; // Added
    avgPrice: number; // Added
    currentPrice: number; // Added
    acquisitionDate?: string; // Added: YYYY-MM-DD
    sector?: string; // Added
    dividendHistory: {
        dateStr: string;
        amount: number;
        comparisonAmount?: number;
        isIncrease?: boolean;
        changePct?: number;
    }[];
    // Optional/Legacy fields
    level?: string;
    color?: string;
}

export interface DividendHistoryItem {
    id: number;
    date: string;
    company: string;
    type: string;
    change: string;
    result: string;
    icon: string;
}
