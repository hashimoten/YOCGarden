import React, { useState, useEffect } from 'react';
import {
    Coins,
    BadgeJapaneseYen,
    X,
    Save,
    Sparkles,
} from 'lucide-react';
import { Stock } from '../../types';
import { getTreeLevel } from '../../utils/treeLevel';
import { MonthPicker } from '../ui/MonthPicker'; // Added

interface EditStockFormProps {
    stock: Stock;
    onClose: () => void;
    onUpdate: (updatedStock: Stock) => void;
}

export const EditStockForm: React.FC<EditStockFormProps> = ({ stock, onClose, onUpdate }) => {
    const [shares, setShares] = useState(stock.shares.toString());
    const [price, setPrice] = useState(stock.avgPrice.toString());
    const [acquisitionDate, setAcquisitionDate] = useState(stock.acquisitionDate || ''); // Added

    // Derived states
    const [estimatedYoc, setEstimatedYoc] = useState(stock.yoc);
    const [estimatedDividend, setEstimatedDividend] = useState(stock.dividend);

    // Calculate annual dividend per share from current total dividend and shares
    // Or we should pass the dividendPerShare if we had it stored.
    // In `App.tsx` we load everything. `stock.dividend` is total.
    // We can infer approx dividend per share: stock.dividend / stock.shares
    // BUT checking `types.ts`, we don't strictly store `dividendPerShare`.
    // Let's infer it or just recalculate based on change ratio? 
    // Safer to infer:
    const dividendPerShare = stock.shares > 0 ? stock.dividend / stock.shares : 0;

    useEffect(() => {
        const numShares = Number(shares);
        const numPrice = Number(price);

        if (numShares > 0 && numPrice > 0 && dividendPerShare > 0) {
            const newTotalDividend = Math.floor(numShares * dividendPerShare);
            const newYoc = (dividendPerShare / numPrice) * 100;

            setEstimatedDividend(newTotalDividend);
            setEstimatedYoc(Number(newYoc.toFixed(2)));
        }
    }, [shares, price, dividendPerShare]);

    const handleSave = () => {
        const numShares = Number(shares);
        const numPrice = Number(price);

        if (numShares <= 0 || numPrice <= 0) return;

        const updatedStock: Stock = {
            ...stock,
            shares: numShares,
            avgPrice: numPrice,
            yoc: estimatedYoc,
            dividend: estimatedDividend,
            acquisitionDate: acquisitionDate // Added
        };

        onUpdate(updatedStock);
        onClose();
    };

    const navLevelInfo = getTreeLevel(estimatedYoc);

    return (
        <div className="fixed inset-0 z-50 bg-[#052e16]/80 backdrop-blur-sm flex flex-col items-center justify-center font-sans" onClick={onClose}>
            <div
                className="relative w-[90%] max-w-[360px] bg-white/95 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] uppercase">Edit Tree</span>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">手入れをする</h2>
                            <p className="text-xs text-slate-400 font-bold mt-1">{stock.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Preview Section */}
                    <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                        <div className="relative w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-50 overflow-hidden">
                            <div className="w-full h-full p-1.5 flex items-center justify-center">
                                <img
                                    src={navLevelInfo.image}
                                    alt="Preview"
                                    className="w-full h-full object-contain filter drop-shadow-sm"
                                />
                            </div>
                            {estimatedYoc !== stock.yoc && (
                                <div className="absolute top-1 right-1">
                                    <Sparkles className="text-amber-400 animate-pulse" size={12} />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Estimated YOC</p>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-black transition-colors ${estimatedYoc > stock.yoc ? 'text-emerald-500' : 'text-slate-700'}`}>
                                    {estimatedYoc}
                                </span>
                                <span className="text-xs font-bold text-slate-400">%</span>
                            </div>
                            <p className="text-[9px] font-bold text-emerald-600/80">
                                {navLevelInfo.englishLabel} ({navLevelInfo.label})
                            </p>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 ml-2">保有株数</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                                    <Coins size={16} />
                                </div>
                                <input
                                    type="number"
                                    value={shares}
                                    onChange={(e) => setShares(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 focus:bg-white focus:border-emerald-500/50 outline-none transition-all text-slate-700 font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 ml-2">平均取得単価</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                                    <BadgeJapaneseYen size={16} />
                                </div>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 focus:bg-white focus:border-emerald-500/50 outline-none transition-all text-slate-700 font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 ml-2">取得年月</label>
                            <MonthPicker
                                value={acquisitionDate}
                                onChange={(dateStr) => setAcquisitionDate(dateStr)} // dateStr is already "YYYY-MM-01"
                                direction="top"
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSave}
                        className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        <Save size={16} /> 保存する
                    </button>

                </div>
            </div>
        </div>
    );
};
