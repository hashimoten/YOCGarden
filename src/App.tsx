import { useState, useEffect } from 'react';
import { Leaf, Clock, Plus, Settings, BarChart2 } from 'lucide-react';
import { GardenView } from './components/garden/GardenView';
import { HistoryView } from './components/history/HistoryView';
import { TabButton } from './components/layout/TabButton';
import { BackgroundEffects } from './components/layout/BackgroundEffects';
import { STOCKS as INITIAL_STOCKS } from './data/mockData';
import { AddStockForm } from './components/add/AddStockForm';
import { Stock } from './types';
import { LevelUpOverlay } from './components/levelup/LevelUpOverlay';
import { StatsView } from './components/stats/StatsView';

import { supabase } from './lib/supabase';

function App() {
    const [activeTab, setActiveTab] = useState('garden');
    const [isLoaded, setIsLoaded] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    // Start with empty or mock? Plan says use fetched data. Let's start with empty.
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpQueue, setLevelUpQueue] = useState<any[]>([]);
    const [levelUpData, setLevelUpData] = useState({
        stockName: '',
        stockCode: '',
        oldYoc: 0,
        newYoc: 0,
        dividendIncrease: 0
    });

    useEffect(() => {
        const fetchStocks = async () => {
            try {
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
                        acquisitionDate: s.acquisition_date, // Mapped from DB
                        sector: s.sector, // Mapped from DB
                        dividendHistory: (s.dividend_history || []).map((h: any) => ({
                            dateStr: h.date_str || '', // Fallback to empty string
                            amount: Number(h.amount),
                            comparisonAmount: h.comparison_amount,
                            isIncrease: h.is_increase,
                            changePct: h.change_pct
                        })).filter((h: any) => h.dateStr) // Filter out invalid dates
                        ,
                        // Legacy/UI fields (calculate or default)
                        level: '若木', // Determine level logic here if needed
                        color: '#34d399' // Assign random or specific color
                    }));
                    setStocks(mappedStocks);

                    try {
                        checkForLevelUps(mappedStocks);
                    } catch (e) {
                        console.error('Error checking for level ups:', e);
                    }
                }
            } catch (err) {
                console.error('Unexpected error in fetchStocks:', err);
                setStocks(INITIAL_STOCKS); // Fallback
            } finally {
                setIsLoaded(true);
            }
        };

        const checkForLevelUps = (currentStocks: Stock[]) => {
            const newQueue: any[] = [];

            currentStocks.forEach(stock => {
                if (!stock.dividendHistory || stock.dividendHistory.length === 0) return;

                // Sort history by date descending to get latest
                const sortedHistory = [...stock.dividendHistory].sort((a, b) => {
                    if (!a.dateStr || !b.dateStr) return 0;
                    return b.dateStr.localeCompare(a.dateStr);
                });
                const latest = sortedHistory[0];

                if (latest && latest.isIncrease) {
                    const uniqueKey = `seen_increase_${stock.symbol}_${latest.dateStr}`;
                    const hasSeen = localStorage.getItem(uniqueKey);

                    if (!hasSeen) {
                        // Calculate data for overlay
                        const currentYoc = stock.yoc;
                        // changePct is like 0.1 for 10%. 
                        // oldYoc = currentYoc / (1 + changePct)
                        // If changePct is missing, try estimation
                        let oldYoc = currentYoc;
                        if (latest.changePct) {
                            // changePct from yfinance might be percentage (e.g. 5.0 for 5%) or decimal. 
                            // Usually yfinance returns small decimal? No, `pct_change()` is decimal. 
                            // Let's rely on stored value. logic: new = old * (1 + pct). old = new / (1 + pct)
                            // Wait, let's use comparisonAmount if reliable.
                        }

                        if (latest.comparisonAmount && stock.avgPrice) {
                            // YOC = (Dividend / AvgPrice) * 100
                            // OldDividendPerShare = comparisonAmount
                            oldYoc = (latest.comparisonAmount / stock.avgPrice) * 100;
                        }

                        const increaseAmountPerShare = (latest.amount - (latest.comparisonAmount || 0));
                        const totalIncrease = Math.floor(increaseAmountPerShare * stock.shares);

                        newQueue.push({
                            stockName: stock.name,
                            stockCode: stock.symbol,
                            oldYoc: oldYoc,
                            newYoc: currentYoc,
                            dividendIncrease: totalIncrease,
                            uniqueKey: uniqueKey // Store key to mark as seen later
                        });
                    }
                }
            });

            if (newQueue.length > 0) {
                setLevelUpQueue(prev => [...prev, ...newQueue]);
            }
        };

        fetchStocks();
    }, []);

    // Process Queue
    useEffect(() => {
        if (!showLevelUp && levelUpQueue.length > 0) {
            const nextItem = levelUpQueue[0];
            setLevelUpData(nextItem);
            setShowLevelUp(true);

            // Mark as seen immediately so we don't show again if reloaded
            localStorage.setItem(nextItem.uniqueKey, 'true');
        }
    }, [showLevelUp, levelUpQueue]);

    const handleCloseLevelUp = () => {
        setShowLevelUp(false);
        setLevelUpQueue(prev => prev.slice(1)); // Remove processed item
    };

    const handleSkipAll = () => {
        // Mark all remaining items as seen to prevent them from showing on next reload
        levelUpQueue.forEach(item => {
            if (item.uniqueKey) {
                localStorage.setItem(item.uniqueKey, 'true');
            }
        });

        setShowLevelUp(false);
        setLevelUpQueue([]);
    };

    const handleAddStock = (newStockData: {
        id: string; // Added id
        symbol: string;
        name: string;
        quantity: number;
        avgPrice: number;
        yoc: number;
        dividendPerShare: number;
        acquisitionDate: string;
        sector?: string;
        dividendHistory: any[];
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
            acquisitionDate: newStockData.acquisitionDate,
            sector: newStockData.sector,
            dividendHistory: newStockData.dividendHistory
        };

        setStocks([...stocks, newStock]);
        // Switch to garden to see the new tree
        setActiveTab('garden');
    };

    const handleDeleteStock = async (id: string) => {
        // Optimistic update
        const previousStocks = [...stocks];
        setStocks(stocks.filter(s => s.id !== id));

        const { error } = await supabase
            .from('stocks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting stock:', error);
            // Revert on error
            setStocks(previousStocks);
            alert('削除に失敗しました');
        }
    };

    const handleUpdateStock = async (updatedStock: Stock) => {
        // Optimistic update
        const previousStocks = [...stocks];
        setStocks(stocks.map(s => s.id === updatedStock.id ? updatedStock : s));

        const { error } = await supabase
            .from('stocks')
            .update({
                shares: updatedStock.shares,
                avg_price: updatedStock.avgPrice,
                yoc: updatedStock.yoc,
                dividend: updatedStock.dividend,
                acquisition_date: updatedStock.acquisitionDate // Added
            })
            .eq('id', updatedStock.id);

        if (error) {
            console.error('Error updating stock:', error);
            // Revert on error
            setStocks(previousStocks);
            alert('更新に失敗しました');
        }
    };

    const onAddTabClick = () => {
        setShowAddForm(true);
    };

    return (
        <div className="relative w-full h-screen bg-[#052e16] text-white overflow-hidden font-sans">
            <BackgroundEffects />

            {/* Main View Container */}
            <div className={`h-full transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} >
                {activeTab === 'garden' && (
                    <GardenView
                        stocks={stocks}
                        onDelete={handleDeleteStock}
                        onUpdate={handleUpdateStock}
                    />
                )}
                {activeTab === 'history' && <HistoryView stocks={stocks} isLoading={!isLoaded} />}
                {activeTab === 'stats' && <StatsView stocks={stocks} />}
                {activeTab === 'settings' && (
                    <div className="flex flex-col items-center justify-center h-full text-white/40 font-black tracking-widest uppercase gap-4">
                        <span>Coming Soon</span>
                        <button
                            onClick={() => {
                                setLevelUpData({
                                    stockName: '日本たばこ産業',
                                    stockCode: '2914',
                                    oldYoc: 4.2,
                                    newYoc: 4.8,
                                    dividendIncrease: 1200
                                });
                                setShowLevelUp(true);
                            }}
                            className="px-4 py-2 bg-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                        >
                            Test Level Up
                        </button>
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

            {/* Level Up Overlay */}
            <LevelUpOverlay
                isVisible={showLevelUp}
                onClose={handleCloseLevelUp}
                onSkipAll={handleSkipAll}
                remainingCount={Math.max(0, levelUpQueue.length - 1)}
                {...levelUpData}
            />
        </div>
    );
}

export default App;
