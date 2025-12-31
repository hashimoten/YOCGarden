import React from 'react';

export const YOCMeter: React.FC = () => {
    return (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl">
            <div className="flex justify-between items-end mb-3">
                <div>
                    <p className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase mb-1">Portfolio YOC</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white">4.5</span>
                        <span className="text-xl font-bold text-white/70">%</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1">Annual Income</p>
                    <p className="text-lg font-bold text-white">¥124,500</p>
                </div>
            </div>
            <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-emerald-400 to-white rounded-full transition-all duration-1000"
                    style={{ width: '64%' }} />
                <div className="absolute top-0 right-[36%] w-1 h-full bg-white/40" />
            </div>
            <div className="flex justify-between mt-2">
                <span className="text-[9px] font-bold text-white/30 uppercase">0%</span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase">Target 5.0%</span>
                <span className="text-[9px] font-bold text-white/30 uppercase">7%</span>
            </div>
        </div>
    );
};
