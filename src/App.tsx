import { useState, useEffect } from 'react';
import { Leaf, Clock, Plus, Settings, BarChart2 } from 'lucide-react';
import { GardenView } from './components/garden/GardenView';
import { HistoryView } from './components/history/HistoryView';
import { TabButton } from './components/layout/TabButton';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { STOCKS as INITIAL_STOCKS } from './data/mockData';
import { AddStockForm } from './components/add/AddStockForm';
import { Stock } from './types';

import { supabase } from './lib/supabase';

function App() {
    const [activeTab, setActiveTab] = useState('garden');
    const [isLoaded, setIsLoaded] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    // Start with empty or mock? Plan says use fetched data. Let's start with empty.
    const [stocks, setStocks] = useState<Stock[]>([]);

    useEffect(() => {
        const fetchStocks = async () => {
            const { data, error } = await supabase
                .from('stocks')
                .select('*, dividend_history(*)');

            if (error) {
                console.error('Error fetching stocks:', error);
                // Fallback to mock data if fetch fails (e.g. no connection)
                setStocks(INITIAL_STOCKS);
            } else if (data) {
                const mappedStocks: Stock[] = data.map((s: any) => ({
                    id: s.id,
                    symbol: s.symbol,
                    name: s.name,
                    // Parse numeric types as they might come as strings from DB or numbers
                    shares: Number(s.shares),
                    avgPrice: Number(s.avg_price),
                    yoc: Number(s.yoc),
                    dividend: Number(s.dividend),
                    currentPrice: Number(s.current_price || s.avg_price), // Fallback
                    dividendHistory: (s.dividend_history || []).map((h: any) => ({
                        year: h.year,
                        amount: Number(h.amount)
                    })),
                    // Legacy/UI fields (calculate or default)
                    level: '若木', // Determine level logic here if needed
                    color: '#34d399' // Assign random or specific color
                }));
                setStocks(mappedStocks);
            }
            setIsLoaded(true);
        };

        fetchStocks();
    }, []);

    const handleAddStock = (newStockData: {
        id: string; // Added id
        symbol: string;
        name: string;
        quantity: number;
        avgPrice: number;
        yoc: number;
        dividendPerShare: number;
        dividendHistory: { year: number; amount: number }[];
    }) => {
        // Use real values
        const currentPrice = newStockData.avgPrice; // Simplified
        const yoc = newStockData.yoc;
        const dividend = Math.floor(newStockData.quantity * newStockData.dividendPerShare);

        const newStock: Stock = {
            id: newStockData.id, // Use passed id
            symbol: newStockData.symbol,
            name: newStockData.name,
            yoc: yoc,
            dividend: dividend,
            shares: newStockData.quantity,
            avgPrice: newStockData.avgPrice,
            currentPrice: currentPrice,
            dividendHistory: newStockData.dividendHistory
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
