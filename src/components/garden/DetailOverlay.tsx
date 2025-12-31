import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, ChevronRight, DollarSign, Leaf } from 'lucide-react';
import { Stock } from '../../types';

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

    // Synthesize history data based on current YOC
    // Assuming a simple growth curve ending at current YOC
    const history = [
        { year: '2023', val: Math.max(0, stock.yoc - 1.0).toFixed(1) },
        { year: '2024', val: Math.max(0, stock.yoc - 0.6).toFixed(1) },
        { year: '2025', val: stock.yoc.toFixed(1) },
    ];

    const stats = [
        { label: "増配回数", value: "3回", icon: <Award size={14} /> },
        { label: "累計成長", value: "+1.0%", icon: <TrendingUp size={14} /> },
        { label: "年間配当", value: `¥${stock.dividend.toLocaleString()}`, icon: <DollarSign size={14} /> },
    ];

    return (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-6" onClick={onClose}>
            {/* Card Container */}
            <div
                className={`relative w-full max-w-[340px] transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

                    {/* Snow Effect Layer */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-emerald-200/40 animate-snow"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `-20px`,
                                    animationDuration: `${3 + Math.random() * 4}s`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    fontSize: `${8 + Math.random() * 10}px`
                                }}
                            >
                                ❄
                            </div>
                        ))}
                    </div>

                    <div className="relative p-6">
                        {/* Header: Stock Name and Icon */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-emerald-700 tracking-[0.2em] uppercase">Core Holding</span>
                                <h2 className="text-xl font-black text-slate-900 leading-tight">{stock.name}</h2>
                                <p className="text-xs text-slate-400 font-medium">{stock.symbol}</p>
                            </div>

                            {/* Tree/Leaf Icon with Red Dots */}
                            <div className="relative w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                                <div className="relative">
                                    <Leaf className="text-emerald-600 fill-emerald-600" size={32} />
                                    {/* Red Dots */}
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm animate-pulse" />
                                    <div className="absolute bottom-2 left-0 w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm animate-pulse" />
                                    <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm animate-pulse" />
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
                                        strokeDashoffset={251.2 - (251.2 * stock.yoc) / 10}
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
                            <div className="flex justify-between items-end px-1">
                                {history.map((h, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 w-12">
                                        <span className="text-[10px] font-bold text-emerald-600">{h.val}%</span>
                                        <div
                                            className={`w-full rounded-t-lg transition-all duration-1000 delay-300 ${i === 2 ? 'bg-emerald-500' : 'bg-emerald-200'
                                                }`}
                                            style={{ height: `${Number(h.val) * 10}px` }}
                                        />
                                        <span className="text-[9px] text-slate-400 font-medium">{h.year}</span>
                                    </div>
                                ))}
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
