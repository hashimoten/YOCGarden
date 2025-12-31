import { useState, useEffect } from 'react';
import { Leaf, Clock, Plus, Settings, BarChart2 } from 'lucide-react';
import { GardenView } from './components/garden/GardenView';
import { HistoryView } from './components/history/HistoryView';
import { TabButton } from './components/layout/TabButton';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { STOCKS as INITIAL_STOCKS } from './data/mockData';
import { AddStockForm } from './components/add/AddStockForm';
import { Stock } from './types';

function App() {
    const [activeTab, setActiveTab] = useState('garden');
    const [isLoaded, setIsLoaded] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleAddStock = (newStockData: { symbol: string; name: string; quantity: number; avgPrice: number }) => {
        // Basic calculation logic (simplified for now)
        const currentPrice = newStockData.avgPrice * 1.05; // Assume 5% gain for demo
        const yoc = parseFloat(((Math.random() * 3) + 2).toFixed(1)); // Random YOC 2-5%
        const dividend = Math.floor(newStockData.quantity * newStockData.avgPrice * (yoc / 100));

        const newStock: Stock = {
            id: String(Date.now()),
            symbol: newStockData.symbol,
            name: newStockData.name,
            yoc: yoc,
            dividend: dividend,
            shares: newStockData.quantity,
            avgPrice: newStockData.avgPrice,
            currentPrice: currentPrice,
        };

        setStocks([...stocks, newStock]);
        // Switch to garden to see the new tree
        setActiveTab('garden');
    };

    const onAddTabClick = () => {
        setShowAddForm(true);
    };

    return (
        <div className="relative w-full h-screen bg-[#052e16] text-white overflow-hidden font-sans">
            <BackgroundEffects />

            {/* Main View Container */}
            <div className={`h-full transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} >
                {activeTab === 'garden' && <GardenView stocks={stocks} />}
                {activeTab === 'history' && <HistoryView />}
                {(activeTab === 'settings' || activeTab === 'stats') && (
                    <div className="flex items-center justify-center h-full text-white/40 font-black tracking-widest uppercase">
                        Coming Soon
                    </div>
                )}
            </div>

            {/* Add Stock Form Modal */}
            {showAddForm && (
                <AddStockForm
                    onClose={() => setShowAddForm(false)}
                    onAdd={handleAddStock}
                />
            )}

            {/* iOS Style Frosted Tab Bar */}
            <div className="absolute bottom-6 left-0 w-full px-6 flex justify-center z-50">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-[2rem] h-16 px-6 flex items-center justify-between shadow-2xl w-full max-w-[340px]">
                    <TabButton icon={<Leaf size={24} />} label="Garden" active={activeTab === 'garden'} onClick={() => setActiveTab('garden')} />
                    <TabButton icon={<Clock size={24} />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />

                    {/* Add Button - Special Styling */}
                    <button
                        onClick={onAddTabClick}
                        className="relative -top-5 bg-emerald-500 text-white p-4 rounded-full shadow-[0_8px_16px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={32} className="text-emerald-950" strokeWidth={3} />
                    </button>

                    <TabButton icon={<BarChart2 size={24} />} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <TabButton icon={<Settings size={24} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>
            </div>
        </div>
    );
}

export default App;
