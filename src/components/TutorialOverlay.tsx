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
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black bg-opacity-80 p-4 pointer-events-auto">
            <div className="bg-gray-900 border-2 border-blue-400 p-6 max-w-sm w-full text-center shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-bounce-in">
                <h3 className="text-xl text-yellow-400 font-['Press_Start_2P'] mb-4">{content.title}</h3>
                <p className="text-white font-sans text-lg mb-8 leading-relaxed">{content.text}</p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 border border-gray-500 text-gray-400 hover:text-white font-['Press_Start_2P'] text-xs"
                    >
                        SKIP
                    </button>
                    <button
                        onClick={onNext}
                        className="px-6 py-2 bg-blue-600 border-2 border-white text-white font-['Press_Start_2P'] text-xs hover:bg-blue-500 shadow-lg"
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
