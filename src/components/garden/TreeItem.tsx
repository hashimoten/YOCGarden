import React from 'react';
import { TreePine } from 'lucide-react';
import { Stock } from '../../types';

interface TreeItemProps {
    stock: Stock;
    isSelected: boolean;
    onClick: (stock: Stock) => void;
    style: React.CSSProperties;
}

export const TreeItem: React.FC<TreeItemProps> = ({ stock, isSelected, onClick, style }) => {
    return (
        <button
            onClick={() => onClick(stock)}
            className={`flex flex-col items-center transition-all duration-500 hover:scale-110 active:scale-90
            ${isSelected ? 'z-30' : 'z-10'} relative`}
            style={style}
        >
            <div className="relative">
                {/* Tree visual height based on YOC */}
                <TreePine
                    size={20 + (stock.yoc * 6)}
                    className={`${isSelected ? 'text-white' : 'text-emerald-500/80'} transition-colors filter drop-shadow-md`}
                    style={{ opacity: 0.7 + (stock.yoc / 20) }}
                />
                {stock.yoc > 5 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-sm" />
                )}
            </div>
            {isSelected && (
                <div
                    className="absolute -bottom-6 bg-white text-emerald-950 text-[8px] px-2 py-0.5 rounded-full font-black whitespace-nowrap shadow-xl">
                    {stock.symbol}
                </div>
            )}
        </button>
    );
};
