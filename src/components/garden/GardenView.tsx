import React, { useState } from 'react';
import { YOCMeter } from '../ui/YOCMeter';
import { TreeItem } from './TreeItem';
import { DetailOverlay } from './DetailOverlay';
import { Stock } from '../../types';

interface GardenViewProps {
    stocks: Stock[];
}

export const GardenView: React.FC<GardenViewProps> = ({ stocks }) => {
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    return (
        <div className="relative h-full flex flex-col items-center justify-center p-6">

            {/* Main White Card Container */}
            <div className="relative w-full max-w-[400px] bg-white/95 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">

                {/* Header Section */}
                <div className="p-8 pb-0">
                    <span className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] uppercase">My Garden</span>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight mb-6">資産の箱庭</h2>

                    <YOCMeter stocks={stocks} />
                </div>

                {/* Garden Grid Section */}
                <div className="relative w-full aspect-square mt-[-20px]">
                    {/* Internal Snow Effect (reused for consistency) */}
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

                    <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-3 p-8">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-3 p-8 opacity-10 pointer-events-none">
                            {[...Array(25)].map((_, i) => (
                                <div key={i} className="border border-slate-900/20 rounded-lg"></div>
                            ))}
                        </div>

                        {stocks.map((stock) => (
                            <div key={stock.id} className="flex items-center justify-center pointer-events-auto z-10">
                                <TreeItem
                                    stock={stock}
                                    isSelected={selectedStock?.id === stock.id}
                                    onClick={setSelectedStock}
                                    style={{}}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center pb-8 text-slate-300 text-[10px] font-medium tracking-wide">
                    Tap tree to harvest
                </p>
            </div>

            {/* Detail Overlay Component */}
            {selectedStock && (
                <DetailOverlay
                    stock={selectedStock}
                    onClose={() => setSelectedStock(null)}
                />
            )}
        </div>
    );
};
