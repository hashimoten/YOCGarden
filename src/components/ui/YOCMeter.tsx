import React from 'react';

import { Stock } from '../../types';

interface YOCMeterProps {
    stocks: Stock[];
}

export const YOCMeter: React.FC<YOCMeterProps> = ({ stocks }) => {
    // Calculate totals
    const totalDividend = stocks.reduce((sum, stock) => sum + (stock.dividend || 0), 0);
    const totalInvestment = stocks.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);

    // Avoid division by zero
    const portfolioYOC = totalInvestment > 0
        ? (totalDividend / totalInvestment) * 100
        : 0;

    return (
        <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100/50 mb-8">
            <div className="flex justify-between items-end mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Portfolio YOC</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-800">{portfolioYOC.toFixed(1)}</span>
                        <span className="text-xl font-bold text-slate-400">%</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Annual Income</p>
                    <p className="text-lg font-bold text-slate-700">¥{totalDividend.toLocaleString()}</p>
                </div>
            </div>
            <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((portfolioYOC / 5.0) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[9px] font-bold text-slate-300 uppercase">0%</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase">Target 5.0%</span>
                <span className="text-[9px] font-bold text-slate-300 uppercase">7%</span>
            </div>
        </div>
    );
};
