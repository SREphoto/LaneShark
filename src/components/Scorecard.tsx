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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" />

            <div className="relative w-full max-w-md bg-black border-4 border-white shadow-[12px_12px_0_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-purple-900 p-4 border-b-4 border-white flex justify-between items-center">
                    <h2 className="text-sm font-['Press_Start_2P'] text-white">SCORECARD</h2>
                    <span className="text-[10px] font-['Press_Start_2P'] text-yellow-400">TOTAL: {frames[frames.length - 1]?.cumulativeScore || 0}</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-shop-scrollbar p-4 space-y-2">
                    {/* Frames 1-10 Vertical */}
                    {Array.from({ length: 10 }).map((_, i) => {
                        const f = frames[i] || { frameNumber: i + 1, rolls: [], isStrike: false, isSpare: false, cumulativeScore: null };
                        return (
                            <div key={i} className={`border-2 ${f.frameNumber === 10 ? 'border-yellow-500' : 'border-white/20'} bg-gray-950 p-3 flex items-center justify-between shadow-[4px_4px_0_rgba(0,0,0,0.5)]`}>
                                <div className="flex items-center gap-6">
                                    <span className={`text-[10px] font-['Press_Start_2P'] ${f.frameNumber === 10 ? 'text-yellow-500' : 'text-gray-500'}`}>FRM {f.frameNumber}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 border-2 border-white/10 flex items-center justify-center text-xs text-white font-['Press_Start_2P']">
                                            {f.isStrike ? 'X' : renderRoll(f as BowlingFrame, 0)}
                                        </div>
                                        <div className="w-10 h-10 border-2 border-white/10 flex items-center justify-center text-xs text-yellow-400 font-['Press_Start_2P'] bg-white/5">
                                            {f.isStrike ? '-' : renderRoll(f as BowlingFrame, 1)}
                                        </div>
                                        {f.frameNumber === 10 && (
                                            <div className="w-10 h-10 border-2 border-white/10 flex items-center justify-center text-xs text-white font-['Press_Start_2P']">
                                                {renderRoll(f as BowlingFrame, 2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm font-['Press_Start_2P'] text-emerald-400">
                                    {f.cumulativeScore !== null ? f.cumulativeScore : '-'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Scorecard;
