import React, { useState, useEffect } from 'react';
import {
    Search,
    Hash,
    PlusCircle,
    TreePine,
    Coins,
    BadgeJapaneseYen,
    X,
    Sparkles
} from 'lucide-react';

interface AddStockFormProps {
    onClose: () => void;
    onAdd: (stock: { symbol: string; name: string; quantity: number; avgPrice: number }) => void;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        shares: '',
        price: ''
    });
    const [estimatedYoc, setEstimatedYoc] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // 擬似的な利回り計算 (Mock YOC Calculation)
    useEffect(() => {
        const price = Number(formData.price);
        if (price > 0) {
            const mockDividend = 200; // 仮の配当金 (Mock Dividend)
            const yoc = (mockDividend / price) * 100;
            setEstimatedYoc(Number(yoc.toFixed(2)));
        } else {
            setEstimatedYoc(0);
        }
    }, [formData.price]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isFormValid = formData.code && formData.name && formData.shares && formData.price;

    const handleSubmit = () => {
        if (!isFormValid) return;

        onAdd({
            symbol: formData.code,
            name: formData.name,
            quantity: Number(formData.shares),
            avgPrice: Number(formData.price),
        });
        onClose();
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
                <div className="bg-white/95 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden">

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
                        <div className="flex items-center gap-6 mb-10 p-5 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50">
                            <div className="relative w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-50">
                                <TreePine
                                    size={isFormValid ? 48 : 32}
                                    className={`${isFormValid ? 'text-emerald-500' : 'text-slate-200'} transition-all duration-700`}
                                />
                                {isFormValid && (
                                    <div className="absolute -top-1 -right-1">
                                        <Sparkles className="text-amber-400 animate-pulse" size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated YOC</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-black transition-colors ${estimatedYoc > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        {estimatedYoc}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">%</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                                        <Hash size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="銘柄コード (例: 2914)"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold text-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="銘柄名 (例: 日本たばこ産業)"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-bold text-sm"
                                    />
                                </div>
                            </div>

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
