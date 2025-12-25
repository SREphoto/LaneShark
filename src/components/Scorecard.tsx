/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { BowlingFrame } from '../types';

interface ScorecardProps {
    frames: BowlingFrame[];
}

const Scorecard: React.FC<ScorecardProps> = ({ frames }) => {
    
    // Helper to render roll text
    const renderRoll = (frame: BowlingFrame, rollIdx: number) => {
        const val = frame.rolls[rollIdx];
        if (val === undefined) return '';
        
        // Special display logic
        if (frame.frameNumber < 10) {
            if (frame.isStrike && rollIdx === 0) return 'X';
            if (frame.isStrike && rollIdx > 0) return ''; // Should be empty
            if (frame.isSpare && rollIdx === 1) return '/';
            if (val === 0) return '-';
            return val;
        } else {
            // 10th Frame
            if (rollIdx === 0 && val === 10) return 'X';
            if (rollIdx === 1) {
                if (frame.rolls[0] === 10 && val === 10) return 'X';
                if (frame.rolls[0] < 10 && frame.rolls[0] + val === 10) return '/';
            }
            if (rollIdx === 2) {
                if (val === 10) return 'X';
                if (frame.rolls[1] < 10 && frame.rolls[1] + val === 10) return '/';
            }
            if (val === 0) return '-';
            return val;
        }
    };

    return (
        <div className="absolute bottom-0 left-0 w-full p-2 bg-white text-black font-['Caveat'] z-10 overflow-x-auto">
            <div className="flex w-full border-2 border-black bg-yellow-50 shadow-lg">
                <div className="flex-none w-16 border-r-2 border-black flex flex-col items-center justify-center p-1 bg-gray-200">
                    <span className="text-sm font-sans font-bold">NAME</span>
                    <span className="text-xl font-bold">YOU</span>
                </div>
                
                {/* Frames 1-9 */}
                {frames.slice(0, 9).map((f) => (
                    <div key={f.frameNumber} className="flex-1 border-r-2 border-black flex flex-col min-w-[30px]">
                        <div className="h-4 border-b border-black bg-gray-100 text-[10px] text-center font-sans">{f.frameNumber}</div>
                        <div className="flex h-6">
                            <div className="w-1/2 border-r border-black flex items-center justify-center text-lg">
                                {/* Roll 1 (Empty if strike in 1-9) */}
                                {f.isStrike ? '' : renderRoll(f, 0)}
                            </div>
                            <div className="w-1/2 flex items-center justify-center bg-gray-100 text-lg">
                                {/* Roll 2 or Strike */}
                                {f.isStrike ? 'X' : renderRoll(f, 1)}
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-2xl font-bold">
                            {f.cumulativeScore !== null ? f.cumulativeScore : ''}
                        </div>
                    </div>
                ))}

                {/* Frame 10 */}
                {frames[9] && (
                    <div className="flex-[1.5] flex flex-col min-w-[45px]">
                        <div className="h-4 border-b border-black bg-gray-100 text-[10px] text-center font-sans">10</div>
                        <div className="flex h-6">
                            <div className="w-1/3 border-r border-black flex items-center justify-center text-lg">{renderRoll(frames[9], 0)}</div>
                            <div className="w-1/3 border-r border-black flex items-center justify-center bg-gray-100 text-lg">{renderRoll(frames[9], 1)}</div>
                            <div className="w-1/3 flex items-center justify-center text-lg">{renderRoll(frames[9], 2)}</div>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-2xl font-bold text-red-600">
                            {frames[9].cumulativeScore !== null ? frames[9].cumulativeScore : ''}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scorecard;
