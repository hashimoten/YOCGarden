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
        <div className="relative h-full pt-16 px-4">
            <YOCMeter />

            {/* 3D-like Box Garden Grid */}
            <div className="mt-12 relative aspect-square w-full max-w-[340px] mx-auto bg-white/5 rounded-[2rem] p-4 border border-white/5 shadow-inner">
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-4 p-8 opacity-20 pointer-events-none">
                    {[...Array(25)].map((_, i) => (
                        <div key={i} className="border border-white/20 rounded-lg"></div>
                    ))}
                </div>

                <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-4 p-8 pointer-events-none">
                    {stocks.map((stock) => (
                        <div key={stock.id} className="flex items-center justify-center pointer-events-auto">
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

            <p className="text-center mt-6 text-white/30 text-[10px] font-medium tracking-tighter">
                木をタップして収穫（詳細）を確認
            </p>

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
