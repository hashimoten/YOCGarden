import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    PlusCircle,
    TreePine,
    Coins,
    BadgeJapaneseYen,
    X,
    Sparkles,
    Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { STOCK_LIST, StockOption } from '../../data/stockList';
import { getTreeLevel } from '../../utils/treeLevel';
import { MonthPicker } from '../ui/MonthPicker'; // Added

export interface AddStockFormProps {
    onClose: () => void;
    onAdd: (stock: {
        id: string; // Added id to the stock object
        symbol: string;
        name: string;
        quantity: number;
        avgPrice: number;
        yoc: number;
        dividendPerShare: number;
        acquisitionDate: string;
        sector?: string;
        dividendHistory: any[];
    }) => void;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        shares: '',
        price: '',
        acquisitionDate: new Date().toISOString().split('T')[0] // Default to today
    });
    // Unified search input text
    const [searchText, setSearchText] = useState('');

    const [estimatedYoc, setEstimatedYoc] = useState(0);
    const [annualDividend, setAnnualDividend] = useState(0);
    const [dividendHistory, setDividendHistory] = useState<any[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [fetchedMetadata, setFetchedMetadata] = useState<{ sector?: string }>({});

    // Auto-complete states
    const [suggestions, setSuggestions] = useState<StockOption[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef<HTMLDivElement>(null);

    // Fetching state
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        setIsVisible(true);

        // Handle clicking outside suggestions
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // YOC Calculation based on fetched data
    useEffect(() => {
        const price = Number(formData.price);
        if (price > 0 && annualDividend > 0) {
            const yoc = (annualDividend / price) * 100;
            setEstimatedYoc(Number(yoc.toFixed(2)));
        } else {
            setEstimatedYoc(0);
        }
    }, [formData.price, annualDividend]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'search') {
            setSearchText(value);
            setShowSuggestions(true);

            // Clear selected stock if user types again
            if (formData.code) {
                setFormData(prev => ({ ...prev, code: '', name: '' }));
                setAnnualDividend(0);
                setFetchError('');
                setFetchedMetadata({}); // Clear fetched metadata
            }

            if (value.length > 0) {
                // Filter by Code OR Name (limit 5)
                const matches = STOCK_LIST.filter(s =>
                    s.code.startsWith(value) || s.name.includes(value)
                ).slice(0, 5);
                setSuggestions(matches);
            } else {
                setSuggestions([]);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const fetchStockData = async (code: string) => {
        setIsFetching(true);
        setFetchError('');
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/stock/${code}`);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Error ${response.status}: データの取得に失敗しました`);
            }
            const data = await response.json();

            // Set annual dividend for YOC calculation
            setAnnualDividend(data.annual_dividend || 0);
            setDividendHistory(data.dividend_history || []);
            setFetchedMetadata({ sector: data.sector });

            // Optionally set current price as default avg price if empty
            if (!formData.price && data.current_price) {
                setFormData(prev => ({ ...prev, price: Math.floor(data.current_price).toString() }));
            }

        } catch (error) {
            console.error('Fetch error:', error);
            setFetchError(error instanceof Error ? error.message : 'データ取得エラー');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSelectSuggestion = (stock: StockOption) => {
        setFormData(prev => ({
            ...prev,
            code: stock.code,
            name: stock.name
        }));
        setSearchText(`${stock.code} ${stock.name}`);
        setSuggestions([]);
        setShowSuggestions(false);

        // Fetch real data
        fetchStockData(stock.code);
    };

    const isFormValid = formData.code && formData.name && formData.shares && formData.price && formData.acquisitionDate;

    const handleSubmit = async () => {
        if (!isFormValid) return;

        try {
            // 1. Insert into stocks table
            const { data: stockData, error: stockError } = await supabase
                .from('stocks')
                .insert([{
                    symbol: formData.code,
                    name: formData.name,
                    shares: Number(formData.shares),
                    avg_price: Number(formData.price),
                    yoc: estimatedYoc,
                    dividend: Math.floor(Number(formData.shares) * annualDividend),
                    acquisition_date: formData.acquisitionDate,
                    current_price: Number(formData.price), // Assume current price ~ avg price for now or fetched price
                    sector: fetchedMetadata.sector // Insert sector
                }])
                .select()
                .single();

            if (stockError) throw stockError;

            // 2. Insert dividend history
            if (dividendHistory.length > 0 && stockData) {
                const historyRecords = dividendHistory.map(h => ({
                    stock_id: stockData.id,
                    date_str: h.date_str,
                    year: parseInt(h.date_str.split('/')[0]), // Derive year to satisfy Not-Null constraint
                    amount: h.amount,
                    is_increase: h.is_increase,
                    change_pct: h.change_pct,
                    comparison_amount: h.comparison_amount
                }));
                const { error: historyError } = await supabase
                    .from('dividend_history')
                    .insert(historyRecords);

                if (historyError) throw historyError;
            }

            // 3. Update UI
            onAdd({
                id: stockData.id,
                symbol: formData.code,
                name: formData.name,
                quantity: Number(formData.shares),
                avgPrice: Number(formData.price),
                yoc: estimatedYoc,
                dividendPerShare: annualDividend,
                acquisitionDate: formData.acquisitionDate,
                sector: fetchedMetadata.sector,
                dividendHistory: dividendHistory.map(h => ({
                    dateStr: h.date_str,
                    amount: h.amount,
                    comparisonAmount: h.comparison_amount,
                    isIncrease: h.is_increase,
                    changePct: h.change_pct
                }))
            });
            onClose();

        } catch (error) {
            console.error('Error saving stock:', error);
            // Handle error (show toast?)
            alert('保存に失敗しました: ' + (error as any).message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#052e16]/80 backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden font-sans">

            {/* Background Decor (Garden Vibe) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Main Overlay Card */}
            <div
                className={`relative w-[90%] max-w-[400px] transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
                    }`}
            >
                <div className="relative bg-transparent">
                    {/* Background Layer with Clipping for Snow */}
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden">
                        {/* Internal Snow Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-50">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute text-emerald-200/40 animate-snow"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `-20px`,
                                        animationDuration: `${4 + Math.random() * 6}s`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        fontSize: `${10 + Math.random() * 10}px`
                                    }}
                                >
                                    ❄
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative p-8">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] uppercase">New Planting</span>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight">銘柄を植える</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Live Preview Section */}
                        <div className="flex items-center gap-6 mb-10 p-5 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 relative overflow-hidden">
                            {/* Loading Overlay */}
                            {isFetching && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-[2rem]">
                                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                                </div>
                            )}

                            <div className="relative w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-50 overflow-hidden">
                                {isFormValid ? (
                                    <div className="flex flex-col items-center justify-center w-full h-full p-2">
                                        <img
                                            src={getTreeLevel(estimatedYoc).image}
                                            alt="Tree Preview"
                                            className="w-full h-full object-contain filter drop-shadow-sm mb-1"
                                        />
                                    </div>
                                ) : (
                                    <TreePine
                                        size={32}
                                        className="text-slate-200 transition-all duration-700"
                                    />
                                )}

                                {isFormValid && (
                                    <div className="absolute -top-1 -right-1">
                                        <Sparkles className="text-amber-400 animate-pulse" size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {isFormValid ? getTreeLevel(estimatedYoc).englishLabel : 'Estimated YOC'}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-black transition-colors ${estimatedYoc > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {estimatedYoc}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">%</span>
                                </div>
                                {isFormValid && (
                                    <p className="text-[10px] font-bold text-emerald-600/80 mt-1">
                                        {getTreeLevel(estimatedYoc).label}
                                    </p>
                                )}
                                {annualDividend > 0 && (
                                    <p className="text-[10px] text-emerald-600/70 font-medium">
                                        Est. Div: ¥{annualDividend.toLocaleString()}
                                    </p>
                                )}
                                {fetchError && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1">
                                        {fetchError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5">
                            {/* Unified Search Field */}
                            <div className="relative" ref={suggestionRef}>
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="search"
                                    value={searchText}
                                    onChange={handleChange}
                                    onFocus={() => {
                                        if (searchText.length > 0) setShowSuggestions(true);
                                    }}
                                    placeholder="コード または 銘柄名で検索"
                                    autoComplete="off"
                                    className={`w-full bg-slate-50 border rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold text-sm
                                        ${formData.code ? 'border-emerald-500/50 bg-emerald-50/10' : 'border-slate-100 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5'}
                                    `}
                                />
                                {formData.code && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full">
                                            SELECTED
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-emerald-100 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                        {suggestions.map((stock) => (
                                            <button
                                                key={stock.code}
                                                onClick={() => handleSelectSuggestion(stock)}
                                                className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex justify-between items-center transition-colors border-b border-slate-50 last:border-none"
                                            >
                                                <span className="font-bold text-emerald-600 text-xs">{stock.code}</span>
                                                <span className="text-slate-600 text-xs truncate max-w-[70%]">{stock.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Acquisition Date (Month Picker) */}
                            <MonthPicker
                                value={formData.acquisitionDate}
                                onChange={(dateStr) => setFormData(prev => ({ ...prev, acquisitionDate: dateStr }))}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                                        <Coins size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="shares"
                                        value={formData.shares}
                                        onChange={handleChange}
                                        placeholder="株数"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                                        <BadgeJapaneseYen size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="取得単価"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            disabled={!isFormValid}
                            onClick={handleSubmit}
                            className={`w-full mt-10 py-5 rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${isFormValid
                                ? 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                }`}
                        >
                            <PlusCircle size={20} /> 庭園に植える
                        </button>
                    </div>
                </div>

                {/* Helper text below card */}
                <p className="text-center mt-6 text-white/30 text-[11px] font-medium tracking-wide">
                    ※ 取得価額に基づき、庭園内の木の大きさが自動設定されます
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes snow {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
        }
        .animate-snow {
          animation: snow linear infinite;
        }
      `}} />
        </div>
    );
};
