import React from 'react';

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-400'
        : 'text-white/30'}`}>
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : ''}`}>{icon}</div>
        <span className={`text-[9px] font-black uppercase tracking-tighter transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
            {label}
        </span>
    </button>
);
