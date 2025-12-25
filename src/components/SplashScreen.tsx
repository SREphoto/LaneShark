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
        // Sequence: 
        // 0: Black
        // 1: Logo Drops / Text Appears + Sound
        // 2: Hold
        // 3: Fade Out
        const t1 = setTimeout(() => {
            setStage(1);
            playSound();
        }, 500);

        const t2 = setTimeout(() => {
            setStage(2);
        }, 2500);

        const t3 = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete, playSound]);

    return (
        <div className={`absolute inset-0 bg-black z-[100] flex flex-col items-center justify-center transition-opacity duration-1000 ${stage === 2 ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`transition-all duration-500 transform ${stage >= 1 ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
                <div className="border-4 border-red-600 rounded-full px-8 py-2 bg-white">
                     <h1 className="text-red-600 font-['Press_Start_2P'] text-2xl tracking-widest">NINTENDO</h1>
                </div>
            </div>
             <div className={`mt-8 text-white font-['Press_Start_2P'] text-xs transition-opacity duration-1000 delay-500 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                PRESENTED BY GOOGLE GENAI
            </div>
        </div>
    );
};

export default SplashScreen;
