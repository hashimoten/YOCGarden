import { Stock, DividendHistoryItem } from '../types';

export const STOCKS: Stock[] = [
    { id: '1', name: '日本たばこ産業', symbol: 'JT', yoc: 4.8, dividend: 13200, shares: 100, avgPrice: 2750, currentPrice: 3800, level: '大木', color: '#10b981' },
    { id: '2', name: '三菱商事', symbol: '8058', yoc: 3.5, dividend: 8500, shares: 100, avgPrice: 2428, currentPrice: 3200, level: '若木', color: '#34d399' },
    { id: '3', name: '三井住友FG', symbol: '8316', yoc: 4.2, dividend: 11000, shares: 100, avgPrice: 2619, currentPrice: 3500, level: '中木', color: '#059669' },
    { id: '4', name: 'KDDI', symbol: '9433', yoc: 3.2, dividend: 7200, shares: 100, avgPrice: 2250, currentPrice: 4000, level: '若木', color: '#6ee7b7' },
    { id: '5', name: 'ソフトバンク', symbol: '9434', yoc: 5.1, dividend: 15400, shares: 1000, avgPrice: 1500, currentPrice: 1800, level: '大木', color: '#047857' },
    { id: '6', name: '商船三井', symbol: '9104', yoc: 6.5, dividend: 22000, shares: 100, avgPrice: 3384, currentPrice: 4500, level: '伝説の木', color: '#064e3b' },
    { id: '7', name: '東京海上HD', symbol: '8766', yoc: 3.8, dividend: 9000, shares: 100, avgPrice: 2368, currentPrice: 2800, level: '若木', color: '#10b981' },
    { id: '8', name: '日本郵政', symbol: '6178', yoc: 4.5, dividend: 12500, shares: 500, avgPrice: 555, currentPrice: 1200, level: '中木', color: '#34d399' },
    { id: '9', name: '武田薬品', symbol: '4502', yoc: 4.0, dividend: 10200, shares: 100, avgPrice: 2550, currentPrice: 4200, level: '中木', color: '#059669' },
    { id: '10', name: '伊藤忠商事', symbol: '8001', yoc: 3.0, dividend: 6800, shares: 100, avgPrice: 2266, currentPrice: 5000, level: '苗木', color: '#6ee7b7' },
];

export const DIVIDEND_HISTORY: DividendHistoryItem[] = [
    { id: 1, date: '2025/12', company: 'JT', type: '増配', change: '+0.6%', result: '4.8%', icon: '🎉' },
    { id: 2, date: '2025/11', company: '三菱商事', type: '増配', change: '+0.3%', result: '3.5%', icon: '📈' },
    { id: 3, date: '2025/10', company: '三井住友FG', type: '増配', change: '+0.2%', result: '4.2%', icon: '🌿' },
    { id: 4, date: '2025/09', company: 'ソフトバンク', type: '増配', change: '+0.5%', result: '5.1%', icon: '✨' },
];
