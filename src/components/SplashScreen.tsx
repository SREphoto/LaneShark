
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

    useEffect(() => {
        // Stage sequence
        const t1 = setTimeout(() => {
            setStage(1);
            playSound();
        }, 500);

        const t2 = setTimeout(() => {
            setStage(2);
        }, 3000);

        const t3 = setTimeout(() => {
            onComplete();
        }, 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete, playSound]);

    return (
        <div className={`absolute inset-0 bg-[#0a0a0c] z-[100] flex flex-col items-center justify-center transition-opacity duration-1000 ${stage === 2 ? 'opacity-0' : 'opacity-100'}`}>
            {/* Animated Logo Container */}
            <div className={`flex flex-col items-center transition-all duration-1000 transform ${stage >= 1 ? 'scale-110 opacity-100' : 'scale-75 opacity-0'}`}>

                {/* Logo Halo */}
                <div className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

                {/* Main Title */}
                <div className="relative mb-4 flex flex-col items-center">
                    <h1 className="text-6xl font-['Press_Start_2P'] text-white tracking-tighter shadow-2xl">
                        LANE
                    </h1>
                    <h1 className="text-6xl font-['Press_Start_2P'] gradient-text tracking-tighter mt-[-10px]">
                        SHARK!
                    </h1>
                </div>

                {/* Subtitle */}
                <div className="flex items-center gap-4 mt-8">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
                    <div className="text-[10px] text-gray-400 font-['Press_Start_2P'] uppercase tracking-[0.3em]">
                        Bowling Evolution
                    </div>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
                </div>
            </div>

            {/* Credit */}
            <div className={`absolute bottom-20 text-[8px] text-gray-600 font-['Press_Start_2P'] tracking-widest transition-opacity duration-1000 delay-1000 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                POWERED BY GOOGLE GEMINI AI
            </div>

            {/* Loading Indicator Overlay */}
            <div className="absolute bottom-10 left-0 w-full h-1 bg-white/5">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-[3000ms] ease-linear"
                    style={{ width: stage >= 1 ? '100%' : '0%' }}
                />
            </div>
        </div>
    );
};

export default SplashScreen;
