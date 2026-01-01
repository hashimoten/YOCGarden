import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, ChevronRight, DollarSign } from 'lucide-react';
import { Stock } from '../../types';

import { getTreeLevel } from '../../utils/treeLevel';

interface DetailOverlayProps {
    stock: Stock;
    onClose: () => void;
}

export const DetailOverlay: React.FC<DetailOverlayProps> = ({ stock, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Entrance animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // Determine tree level
    const levelInfo = getTreeLevel(stock.yoc);

    // Use real dividend history
    // We expect history to be sorted or we sort it year descending or ascending?
    // Let's take the last 3 entries if available.
    const sortedHistory = [...(stock.dividendHistory || [])].sort((a, b) => a.year - b.year);
    const recentHistory = sortedHistory.slice(-3);

    // Normalize for bar height (max height around 50px or relative)
    // Actually the mock used hardcoded height based on value.
    // Let's just use the raw amount for display and scale bar height.
    const maxAmount = Math.max(...recentHistory.map(h => h.amount), 1);

    const stats = [
        { label: "増配回数", value: "-", icon: <Award size={14} /> },
        { label: "累計成長", value: "-", icon: <TrendingUp size={14} /> },
        { label: "年間配当", value: `¥${stock.dividend.toLocaleString()}`, icon: <DollarSign size={14} /> },
    ];

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
                                <span className="text-[10px] font-bold text-emerald-700 tracking-[0.2em] uppercase">{levelInfo.englishLabel}</span>
                                <div className="flex items-end gap-2">
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{stock.name}</h2>
                                    <span className="text-[10px] text-slate-400 font-bold mb-1">({levelInfo.label})</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">{stock.symbol}</p>
                            </div>

                            {/* Tree/Leaf Icon based on Level */}
                            <div className="relative w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 overflow-hidden">
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
                        <div className="flex items-center gap-6 mb-8">
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
                                        strokeDashoffset={251.2 - (251.2 * Math.min(stock.yoc, 100)) / 100 * 251.2}
                                        // Fix progress calc: (251.2 * stock.yoc) / 10 is odd.
                                        // If YOC is 5%, we want 5% filled? Or relative to some target?
                                        // Let's assume max 20% for full circle for visual impact, otherwise 5% looks tiny.
                                        // Actually let's just make it proportional to 10% for now.
                                        className="text-emerald-500 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-slate-400 font-bold">YOC</span>
                                    <span className="text-xl font-black text-slate-800">{stock.yoc}%</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            {stat.icon}
                                            <span className="text-[10px] font-medium">{stat.label}</span>
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

                        {/* Action Buttons */}
                        <button className="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200">
                            ポートフォリオ詳細へ <ChevronRight size={14} />
                        </button>
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
        </div>
    );
};
