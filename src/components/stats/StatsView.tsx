import React, { useMemo } from 'react';
import { Stock } from '../../types';
import JP_SECTOR_MAP from '../../data/jp_sector_map.json';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface StatsViewProps {
    stocks: Stock[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

export const StatsView: React.FC<StatsViewProps> = ({ stocks }) => {
    // Sector Translations
    const SECTOR_TRANSLATIONS: { [key: string]: string } = {
        'Technology': '情報通信',
        'Information Technology': '情報通信',
        'Consumer Cyclical': '一般消費財',
        'Consumer Defensive': '生活必需品',
        'Financial Services': '金融',
        'Healthcare': 'ヘルスケア',
        'Communication Services': '通信サービス',
        'Energy': 'エネルギー',
        'Industrials': '資本財',
        'Basic Materials': '素材',
        'Real Estate': '不動産',
        'Utilities': '公益事業',
        'Unknown': '不明'
    };

    const translateSector = (sector: string) => SECTOR_TRANSLATIONS[sector] || sector;

    // 1. Sector Allocation Data (Market Value)
    const sectorData = useMemo(() => {
        const sectorMap: { [key: string]: number } = {};
        let unknownValue = 0;

        stocks.forEach(stock => {
            const value = stock.currentPrice * stock.shares;

            // Try lookup using JP_SECTOR_MAP
            // Remove .T if present
            const cleanCode = stock.symbol.replace('.T', '');
            const jpSector = (JP_SECTOR_MAP as Record<string, string>)[cleanCode];

            if (jpSector) {
                sectorMap[jpSector] = (sectorMap[jpSector] || 0) + value;
            } else if (stock.sector) {
                const translated = translateSector(stock.sector);
                sectorMap[translated] = (sectorMap[translated] || 0) + value;
            } else {
                unknownValue += value;
            }
        });

        const data = Object.entries(sectorMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        if (unknownValue > 0) {
            data.push({ name: '不明', value: unknownValue });
        }
        return data;
    }, [stocks]);

    // 2. Dividend History (Annual)
    const dividendHistoryData = useMemo(() => {
        const yearMap: { [key: string]: number } = {};

        stocks.forEach(stock => {
            if (stock.dividendHistory) {
                stock.dividendHistory.forEach(history => {
                    if (history.dateStr) {
                        // Filter by acquisition date if available
                        if (stock.acquisitionDate) {
                            const dividendMonth = history.dateStr.replace('/', '-').slice(0, 7); // "YYYY-MM"
                            const acquisitionMonth = stock.acquisitionDate.slice(0, 7); // "YYYY-MM"
                            if (dividendMonth < acquisitionMonth) {
                                return; // Skip this dividend
                            }
                        }

                        // dateStr format is usually YYYY/MM-DD or YYYY-MM-DD. 
                        // Map YYYY/MM to YYYY.
                        const year = history.dateStr.substring(0, 4);
                        // Assuming shares were constant (MVP limitation)
                        // If we want real historical income, we need historical shares. 
                        // For stats view, using current shares * historical dividend is a common approximation for "Projected vs Historical Unit"
                        // OR we just sum the raw amounts if they are per-share? 
                        // history.amount is usually Dividend Per Share. 
                        // So we multiply by current shares.
                        const totalAmount = history.amount * stock.shares;
                        yearMap[year] = (yearMap[year] || 0) + totalAmount;
                    }
                });
            }
        });

        // Convert to array and sort by year
        return Object.entries(yearMap)
            .map(([year, amount]) => ({ year, amount }))
            .sort((a, b) => a.year.localeCompare(b.year))
            // Limit to recent years? or all? Let's show all available but maybe start from acquisition?
            // User requirement: "Yearly dividend transition"
            // Filter out invalid years if any
            .filter(d => !isNaN(Number(d.year)));
    }, [stocks]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
    };

    return (
        <div className="h-full w-full overflow-y-auto pb-32 pt-10 px-6">
            <h1 className="text-3xl font-black text-emerald-100 mb-8 tracking-tight">
                統計情報
                <span className="block text-sm font-normal text-emerald-500/60 mt-2">ポートフォリオ分析</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Sector Allocation */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                        セクター比率
                        <span className="text-xs font-normal text-white/40 ml-auto">評価額</span>
                    </h2>

                    <div className="h-[300px] w-full">
                        {sectorData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sectorData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {sectorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                        contentStyle={{ backgroundColor: '#064e3b', borderColor: '#059669', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value, entry: any) => <span className="text-white/70 ml-1">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/20">データなし</div>
                        )}
                    </div>
                </div>

                {/* Dividend History */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        配当履歴
                        <span className="text-xs font-normal text-white/40 ml-auto">年間合計 (予想)</span>
                    </h2>

                    <div className="h-[300px] w-full">
                        {dividendHistoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dividendHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        stroke="#ffffff60"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#ffffff60"
                                        fontSize={12}
                                        tickFormatter={(value) => {
                                            if (value === 0) return '¥0';
                                            if (value >= 10000) return `¥${(value / 10000).toFixed(1).replace(/\.0$/, '')}万`;
                                            return `¥${value.toLocaleString()}`;
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <RechartsTooltip
                                        formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#064e3b', borderColor: '#059669', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/20">No Data</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
