import React from 'react';
import { Search, Crown } from 'lucide-react';
import { Stock } from '../../types';

interface HistoryViewProps {
    stocks: Stock[];
    isLoading: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ stocks, isLoading }) => {

    const calculateAnnualYocAtDate = (stock: Stock, targetDateStr: string, currentAmount: number, diffAmount: number) => {
        // TTM (Trailing Twelve Months) calculation
        // Sum dividends where date is within (targetDate - 1 year, targetDate]

        // Parse target date
        const [tYear, tMonth] = targetDateStr.split(/[\/-]/).map(Number);
        const targetTotalMonths = tYear * 12 + tMonth;

        let ttmDividend = 0;

        (stock.dividendHistory || []).forEach(h => {
            if (!h.dateStr) return;
            const [hYear, hMonth] = h.dateStr.split(/[\/-]/).map(Number);
            const hTotalMonths = hYear * 12 + hMonth;

            // Check if within last 12 months (excluding exactly 12 months ago, including current)
            // e.g. Target 2025/09. We want > 2024/09.
            if (hTotalMonths > targetTotalMonths - 12 && hTotalMonths <= targetTotalMonths) {
                ttmDividend += h.amount;
            }
        });

        // If TTM is 0 (first data point?), fallback to current * frequency?
        // But we usually have history. If not, just use currentAmount.
        if (ttmDividend === 0) ttmDividend = currentAmount;

        const currentYoc = (ttmDividend / stock.avgPrice) * 100;

        // Previous YOC is simply Current - (Increase / Cost)
        // Because Increase is the delta for that specific payment, which adds directly to the annual total delta.
        // (Assuming the comparison payment was exactly 1 year ago and is now replaced by this new amount in the TTM window)
        // Actually, TTM logic: 
        // Old TTM = (Sum of other payments) + Old Payment
        // New TTM = (Sum of other payments) + New Payment
        // Difference = New Payment - Old Payment = diffAmount
        const prevYoc = ((ttmDividend - diffAmount) / stock.avgPrice) * 100;

        return { currentYoc, prevYoc };
    };

    // 1. Flatten all history items with stock data
    const allHistory = stocks.flatMap(stock =>
        (stock.dividendHistory || []).map(item => ({
            ...item,
            stockName: stock.name,
            stockSymbol: stock.symbol,
            avgPrice: stock.avgPrice,
            stockObj: stock, // Pass full stock object
            icon: '🌱'
        }))
    );

    // 2. Filter and Sort
    const increasedHistory = allHistory
        .filter(h => {
            if (!h.isIncrease) return false;
            // Filter by acquisition date
            if (h.stockObj.acquisitionDate) {
                const dividendDate = h.dateStr.replace('/', '-').slice(0, 7);
                const acquisitionMonth = h.stockObj.acquisitionDate.slice(0, 7);
                if (dividendDate < acquisitionMonth) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (!a.dateStr || !b.dateStr) return 0;
            return b.dateStr.localeCompare(a.dateStr);
        });

    const finalHistory = increasedHistory;

    // 3. Calculate counts and Title
    const historyCount = finalHistory.length;
    let title = "庭園の初心者";
    let titleColor = "text-emerald-600";
    let nextLevelText = "次の増配で「常緑の守り人」へレベルアップします。";
    let progress = Math.min((historyCount / 3) * 100, 100);

    if (historyCount >= 6) {
        title = "伝説の森の賢者";
        titleColor = "text-amber-500";
        nextLevelText = "あなたは庭園の全てを知り尽くした賢者です。";
        progress = 100;
    } else if (historyCount >= 3) {
        title = "常緑の守り人";
        titleColor = "text-teal-600";
        nextLevelText = "次の増配で「伝説の森の賢者」へレベルアップします。";
        progress = Math.min(((historyCount - 3) / 3) * 100, 100);
    }

    return (
        <div className="relative h-full flex flex-col items-center pt-10 px-6 pb-6 overflow-hidden">

            {/* Header */}
            <div className="w-full max-w-[400px] flex items-center justify-between mb-6 shrink-0">
                <div>
                    <span className="text-[10px] font-bold text-emerald-400 tracking-[0.2em] uppercase">ACTIVITY LOG</span>
                    <h2 className="text-3xl font-black text-white leading-tight">増配履歴</h2>
                </div>
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <Search size={20} />
                </button>
            </div>

            {/* Scrollable List */}
            <div className="w-full max-w-[400px] flex-1 overflow-y-auto space-y-4 pb-4 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="w-full h-24 bg-white/10 backdrop-blur-md rounded-[2rem] animate-pulse" />
                    ))
                ) : finalHistory.length === 0 ? (
                    <div className="text-center text-white/50 py-10">
                        増配の記録はまだありません
                    </div>
                ) : (
                    finalHistory.map((item, index) => {
                        const diffAmount = item.amount - (item.comparisonAmount || 0);
                        // Calculate Annualized YOC
                        const { currentYoc, prevYoc } = calculateAnnualYocAtDate(item.stockObj, item.dateStr, item.amount, diffAmount);
                        const diffYoc = currentYoc - prevYoc;

                        return (
                            <div key={index} className="w-full bg-white backdrop-blur-xl rounded-[2rem] p-5 flex items-center shadow-lg hover:scale-[1.02] transition-transform">
                                {/* Icon Box */}
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mr-4 shadow-sm">
                                    🎉
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-slate-800 text-lg">{item.stockName}</h3>
                                        <span className="text-xs font-bold text-slate-400">{item.dateStr}</span>
                                    </div>
                                    <div className="flex items-center text-sm font-bold">
                                        <span className="text-emerald-500 flex items-center">
                                            増配: {prevYoc.toFixed(2)}% <span className="text-slate-300 mx-1">→</span> {currentYoc.toFixed(2)}%
                                            <span className="ml-2 text-xs text-emerald-600/70 bg-emerald-100/50 px-1.5 py-0.5 rounded-full">
                                                +{diffYoc.toFixed(2)}%
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="text-emerald-200 ml-2">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Title Card (Fixed Bottom) */}
            {!isLoading && finalHistory.length > 0 && (
                <div className="w-full max-w-[400px] bg-emerald-50 backdrop-blur-xl rounded-[2rem] p-6 mt-4 mb-24 shadow-xl border border-emerald-100 shrink-0">
                    <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 rounded-xl ${historyCount >= 6 ? 'bg-amber-100 text-amber-500' : 'bg-emerald-100 text-emerald-600'} flex items-center justify-center mr-3`}>
                            <Crown size={20} fill="currentColor" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">
                            庭園の称号: <span className={titleColor}>{title}</span>
                        </h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        あなたの庭園は{historyCount}回増配を記録しました。<br />
                        {nextLevelText}
                    </p>
                    {/* Progress Bar */}
                    <div className="mt-4 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${historyCount >= 6 ? 'bg-amber-400' : 'bg-emerald-400'} transition-all duration-1000`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
