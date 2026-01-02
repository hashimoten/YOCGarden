import React, { useState, useRef } from 'react';
import { YOCMeter } from '../ui/YOCMeter';
import { TreeItem } from './TreeItem';
import { DetailOverlay } from './DetailOverlay';
import { Stock } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GardenViewProps {
    stocks: Stock[];
    onDelete: (id: string) => void;
    onUpdate: (stock: Stock) => void;
}

export const GardenView: React.FC<GardenViewProps> = ({ stocks, onDelete, onUpdate }) => {
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const selectedStock = stocks.find(s => s.id === selectedStockId) || null;

    const totalPages = Math.ceil(Math.max(stocks.length, 1) / 20);

    const scrollToPage = (pageIndex: number) => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.offsetWidth;
            scrollContainerRef.current.scrollTo({
                left: pageIndex * width,
                behavior: 'smooth'
            });
            setCurrentPage(pageIndex);
        }
    };

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

                <div className="relative w-full aspect-[5/4] mt-[-20px] group">
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

                    {/* Horizontal Scroll Container */}
                    <div
                        ref={scrollContainerRef}
                        className="absolute inset-0 overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex scrollbar-hide no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onScroll={(e) => {
                            const scrollLeft = e.currentTarget.scrollLeft;
                            const width = e.currentTarget.offsetWidth;
                            const page = Math.round(scrollLeft / width);
                            setCurrentPage(page);
                        }}
                    >
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div key={pageIndex} className="min-w-full h-full snap-center relative grid grid-cols-5 grid-rows-4 gap-6 p-8">
                                {/* Grid Lines for this page */}
                                <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-6 p-8 opacity-10 pointer-events-none">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="border border-slate-900/20 rounded-lg"></div>
                                    ))}
                                </div>

                                {/* Stocks for this page */}
                                {stocks.slice(pageIndex * 20, (pageIndex + 1) * 20).map((stock) => (
                                    <div key={stock.id} className="flex items-center justify-center pointer-events-auto z-10">
                                        <TreeItem
                                            stock={stock}
                                            isSelected={selectedStockId === stock.id}
                                            onClick={(s) => setSelectedStockId(s.id)}
                                            style={{}}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="relative flex items-center justify-center gap-4 pb-6 px-8 mt-2">
                    {totalPages > 1 && (
                        <>
                            <button
                                onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                                disabled={currentPage === 0}
                                className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 transition-all ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-emerald-100 active:scale-95'}`}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => scrollToPage(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-emerald-500 w-4' : 'bg-slate-200 w-2 hover:bg-emerald-200'}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => scrollToPage(Math.min(totalPages - 1, currentPage + 1))}
                                disabled={currentPage === totalPages - 1}
                                className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 transition-all ${currentPage === totalPages - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-emerald-100 active:scale-95'}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </>
                    )}
                </div>

                <p className="text-center pb-8 text-slate-300 text-[10px] font-medium tracking-wide">
                    Tap tree to harvest
                </p>

            </div>

            {/* Detail Overlay Component */}
            {selectedStock && (
                <DetailOverlay
                    stock={selectedStock}
                    onClose={() => setSelectedStockId(null)}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
};
