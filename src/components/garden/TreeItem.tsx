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
    // Base size 40px + some scaling.
    const size = 40 + (stock.yoc * 4);

    return (
        <button
            onClick={() => onClick(stock)}
            className={`flex flex-col items-center transition-all duration-500 hover:scale-110 active:scale-90
            ${isSelected ? 'z-30' : 'z-10'} relative`}
            style={style}
        >
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
            {isSelected && (
                <div
                    className="absolute -bottom-6 bg-white text-emerald-950 text-[8px] px-2 py-0.5 rounded-full font-black whitespace-nowrap shadow-xl">
                    {stock.symbol}
                </div>
            )}
        </button>
    );
};
