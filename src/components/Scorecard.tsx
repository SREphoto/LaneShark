
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
        <div className="absolute top-16 left-0 w-full px-4 z-40 animate-fade-in">
            <div className="glass-panel overflow-hidden border-2 border-white/20 shadow-2xl">
                <div className="flex w-full bg-black/40">
                    {/* Header/Name Section */}
                    <div className="flex-none w-20 border-r border-white/10 flex flex-col items-center justify-center p-2 bg-gradient-to-b from-purple-900/60 to-black/40">
                        <span className="text-[8px] font-['Press_Start_2P'] text-purple-400 mb-1">PLAYER</span>
                        <span className="text-[10px] font-['Press_Start_2P'] text-white truncate">YOU</span>
                    </div>

                    {/* Frames 1-9 */}
                    <div className="flex-1 flex overflow-x-auto custom-shop-scrollbar">
                        {frames.slice(0, 9).map((f) => (
                            <div key={f.frameNumber} className="flex-none w-20 border-r border-white/10 flex flex-col group hover:bg-white/5 transition-colors">
                                <div className="h-6 border-b border-white/10 flex items-center justify-center bg-white/5">
                                    <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 group-hover:text-white transition-colors">
                                        {f.frameNumber}
                                    </span>
                                </div>
                                <div className="flex h-8">
                                    <div className="w-1/2 border-r border-white/10 flex items-center justify-center text-[10px] font-['Press_Start_2P'] text-white">
                                        {f.isStrike ? '' : renderRoll(f, 0)}
                                    </div>
                                    <div className="w-1/2 flex items-center justify-center bg-white/5 text-[10px] font-['Press_Start_2P'] text-yellow-500">
                                        {f.isStrike ? 'X' : renderRoll(f, 1)}
                                    </div>
                                </div>
                                <div className="h-10 flex items-center justify-center">
                                    <span className={`text-sm font-['Press_Start_2P'] ${f.cumulativeScore !== null ? 'gold-text shadow-glow' : 'text-transparent'}`}>
                                        {f.cumulativeScore || '0'}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Frame 10 */}
                        {frames[9] && (
                            <div className="flex-none w-32 flex flex-col bg-purple-900/20 group hover:bg-purple-900/30 transition-colors">
                                <div className="h-6 border-b border-white/10 flex items-center justify-center bg-purple-600/30">
                                    <span className="text-[8px] font-['Press_Start_2P'] text-white">10</span>
                                </div>
                                <div className="flex h-8">
                                    <div className="w-1/3 border-r border-white/10 flex items-center justify-center text-[10px] font-['Press_Start_2P'] text-white">{renderRoll(frames[9], 0)}</div>
                                    <div className="w-1/3 border-r border-white/10 flex items-center justify-center bg-white/5 text-[10px] font-['Press_Start_2P'] text-white">{renderRoll(frames[9], 1)}</div>
                                    <div className="w-1/3 flex items-center justify-center text-[10px] font-['Press_Start_2P'] text-yellow-500">{renderRoll(frames[9], 2)}</div>
                                </div>
                                <div className="h-10 flex items-center justify-center">
                                    <span className={`text-lg font-['Press_Start_2P'] ${frames[9].cumulativeScore !== null ? 'gradient-text shadow-gold-glow' : 'text-transparent'}`}>
                                        {frames[9].cumulativeScore || '0'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend/Info Bar */}
            <div className="mt-2 flex justify-between items-center px-2">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-[7px] font-['Press_Start_2P'] text-gray-400">LIVE SCORE</span>
                    </div>
                </div>
                <div className="text-[7px] font-['Press_Start_2P'] text-white/50">
                    LANESHARK CHAMPIONSHIP
                </div>
            </div>
        </div>
    );
};

export default Scorecard;
