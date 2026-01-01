import React from 'react';
import { Search, ChevronRight, Award } from 'lucide-react';
import { DIVIDEND_HISTORY } from '../../data/mockData';

export const HistoryView: React.FC = () => {
    return (
        <div className="relative h-full flex flex-col items-center justify-center p-6">

            {/* Main White Card Container */}
            <div className="relative w-full max-w-[400px] bg-white/95 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col h-full max-h-[85vh]">

                {/* Internal Snow Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-emerald-200/40 animate-snow"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-20px`,
                                animationDuration: `${5 + Math.random() * 5}s`,
                                animationDelay: `${Math.random() * 2}s`,
                                fontSize: `${10 + Math.random() * 10}px`
                            }}
                        >
                            ❄
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="p-8 pb-4 relative z-10 shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <span className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] uppercase">Activity Log</span>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">履歴</h2>
                        </div>
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                            <Search size={18} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-24 relative z-10 space-y-4">

                    {/* History Items */}
                    <div className="space-y-3">
                        {DIVIDEND_HISTORY.map((item, i) => (
                            <div key={item.id}
                                className="group bg-slate-50 border border-slate-100 rounded-3xl p-4 flex items-center gap-4 transition-all hover:bg-white hover:shadow-md hover:border-emerald-100"
                                style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-lg shadow-sm border border-slate-100">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xs font-black text-slate-700">{item.company}</h3>
                                        <span className="text-[9px] font-bold text-slate-400 tracking-tighter">{item.date}</span>
                                    </div>
                                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">{item.type}: {item.change} <span
                                        className="text-slate-400 font-medium">→ {item.result}</span></p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                            </div>
                        ))}
                    </div>

                    {/* Achievement Card */}
                    <div className="mt-6 p-5 bg-emerald-50 border border-emerald-100 rounded-3xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-emerald-100 rounded-lg">
                                <Award className="text-emerald-500" size={16} />
                            </div>
                            <p className="text-xs font-black text-emerald-900">庭園の称号: 常緑の守り人</p>
                        </div>
                        <p className="text-[10px] text-emerald-700/70 leading-relaxed font-medium">
                            あなたの庭園は過去3ヶ月で4回成長しました。次の増配で「伝説の森」へとレベルアップします。
                        </p>
                    </div>
                </div>

                {/* Bottom Fade Gradient for scroll */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
            </div>
        </div>
    );
};
