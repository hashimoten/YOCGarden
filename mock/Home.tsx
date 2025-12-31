import React, { useState, useEffect } from 'react';
import {
TreePine,
History,
Plus,
Settings,
TrendingUp,
ChevronRight,
Award,
DollarSign,
Leaf,
BarChart3,
Search
} from 'lucide-react';

// --- Mock Data ---
const STOCKS = [
{ id: 1, name: '日本たばこ産業', symbol: 'JT', yoc: 4.8, dividend: 13200, level: '大木', color: '#10b981' },
{ id: 2, name: '三菱商事', symbol: '8058', yoc: 3.5, dividend: 8500, level: '若木', color: '#34d399' },
{ id: 3, name: '三井住友FG', symbol: '8316', yoc: 4.2, dividend: 11000, level: '中木', color: '#059669' },
{ id: 4, name: 'KDDI', symbol: '9433', yoc: 3.2, dividend: 7200, level: '若木', color: '#6ee7b7' },
{ id: 5, name: 'ソフトバンク', symbol: '9434', yoc: 5.1, dividend: 15400, level: '大木', color: '#047857' },
{ id: 6, name: '商船三井', symbol: '9104', yoc: 6.5, dividend: 22000, level: '伝説の木', color: '#064e3b' },
{ id: 7, name: '東京海上HD', symbol: '8766', yoc: 3.8, dividend: 9000, level: '若木', color: '#10b981' },
{ id: 8, name: '日本郵政', symbol: '6178', yoc: 4.5, dividend: 12500, level: '中木', color: '#34d399' },
{ id: 9, name: '武田薬品', symbol: '4502', yoc: 4.0, dividend: 10200, level: '中木', color: '#059669' },
{ id: 10, name: '伊藤忠商事', symbol: '8001', yoc: 3.0, dividend: 6800, level: '苗木', color: '#6ee7b7' },
];

const DIVIDEND_HISTORY = [
{ id: 1, date: '2025/12', company: 'JT', type: '増配', change: '+0.6%', result: '4.8%', icon: '🎉' },
{ id: 2, date: '2025/11', company: '三菱商事', type: '増配', change: '+0.3%', result: '3.5%', icon: '📈' },
{ id: 3, date: '2025/10', company: '三井住友FG', type: '増配', change: '+0.2%', result: '4.2%', icon: '🌿' },
{ id: 4, date: '2025/09', company: 'ソフトバンク', type: '増配', change: '+0.5%', result: '5.1%', icon: '✨' },
];

const App = () => {
const [activeTab, setActiveTab] = useState('garden');
const [selectedStock, setSelectedStock] = useState(null);
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
setIsLoaded(true);
}, []);

// --- Components ---

const YOCMeter = () => (
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

const GardenView = () => (
<div className="relative h-full pt-16 px-4">
    <YOCMeter />

    {/* 3D-like Box Garden Grid */}
    <div
        className="mt-12 relative aspect-square w-full max-w-[340px] mx-auto bg-white/5 rounded-[2rem] p-4 border border-white/5 shadow-inner">
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-4 p-8 opacity-20 pointer-events-none">
            {[...Array(25)].map((_, i) => (
            <div key={i} className="border border-white/20 rounded-lg"></div>
            ))}
        </div>

        {/* Randomly Placed Trees */}
        {STOCKS.map((stock, i) => (
        <button key={stock.id} onClick={()=> setSelectedStock(stock)}
            className={`absolute flex flex-col items-center transition-all duration-500 hover:scale-110 active:scale-90
            ${selectedStock?.id === stock.id ? 'z-30' : 'z-10'}`}
            style={{
            left: `${15 + (i % 3) * 30 + (Math.random() * 5)}%`,
            top: `${15 + Math.floor(i / 3) * 20 + (Math.random() * 5)}%`,
            }}
            >
            <div className="relative">
                {/* Tree visual height based on YOC */}
                <TreePine size={20 + (stock.yoc * 6)} className={`${selectedStock?.id===stock.id ? 'text-white'
                    : 'text-emerald-500/80' } transition-colors filter drop-shadow-md`} style={{ opacity: 0.7 +
                    (stock.yoc / 20) }} />
                {stock.yoc > 5 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-sm" />
                )}
            </div>
            {selectedStock?.id === stock.id && (
            <div
                className="absolute -bottom-6 bg-white text-emerald-950 text-[8px] px-2 py-0.5 rounded-full font-black whitespace-nowrap shadow-xl">
                {stock.symbol}
            </div>
            )}
        </button>
        ))}
    </div>

    <p className="text-center mt-6 text-white/30 text-[10px] font-medium tracking-tighter">
        木をタップして収穫（詳細）を確認
    </p>

    {/* Detail Overlay Component */}
    {selectedStock && (
    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={()=> setSelectedStock(null)}
        >
        <div className="absolute bottom-24 right-6 w-80 bg-white rounded-[2.5rem] shadow-2xl p-6 transition-all animate-in slide-in-from-bottom-4 duration-500"
            onClick={e=> e.stopPropagation()}
            >
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <span
                        className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">{selectedStock.symbol}</span>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedStock.name}</h2>
                </div>
                <div
                    className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                    <Leaf className="text-emerald-600 fill-emerald-600" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Yield on Cost</p>
                    <p className="text-xl font-black text-emerald-600">{selectedStock.yoc}%<span
                            className="text-xs ml-0.5">↑</span></p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold mb-1 uppercase tracking-tighter">Dividends</p>
                    <p className="text-xl font-black text-slate-800">¥{selectedStock.dividend.toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                    <span className="font-bold uppercase tracking-widest">Growth History</span>
                    <BarChart3 size={12} />
                </div>
                <div className="flex items-end gap-1.5 h-16 px-1">
                    {[3.8, 4.2, 4.8].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-full rounded-t-md transition-all duration-1000 ${i===2 ? 'bg-emerald-500'
                            : 'bg-emerald-100' }`} style={{ height: `${val * 12}px` }} />
                        <span className="text-[8px] text-slate-400 font-bold">{2023 + i}</span>
                    </div>
                    ))}
                </div>
            </div>

            <button
                className="w-full mt-6 bg-slate-950 text-white py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-200">
                詳細を表示
                <ChevronRight size={14} />
            </button>
        </div>
    </div>
    )}
</div>
);

const HistoryView = () => (
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

return (
<div className="relative w-full h-screen bg-[#052e16] text-white overflow-hidden font-sans">
    {/* Dynamic Background Effects */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[100px]" />

        {/* Subtle CSS Snowflakes */}
        <style dangerouslySetInnerHTML={{ __html: ` @keyframes snow { 0% { transform: translateY(-10px) translateX(0); }
            100% { transform: translateY(100vh) translateX(15px); } } .snow-particle { position: absolute; background:
            white; border-radius: 50%; pointer-events: none; animation: snow linear infinite; } `}} />
        {[...Array(15)].map((_, i) => (
        <div key={i} className="snow-particle" style={{ width: `${Math.random() * 3 + 1}px`, height: `${Math.random() *
            3 + 1}px`, left: `${Math.random() * 100}%`, top: `-10px`, opacity: Math.random() * 0.4, animationDuration:
            `${10 + Math.random() * 10}s`, animationDelay: `${Math.random() * 5}s` }} />
        ))}
    </div>

    {/* Main View Container */}
    <div className={`h-full transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0' }`}>
        {activeTab === 'garden' &&
        <GardenView />}
        {activeTab === 'history' &&
        <HistoryView />}
        {(activeTab === 'add' || activeTab === 'settings') && (
        <div className="flex items-center justify-center h-full text-white/40 font-black tracking-widest uppercase">
            Coming Soon
        </div>
        )}
    </div>

    {/* iOS Style Frosted Tab Bar */}
    <div className="absolute bottom-0 left-0 w-full px-6 pb-8 pt-2">
        <div
            className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] h-18 py-3 px-6 flex justify-between items-center shadow-2xl">
            <TabButton active={activeTab==='garden' } onClick={()=> setActiveTab('garden')}
                icon={
                <TreePine size={24} />}
                label="箱庭"
                />
                <TabButton active={activeTab==='history' } onClick={()=> setActiveTab('history')}
                    icon={
                    <History size={24} />}
                    label="履歴"
                    />
                    <div className="relative -top-6">
                        <button onClick={()=> setActiveTab('add')}
                            className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg
                            shadow-emerald-500/40 active:scale-90 transition-transform"
                            >
                            <Plus size={32} className="text-emerald-950" />
                        </button>
                    </div>
                    <TabButton active={activeTab==='stats' } onClick={()=> setActiveTab('stats')}
                        icon={
                        <TrendingUp size={24} />}
                        label="分析"
                        />
                        <TabButton active={activeTab==='settings' } onClick={()=> setActiveTab('settings')}
                            icon={
                            <Settings size={24} />}
                            label="設定"
                            />
        </div>
    </div>
</div>
);
};

const TabButton = ({ icon, label, active, onClick }) => (
<button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-400'
    : 'text-white/30' }`}>
    <div className={active ? 'scale-110' : '' }>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-40' }`}>
        {label}
    </span>
</button>
);

export default App;