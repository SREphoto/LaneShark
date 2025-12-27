/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

export type CelebrationType = 'STRIKE' | 'SPARE' | 'GUTTER' | 'SPLIT' | 'TURKEY' | 'PERFECT' | 'CLEAN' | null;

interface CelebrationOverlayProps {
    type: CelebrationType;
    onComplete: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ type, onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (type) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onComplete, 500); // Wait for fade out
            }, 3000); // Duration
            return () => clearTimeout(timer);
        }
    }, [type, onComplete]);

    if (!type || !isVisible) return null;

    const renderContent = () => {
        switch (type) {
            case 'STRIKE':
                return (
                    <div className="flex flex-col items-center animate-bounce-in">
                        <div className="relative">
                            <h1 className="text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-red-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.8)] transform -skew-x-12">
                                STRIKE!
                            </h1>
                            <div className="absolute -inset-10 bg-yellow-400/20 blur-3xl rounded-full animate-pulse" />
                        </div>
                        <div className="text-4xl mt-4 animate-ping">⚡ 🎳 ⚡</div>
                    </div>
                );
            case 'SPARE':
                return (
                    <div className="flex flex-col items-center animate-slide-in-right">
                        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">
                            SPARE
                        </h1>
                        <div className="text-3xl mt-2 text-blue-200 animate-pulse">CLEAN UP!</div>
                    </div>
                );
            case 'GUTTER':
                return (
                    <div className="flex flex-col items-center animate-shake">
                        <h1 className="text-6xl font-['Creepster'] text-gray-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                            GUTTERBALL...
                        </h1>
                        <div className="text-4xl mt-4 grayscale opacity-50">😢 🚽 😢</div>
                    </div>
                );
            case 'SPLIT':
                return (
                    <div className="flex flex-col items-center animate-pulse">
                        <h1 className="text-7xl font-mono font-bold text-red-500 tracking-[0.5em] drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                            S P L I T
                        </h1>
                        <div className="text-2xl mt-4 text-red-200 uppercase font-bold">DANGER ZONE</div>
                    </div>
                );
            case 'TURKEY':
                return (
                    <div className="flex flex-col items-center animate-zoom-in-spin">
                        <div className="text-9xl mb-4 drop-shadow-2xl">🦃</div>
                        <h1 className="text-7xl font-black text-orange-500 stroke-text-white drop-shadow-xl animate-bounce">
                            TURKEY!!!
                        </h1>
                    </div>
                );
            case 'PERFECT':
                return (
                    <div className="flex flex-col items-center animate-pulse">
                        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-2xl">
                            PERFECT!
                        </h1>
                        <div className="text-4xl mt-4 text-yellow-300 font-bold">300 POINTS</div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <div className="transform scale-150">
                {renderContent()}
            </div>

            {/* Confetti/Particles for specific events */}
            {(type === 'STRIKE' || type === 'TURKEY' || type === 'PERFECT') && (
                <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 bg-yellow-400 rounded-sm animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10%`,
                                backgroundColor: ['#fcd34d', '#f87171', '#60a5fa', '#a78bfa'][i % 4],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 3}s`
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CelebrationOverlay;
