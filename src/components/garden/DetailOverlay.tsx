import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, ChevronRight, DollarSign, Pencil, Trash2, HelpCircle, Sparkles } from 'lucide-react';
import { Stock } from '../../types';

import { getTreeLevel, TREE_LEVELS, TreeLevelInfo } from '../../utils/treeLevel';
import { EditStockForm } from '../edit/EditStockForm';

interface DetailOverlayProps {
    stock: Stock;
    onClose: () => void;
    onDelete: (id: string) => void;
    onUpdate: (stock: Stock) => void;
}

export const DetailOverlay: React.FC<DetailOverlayProps> = ({ stock, onClose, onDelete, onUpdate }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        // Entrance animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Determine tree level
    const levelInfo = getTreeLevel(stock.yoc);

    // Use real dividend history and aggregate by year
    const aggregatedHistory: { [year: number]: number } = {};
    (stock.dividendHistory || []).forEach(h => {
        // Derive year from dateStr if available, otherwise ignore
        if (h.dateStr) {
            const year = parseInt(h.dateStr.split('/')[0]);
            if (!isNaN(year)) {
                aggregatedHistory[year] = (aggregatedHistory[year] || 0) + h.amount;
            }
        }
    });

    // Convert to array and sort
    const chartHistory = Object.keys(aggregatedHistory)
        .map(year => ({ year: parseInt(year), amount: aggregatedHistory[parseInt(year)] }))
        .sort((a, b) => a.year - b.year); // Ascending for chart (Left to Right)

    const recentHistory = chartHistory.slice(-5);

    // Normalize for bar height (max height around 50px or relative)
    const maxAmount = Math.max(...recentHistory.map(h => h.amount), 1);

    // Calculate dividend increase count (Consecutive increases in the visible window)
    let increaseCount = 0;
    if (recentHistory.length > 1) {
        for (let i = 1; i < recentHistory.length; i++) {
            const current = recentHistory[i].amount;
            const prev = recentHistory[i - 1].amount;
            if (current > prev) {
                increaseCount++;
            } else if (current < prev) {
                increaseCount = 0; // Reset on decrease
            }
        }
    }

    // Calculate Current Yield and Growth
    const dividendPerShare = stock.shares > 0 ? stock.dividend / stock.shares : 0;
    const currentYield = stock.currentPrice > 0 ? (dividendPerShare / stock.currentPrice) * 100 : 0;
    const yieldGrowth = stock.yoc - currentYield;

    const stats = [
        {
            label: "増配回数",
            value: `${increaseCount}回`,
            icon: <Award size={14} />,
            tooltip: "直近5年間で連続して配当が増加した回数（減配でリセット・維持は継続）"
        },
        {
            label: "現在利回り",
            value: `${currentYield.toFixed(2)}%`,
            icon: <TrendingUp size={14} />,
            tooltip: "現在の株価で購入した場合の配当利回り"
        },
        {
            label: "利回り成長",
            value: `${yieldGrowth >= 0 ? '+' : ''}${yieldGrowth.toFixed(2)}%`,
            icon: <Sparkles size={14} />,
            tooltip: "取得時利回り(YOC)と現在利回りの差。保有し続けることで得られた利回りの上乗せ分。"
        },
        { label: "年間配当", value: `¥${stock.dividend.toLocaleString()}`, icon: <DollarSign size={14} /> },
    ];

    const handleDelete = () => {
        if (window.confirm('本当にこの木を伐採しますか？')) {
            onDelete(stock.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-6" onClick={onClose}>
            {/* ... (wrapper) ... */}
            <div
                className={`relative w-full max-w-[340px] transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

                    {/* ... (snow effect and header) ... */}
                    {/* (Preserving header structure, just replacing the content logic below) */}

                    <div className="relative p-6">
                        {/* Header: Stock Name and Icon */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-700 tracking-[0.2em] uppercase">{levelInfo.englishLabel}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">({levelInfo.label})</span>
                                </div>
                                <h2 className={`${stock.name.length > 20 ? 'text-sm' : stock.name.length > 10 ? 'text-lg' : 'text-xl'} font-black text-slate-900 leading-tight`}>{stock.name}</h2>
                                <p className="text-xs text-slate-400 font-medium">{stock.symbol}</p>
                            </div>

                            {/* Tree/Leaf Icon based on Level */}
                            <div className="relative w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 overflow-hidden shrink-0">
                                <div className="relative w-full h-full p-2">
                                    <img
                                        src={levelInfo.image}
                                        alt={levelInfo.label}
                                        className="w-full h-full object-contain filter drop-shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Main Section: YOC Circular Progress */}
                        {/* Main Section: YOC Circular Progress */}
                        <div className="flex items-center gap-6 mb-8">
                            {/* Calculate Next Level Progress */}
                            {(() => {
                                const sortedLevels = (Object.values(TREE_LEVELS) as TreeLevelInfo[]).sort((a, b) => a.threshold - b.threshold);
                                const nextLevelInfo = sortedLevels.find(l => l.threshold > stock.yoc);
                                const nextThreshold = nextLevelInfo ? nextLevelInfo.threshold : stock.yoc; // Max if no next
                                // Progress relative to next threshold (0% to Next%) e.g. 4.75% / 5.0% = 95%
                                const progressPercent = nextLevelInfo ? Math.min((stock.yoc / nextThreshold) * 100, 100) : 100;
                                const remaining = nextLevelInfo ? (nextThreshold - stock.yoc).toFixed(2) : '0';

                                return (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r="40"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    className="text-slate-100"
                                                />
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r="40"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    strokeDasharray={251.2}
                                                    strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                                                    className="text-emerald-500 transition-all duration-1000 ease-out"
                                                    strokeLinecap="round"
                                                />
                                            </svg>

                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">YOC</span>
                                                <span className="text-xl font-black text-slate-800 leading-none">{stock.yoc}%</span>
                                            </div>
                                        </div>

                                        {/* Next Level Indicator - Outside */}
                                        {nextLevelInfo ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] font-bold text-slate-400">
                                                    Next: {nextLevelInfo.label}
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5">
                                                    あと {remaining}%
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-bold text-amber-500 mt-1">
                                                MAX LEVEL
                                            </span>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="flex-1 space-y-3">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400 relative group cursor-help">
                                            {stat.icon}
                                            <span className="text-[10px] font-medium">{stat.label}</span>
                                            {stat.tooltip && (
                                                <>
                                                    <HelpCircle size={10} className="text-slate-300 ml-0.5" />
                                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-xl">
                                                        {stat.tooltip}
                                                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800">
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Growth History: Bar Chart */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dividend History</p>
                            <div className="flex justify-between items-end px-1 h-24 border-b border-slate-100 pb-2">
                                {recentHistory.length > 0 ? recentHistory.map((h, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 w-16 group">
                                        <span className="text-[9px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">¥{h.amount}</span>
                                        <div
                                            className={`w-8 rounded-t-lg transition-all duration-1000 delay-300 ${i === recentHistory.length - 1 ? 'bg-emerald-500' : 'bg-emerald-200'}`}
                                            style={{ height: `${Math.max((h.amount / maxAmount) * 60, 4)}px` }}
                                        />
                                        <span className="text-[9px] text-slate-400 font-medium">{h.year}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-300 w-full text-center">No history data</p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons (Bottom Layout) */}
                        <div className="flex items-center gap-3 mt-6">
                            <button className="flex-1 bg-slate-900 text-white h-12 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200">
                                ポートフォリオ詳細へ <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setShowEditForm(true)}
                                className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors active:scale-95 outline-none"
                            >
                                <Pencil size={18} />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors active:scale-95 outline-none"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes snow {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(280px) rotate(360deg); opacity: 0; }
        }
        .animate-snow {
          animation: snow linear infinite;
        }
      `}} />

            {showEditForm && (
                <EditStockForm
                    stock={stock}
                    onClose={() => setShowEditForm(false)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
};
