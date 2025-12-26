
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
    playSound: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, playSound }) => {
    const [stage, setStage] = useState(0);

    const [showCredits, setShowCredits] = useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (showCredits) return; // Pause timer if credits are open

        // Stage sequence
        const t1 = setTimeout(() => {
            setStage(1);
            playSound();
        }, 500);

        const t2 = setTimeout(() => {
            setStage(2);
        }, 3000);

        timeoutRef.current = setTimeout(() => {
            onComplete();
        }, 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [onComplete, playSound, showCredits]);

    const handleOpenCredits = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowCredits(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleCloseCredits = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowCredits(false);
        // Resume navigation logic implies re-rendering which resets effects, 
        // effectively restarting the short timer or we can just dismiss immediately if stage was done.
        if (stage >= 1) {
            // Give a small moment before dismissing so it's not abrupt
            setTimeout(onComplete, 500);
        }
    };

    return (
        <div className={`absolute inset-0 bg-[#0a0a0c] z-[100] flex flex-col items-center justify-center transition-opacity duration-1000 ${stage === 2 ? 'opacity-0' : 'opacity-100'}`}>
            {/* Animated Logo Container */}
            <div className={`flex flex-col items-center transition-all duration-1000 transform ${stage >= 1 ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`}>

                {/* Logo Halo */}
                <div className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

                {/* Main Title */}
                <div className="relative mb-4 flex flex-col items-center bloom chromatic-aberration">
                    <h1 className="text-6xl font-['Press_Start_2P'] text-white tracking-tighter shadow-2xl">
                        LANE
                    </h1>
                    <h1 className="text-6xl font-['Press_Start_2P'] gradient-text tracking-tighter mt-[-10px]">
                        SHARK!
                    </h1>
                </div>

                {/* Subtitle */}
                <div className="flex items-center gap-4 mt-8 animate-pulse">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
                    <div className="text-[10px] text-gray-400 font-['Press_Start_2P'] uppercase tracking-[0.3em]">
                        Bowling Evolution
                    </div>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
                </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-1 animate-slide-up bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                <p className="text-[9px] text-gray-500 font-['Press_Start_2P'] uppercase">Created & Designed by</p>
                <p className="text-[10px] text-emerald-400 font-['Press_Start_2P']">Samuel R Erwin III</p>
            </div>
        </div>

            {/* Info Button */ }
    <button
        onClick={handleOpenCredits}
        className="absolute bottom-8 right-8 z-[200] w-10 h-10 rounded-full border border-white/20 bg-black/40 text-white font-['Press_Start_2P'] text-[10px] hover:bg-white/10 hover:scale-110 transition-all flex items-center justify-center pointer-events-auto"
    >
        ?
    </button>

    {/* Credits Modal */ }
    {
        showCredits && (
            <div className="absolute inset-0 z-[300] bg-black/95 flex items-center justify-center p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="max-w-md w-full border border-white/20 bg-[#0f0c29] p-8 rounded-2xl shadow-2xl relative">
                    <button
                        onClick={handleCloseCredits}
                        className="absolute top-4 right-4 text-red-500 hover:scale-125 transition-transform"
                    >
                        ✕
                    </button>

                    <h2 className="text-2xl font-['Press_Start_2P'] text-center mb-8 gradient-text">CREDITS</h2>

                    <div className="space-y-8 text-center">
                        <div>
                            <p className="text-[8px] text-gray-500 mb-2 uppercase tracking-widest">Lead Developer & Designer</p>
                            <p className="text-sm text-white font-['Press_Start_2P'] text-shadow">Samuel R Erwin III</p>
                        </div>

                        <div>
                            <p className="text-[8px] text-gray-500 mb-2 uppercase tracking-widest">AI Architect & Co-Pilot</p>
                            <p className="text-sm text-blue-400 font-['Press_Start_2P'] text-shadow">Antigravity</p>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <p className="text-[8px] text-gray-600 italic">
                                "Redefining the digital bowling experience."
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleCloseCredits}
                        className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-['Press_Start_2P'] transition-colors"
                    >
                        CLOSE
                    </button>
                </div>
            </div>
        )
    }

    {/* Loading Indicator Overlay */ }
    <div className="absolute bottom-10 left-10 right-10 h-1 loader-track">
        <div
            className="loader-fill"
            style={{ width: stage >= 1 ? '100%' : '0%' }}
        />
    </div>
        </div >
    );
};

export default SplashScreen;
