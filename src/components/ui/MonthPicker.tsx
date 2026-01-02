import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthPickerProps {
    value: string; // "YYYY-MM" or "YYYY-MM-DD"
    onChange: (dateStr: string) => void;
    label?: string;
    direction?: 'top' | 'bottom'; // Added
}

export const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange, label = "取得年月", direction = 'bottom' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value or default to today
    const initialDate = value ? new Date(value) : new Date();
    // Handle invalid dates
    const safeDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

    const [year, setYear] = useState(safeDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(safeDate.getMonth() + 1); // 1-12

    // Update internal state when value prop changes
    useEffect(() => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setYear(d.getFullYear());
                setSelectedMonth(d.getMonth() + 1);
            }
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMonthSelect = (m: number) => {
        const newDateStr = `${year}-${m.toString().padStart(2, '0')}-01`;
        onChange(newDateStr);
        setIsOpen(false);
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="space-y-1 relative" ref={containerRef}>
            <label className="text-[10px] font-bold text-slate-400 ml-2">{label}</label>
            <div className="relative">
                <button
                    type="button" // Prevent form submission
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-left outline-none transition-all flex items-center justify-between group hover:bg-white hover:border-emerald-500/30 focus:border-emerald-500/50 active:scale-[0.99]"
                >
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-hover:text-emerald-500/50 transition-colors">
                        <Calendar size={18} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">
                        {year}年 {selectedMonth}月
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Select
                    </span>
                </button>

                {/* Dropdown Calendar */}
                {isOpen && (
                    <div className={`absolute left-0 w-full bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200 ${direction === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}>
                        {/* Header: Year Selector */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setYear(y => y - 1); }}
                                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="font-black text-slate-800 text-lg">{year}年</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setYear(y => y + 1); }}
                                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Grid: Months */}
                        <div className="grid grid-cols-4 gap-2">
                            {months.map(m => {
                                const isSelected = m === selectedMonth && year === safeDate.getFullYear();
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => handleMonthSelect(m)}
                                        className={`h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${isSelected
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                            : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                    >
                                        {m}月
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
