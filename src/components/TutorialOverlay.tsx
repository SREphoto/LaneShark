/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { TUTORIAL_STEPS } from '../constants';

interface TutorialOverlayProps {
    step: number;
    onNext: () => void;
    onSkip: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext, onSkip }) => {
    const content = TUTORIAL_STEPS[step];
    const isLast = step === TUTORIAL_STEPS.length - 1;

    return (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black p-4 pointer-events-auto">
            <div className="bg-black border-4 border-blue-400 p-6 max-w-sm w-full text-center shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
                <h3 className="text-xl text-yellow-400 font-['Press_Start_2P'] mb-4">{content.title}</h3>
                <p className="text-white font-['Press_Start_2P'] text-[10px] mb-8 leading-relaxed">{content.text}</p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onSkip}
                        className="btn-retro !border-gray-500 px-4 py-2 text-gray-400 text-xs"
                    >
                        SKIP
                    </button>
                    <button
                        onClick={onNext}
                        className="btn-retro !border-blue-500 px-6 py-2 text-white text-xs"
                    >
                        {isLast ? "PLAY" : "NEXT >"}
                    </button>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                    {TUTORIAL_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-400' : 'bg-gray-700'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
