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

        if (frame.frameNumber < 10) {
            if (frame.isStrike && rollIdx === 0) return 'X';
            if (frame.isStrike && rollIdx > 0) return '';
            if (frame.isSpare && rollIdx === 1) return '/';
            if (val === 0) return '-';
            return val;
        } else {
            if (rollIdx === 0 && val === 10) return 'X';
            if (rollIdx === 1) {
                if (frame.rolls[0] === 10 && val === 10) return 'X';
                if (frame.rolls[0] < 10 && frame.rolls[0] + val === 10) return '/';
            }
            if (rollIdx === 2) {
                if (val === 10) return 'X';
                if (frame.rolls[1] < 10 && frame.rolls[1] + val === 10) return '/';
                if (frame.rolls[0] + frame.rolls[1] === 10 && rollIdx === 2) {
                    if (val === 10) return 'X';
                }
            }
            if (val === 0) return '-';
            return val;
        }
    };

    return (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 h-[90vh] w-12 z-40 animate-slide-in-left flex flex-col pointer-events-none">
            <div className="flex-1 flex flex-col bg-black/60 backdrop-blur-md border-r border-white/20 shadow-2xl pointer-events-auto overflow-y-auto overflow-x-hidden custom-shop-scrollbar">
                {/* Vertical Header */}
                <div className="w-full py-4 border-b border-white/10 bg-gradient-to-r from-purple-900/60 to-black/40 flex items-center justify-center">
                    <div className="rotate-90 origin-center whitespace-nowrap text-[8px] font-['Press_Start_2P'] text-purple-400">SCORE</div>
                </div>

                {/* Frames 1-9 Vertical */}
                {frames.slice(0, 9).map((f) => (
                    <div key={f.frameNumber} className="flex-none h-16 w-full border-b border-white/10 flex flex-col group hover:bg-white/5 transition-colors">
                        <div className="h-4 border-b border-white/5 flex items-center justify-center bg-white/5">
                            <span className="text-[6px] font-['Press_Start_2P'] text-gray-500 group-hover:text-white">F{f.frameNumber}</span>
                        </div>
                        <div className="flex flex-1">
                            <div className="w-1/2 border-r border-white/10 flex items-center justify-center text-[8px] font-['Press_Start_2P'] text-white">
                                {f.isStrike ? '' : renderRoll(f, 0)}
                            </div>
                            <div className="w-1/2 flex items-center justify-center bg-white/5 text-[8px] font-['Press_Start_2P'] text-yellow-500">
                                {f.isStrike ? 'X' : renderRoll(f, 1)}
                            </div>
                        </div>
                        <div className="h-5 flex items-center justify-center bg-black/20">
                            <span className={`text-[8px] font-['Press_Start_2P'] ${f.cumulativeScore !== null ? 'gold-text' : 'text-transparent'}`}>
                                {f.cumulativeScore || ''}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Frame 10 Vertical */}
                {frames[9] && (
                    <div className="flex-none h-24 w-full flex flex-col bg-purple-900/20 group hover:bg-purple-900/30 transition-colors">
                        <div className="h-4 border-b border-white/10 flex items-center justify-center bg-purple-600/30">
                            <span className="text-[6px] font-['Press_Start_2P'] text-white">F10</span>
                        </div>
                        <div className="flex h-6">
                            <div className="w-1/3 border-r border-white/10 flex items-center justify-center text-[7px] font-['Press_Start_2P'] text-white">{renderRoll(frames[9], 0)}</div>
                            <div className="w-1/3 border-r border-white/10 flex items-center justify-center bg-white/5 text-[7px] font-['Press_Start_2P'] text-white">{renderRoll(frames[9], 1)}</div>
                            <div className="w-1/3 flex items-center justify-center text-[7px] font-['Press_Start_2P'] text-yellow-500">{renderRoll(frames[9], 2)}</div>
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-black/40">
                            <span className={`text-[9px] font-['Press_Start_2P'] ${frames[9].cumulativeScore !== null ? 'gradient-text' : 'text-transparent'}`}>
                                {frames[9].cumulativeScore || ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scorecard;
