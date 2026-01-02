import { Stock } from '../../types';
import { getTreeLevel } from '../../utils/treeLevel';

interface TreeItemProps {
    stock: Stock;
    isSelected: boolean;
    onClick: (stock: Stock) => void;
    style: React.CSSProperties;
}

export const TreeItem: React.FC<TreeItemProps> = ({ stock, isSelected, onClick, style }) => {
    const levelInfo = getTreeLevel(stock.yoc);

    // Base size calculation logic - we can keep generic scaling or just fixed sizes?
    // User mentioned "only size differs" before.
    // Let's keep the scaling logic but apply to the image container.
    // Adjusted to fit within ~58px grid cell with padding.
    // Base 35px, max 54px (leaving room for pb-1).
    const size = Math.min(35 + (stock.yoc * 0.8), 54);

    return (
        <button
            onClick={() => onClick(stock)}
            className={`flex flex-col items-center justify-end transition-all duration-500 hover:scale-110 active:scale-90
            ${isSelected ? 'z-30' : 'z-10'} relative group`}
            style={style}
        >
            <div className="h-[58px] w-[58px] flex items-end justify-center pb-1">
                <div
                    className="relative flex items-center justify-center transition-all duration-500"
                    style={{
                        width: `${size}px`,
                        height: `${size}px`
                    }}
                >
                    <img
                        src={levelInfo.image}
                        alt={stock.name}
                        className={`w-full h-full object-contain filter drop-shadow-md transition-all duration-500
                            ${isSelected ? 'brightness-110 drop-shadow-xl' : 'opacity-90'}
                        `}
                    />
                </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 w-[58px] pointer-events-none">
                <span className="text-[8px] font-bold text-slate-400 leading-none w-full text-center truncate">{stock.symbol}</span>
                <span className="text-[9px] font-bold text-slate-600 leading-tight w-full text-center truncate -mt-[1px]">{stock.name}</span>
            </div>
        </button>
    );
};
