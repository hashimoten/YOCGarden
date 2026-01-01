export interface Stock {
    id: string; // Changed to string for easier generation
    name: string;
    symbol: string;
    yoc: number;
    dividend: number;
    shares: number; // Added
    avgPrice: number; // Added
    currentPrice: number; // Added
    dividendHistory: { year: number; amount: number }[]; // Added
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
