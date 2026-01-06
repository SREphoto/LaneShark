/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

export type CelebrationType = 'STRIKE' | 'SPARE' | 'GUTTER' | 'SPLIT' | 'TURKEY' | 'PERFECT' | 'CLEAN' | 'WAGER_WIN' | 'WAGER_LOSS' | null;

interface CelebrationOverlayProps {
    type: CelebrationType;
    onComplete: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ type, onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeType, setActiveType] = useState<CelebrationType | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (type) {
            setActiveType(type);
            setIsVisible(true);

            // Randomize particles if container exists
            if (containerRef.current) {
                const particles = containerRef.current.querySelectorAll('.confetti-particle');
                particles.forEach((p, i) => {
                    const el = p as HTMLElement;
                    el.style.setProperty('--particle-left', `${Math.random() * 100}%`);
                    el.style.setProperty('--particle-delay', `${Math.random() * 3}s`);
                    el.style.setProperty('--particle-duration', `${1.5 + Math.random() * 2.5}s`);
                    el.style.setProperty('--particle-rotate', `${Math.random() * 360}deg`);
                    el.style.setProperty('--particle-top', `-10%`);
                    el.style.setProperty('--particle-color', ['#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#f472b6'][i % 5]);
                });

                const blooms = containerRef.current.querySelectorAll('.bloom-particle');
                blooms.forEach((b) => {
                    const el = b as HTMLElement;
                    el.style.left = `${Math.random() * 100}%`;
                    el.style.top = `${Math.random() * 100}%`;
                    el.style.animationDelay = `${Math.random() * 2}s`;
                });
            }

            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 2000);

            const timer2 = setTimeout(() => {
                onComplete();
            }, 2500);

            return () => {
                clearTimeout(timer);
                clearTimeout(timer2);
            };
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setActiveType(null), 500);
            return () => clearTimeout(timer);
        }
    }, [type, onComplete]);

    if (!activeType) return null;

    const renderContent = () => {
        switch (activeType) {
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
                        <div className="border-4 border-gray-500 bg-black p-6 shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
                            <h1 className="text-6xl md:text-7xl font-['Press_Start_2P'] text-gray-500">
                                GUTTER
                            </h1>
                        </div>
                        <div className="text-5xl mt-8">😢 🚽 😢</div>
                    </div>
                );
            case 'SPLIT':
                return (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="border-4 border-red-600 bg-black p-6 shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
                            <h1 className="text-7xl md:text-8xl font-['Press_Start_2P'] text-red-500">
                                SPLIT
                            </h1>
                        </div>
                    </div>
                );
            case 'TURKEY':
                return (
                    <div className="flex flex-col items-center animate-zoom-in-spin">
                        <div className="text-[120px] mb-8">🦃🦃🦃</div>
                        <div className="border-4 border-orange-500 bg-black p-6 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
                            <h1 className="text-8xl md:text-9xl font-['Press_Start_2P'] text-orange-500">
                                TURKEY!
                            </h1>
                        </div>
                    </div>
                );
            case 'PERFECT':
                return (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="border-8 border-yellow-400 bg-black p-10 shadow-[12px_12px_0_rgba(0,0,0,0.5)]">
                            <h1 className="text-8xl md:text-[120px] font-['Press_Start_2P'] text-yellow-400 italic">
                                PERFECT!
                            </h1>
                        </div>
                    </div>
                );
            case 'WAGER_WIN':
                return (
                    <div className="flex flex-col items-center animate-bounce">
                        <div className="text-[120px] mb-8">💰🏆💰</div>
                        <div className="border-4 border-yellow-400 bg-black p-8 shadow-[10px_10px_0_rgba(255,215,0,0.5)]">
                            <h1 className="text-6xl md:text-8xl font-['Press_Start_2P'] text-yellow-400 text-center leading-tight">
                                WAGER<br />WON!
                            </h1>
                        </div>
                    </div>
                );
            case 'WAGER_LOSS':
                return (
                    <div className="flex flex-col items-center animate-shake">
                        <div className="text-[100px] mb-8">💸💀💸</div>
                        <div className="border-4 border-red-900 bg-black p-8 shadow-[10px_10px_0_rgba(255,0,0,0.3)]">
                            <h1 className="text-6xl md:text-8xl font-['Press_Start_2P'] text-red-600 text-center leading-tight">
                                WAGER<br />LOST
                            </h1>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/80" />


            <div className="transform scale-110 md:scale-150">
                {renderContent()}
            </div>

            {/* Enhanced Particles for specific events */}
            {(type === 'STRIKE' || type === 'TURKEY' || type === 'PERFECT') && (
                <div ref={containerRef} className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 80 }).map((_, i) => (
                        <div
                            key={i}
                            className="particle confetti-particle"
                        />
                    ))}
                    {/* Extra Bloom Sprinkles */}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={`bloom-${i}`}
                            className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-30 bloom-particle"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CelebrationOverlay;

