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
            }, 3500); // Slightly longer for more impact
            return () => clearTimeout(timer);
        }
    }, [type, onComplete]);

    if (!type || !isVisible) return null;

    const renderContent = () => {
        switch (type) {
            case 'STRIKE':
                return (
                    <div className="flex flex-col items-center animate-bounce">
                        <div className="relative border-4 border-white bg-black p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
                            <h1 className="text-8xl md:text-9xl font-['Press_Start_2P'] text-yellow-500 tracking-tighter">
                                STRIKE!
                            </h1>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <span className="text-5xl">⚡</span>
                            <span className="text-6xl">🎳</span>
                            <span className="text-5xl">⚡</span>
                        </div>
                    </div>
                );
            case 'SPARE':
                return (
                    <div className="flex flex-col items-center animate-slide-in-right">
                        <div className="border-4 border-blue-500 bg-black p-6 shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
                            <h1 className="text-7xl md:text-8xl font-['Press_Start_2P'] text-blue-400">
                                SPARE
                            </h1>
                        </div>
                    </div>
                );
            case 'GUTTER':
                return (
                    <div className="flex flex-col items-center animate-shake">
                        <div className="relative">
                            <h1 className="text-6xl md:text-7xl font-['Creepster'] text-gray-500 drop-shadow-[0_8px_15px_rgba(0,0,0,1)] tracking-widest">
                                GUTTER...
                            </h1>
                            <div className="absolute inset-0 bg-red-900/10 blur-xl mix-blend-overlay" />
                        </div>
                        <div className="text-5xl mt-8 grayscale opacity-40 hover:grayscale-0 transition-all duration-700">😢 🚽 😢</div>
                        <div className="text-red-500/50 font-['Press_Start_2P'] text-[8px] mt-4 uppercase">Unlucky Break</div>
                    </div>
                );
            case 'SPLIT':
                return (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="relative px-8 py-4 border-y-4 border-red-600/50 bg-red-950/20">
                            <h1 className="text-7xl md:text-8xl font-mono font-black text-red-500 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(239,68,68,1)]">
                                SPLIT
                            </h1>
                            <div className="absolute top-0 left-0 w-4 h-full bg-red-600/50 animate-pulse" />
                            <div className="absolute top-0 right-0 w-4 h-full bg-red-600/50 animate-pulse" />
                        </div>
                        <div className="text-2xl mt-6 text-red-200 uppercase font-black tracking-tighter drop-shadow-sm">DANGER ZONE</div>
                    </div>
                );
            case 'TURKEY':
                return (
                    <div className="flex flex-col items-center animate-zoom-in-spin">
                        <div className="relative mb-8">
                            <div className="text-[120px] drop-shadow-[0_0_50px_rgba(251,146,60,0.6)]">🦃</div>
                            <div className="absolute -inset-8 border-4 border-orange-500/30 rounded-full animate-spin-slow" />
                        </div>
                        <div className="relative">
                            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 drop-shadow-2xl animate-bounce">
                                TURKEY!
                            </h1>
                            <div className="absolute -inset-6 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
                        </div>
                        <div className="text-orange-200 font-['Press_Start_2P'] text-xs mt-4 tracking-[0.5em] uppercase">Triple Threat</div>
                    </div>
                );
            case 'PERFECT':
                return (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="relative">
                            <h1 className="text-8xl md:text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-pink-500 via-yellow-400 to-red-500 drop-shadow-[0_0_50px_rgba(168,85,247,0.8)] italic">
                                PERFECT!
                            </h1>
                            <div className="absolute -inset-20 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 blur-[100px] animate-spin-slow" />
                        </div>
                        <div className="mt-8 px-10 py-4 bg-white/5 backdrop-blur-md border-2 border-yellow-400/50 rounded-2xl shadow-gold-glow">
                            <div className="text-4xl text-yellow-300 font-black tracking-[0.2em]">300 POINTS</div>
                        </div>
                        <div className="text-white font-['Press_Start_2P'] text-[10px] mt-6 tracking-[0.8em] uppercase animate-shine">Legendary Bowler</div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/80" />

            {/* Ambient Background VFX Patterns */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] mix-blend-screen animate-pulse" />
            </div>

            <div className="transform scale-110 md:scale-150">
                {renderContent()}
            </div>

            {/* Enhanced Particles for specific events */}
            {(type === 'STRIKE' || type === 'TURKEY' || type === 'PERFECT') && (
                <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 80 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-4 h-4 rounded-sm animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10%`,
                                backgroundColor: ['#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#f472b6'][i % 5],
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${1.5 + Math.random() * 2.5}s`,
                                filter: 'blur(1px)',
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        />
                    ))}
                    {/* Extra Bloom Sprinkles */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={`bloom-${i}`}
                            className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: 0.3
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CelebrationOverlay;

