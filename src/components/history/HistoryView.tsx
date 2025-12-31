import React from 'react';
import { Search, ChevronRight, Award } from 'lucide-react';
import { DIVIDEND_HISTORY } from '../../data/mockData';

export const HistoryView: React.FC = () => {
    return (
        <div className="h-full pt-16 px-6 overflow-y-auto pb-32">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-white">History</h1>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Search size={18} className="text-white/60" />
                </div>
            </div>

            <div className="space-y-4">
                {DIVIDEND_HISTORY.map((item, i) => (
                    <div key={item.id}
                        className="group bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/5 flex items-center gap-4 transition-all hover:bg-white/10"
                        style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-black text-white">{item.company}</h3>
                                <span className="text-[10px] font-bold text-white/30 tracking-tighter">{item.date}</span>
                            </div>
                            <p className="text-xs text-emerald-400 font-bold mt-0.5">{item.type}: {item.change} <span
                                className="text-white/40 font-medium">→ {item.result}</span></p>
                        </div>
                        <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                <div className="flex items-center gap-3 mb-2">
                    <Award className="text-emerald-400" size={20} />
                    <p className="text-sm font-black text-white">庭園の称号: 常緑の守り人</p>
                </div>
                <p className="text-[11px] text-emerald-100/60 leading-relaxed">
                    あなたの庭園は過去3ヶ月で4回成長しました。次の増配で「伝説の森」へとレベルアップします。
                </p>
            </div>
        </div>
    );
};
