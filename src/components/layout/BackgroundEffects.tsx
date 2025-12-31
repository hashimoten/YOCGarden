import React from 'react';

export const BackgroundEffects: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[100px]" />

            {/* Snow particles generated dynamically */}
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="snow-particle"
                    style={{
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        left: `${Math.random() * 100}%`,
                        top: `-10px`,
                        opacity: Math.random() * 0.4,
                        animationDuration: `${10 + Math.random() * 10}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                />
            ))}
        </div>
    );
};
