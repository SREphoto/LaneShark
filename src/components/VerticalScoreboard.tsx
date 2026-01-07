/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, BowlingFrame } from '../types';

interface VerticalScoreboardProps {
    players: Player[];
    currentPlayerIdx: number;
    currentFrameIdx: number;
    // Visible toggle for mobile
    isVisible?: boolean;
}

const VerticalScoreboard: React.FC<VerticalScoreboardProps> = ({
    players,
    currentPlayerIdx,
    currentFrameIdx,
    isVisible = true
}) => {

    // Helper to format frame display
    const renderFrame = (frame: BowlingFrame | undefined, frameNum: number) => {
        if (!frame) return { roll1: '', roll2: '', roll3: '', score: '' };

        const isStrike = (r: number) => r === 10;
        const isSpare = (r1: number, r2: number) => r1 + r2 === 10;

        let r1 = frame.rolls[0] !== undefined ? frame.rolls[0] : '';
        let r2 = frame.rolls[1] !== undefined ? frame.rolls[1] : '';
        let r3 = frame.rolls[2] !== undefined ? frame.rolls[2] : '';

        let d1 = r1 === 10 ? 'X' : r1 === 0 ? '-' : r1;
        let d2 = r2 === 10 ? 'X' : (typeof r1 === 'number' && typeof r2 === 'number' && isSpare(r1, r2)) ? '/' : r2 === 0 ? '-' : r2;
        let d3 = r3 === 10 ? 'X' : r3 === 0 ? '-' : r3;

        // 10th Frame logic
        if (frameNum === 10) {
            d2 = (typeof r2 === 'number' && r2 === 10) ? 'X' : (typeof r1 === 'number' && typeof r2 === 'number' && r1 + r2 === 10) ? '/' : d2;
            d3 = (typeof r3 === 'number' && r3 === 10) ? 'X' : (typeof r2 === 'number' && typeof r3 === 'number' && r2 + r3 === 10) ? '/' : d3;
        }

        return {
            roll1: d1,
            roll2: d2,
            roll3: d3,
            score: frame.cumulativeScore || ''
        };
    };

    return (
        <div className={`
            absolute top-0 right-0 bottom-0 z-40
            w-64 bg-black/80 backdrop-blur-xl border-l border-white/10
            flex flex-col transform transition-transform duration-300
            ${isVisible ? 'translate-x-0' : 'translate-x-full'}
            font-['Press_Start_2P']
        `}>
            {/* Header / Players */}
            <div className="p-4 border-b border-white/10 bg-white/5">
                <h2 className="text-[10px] text-blue-400 mb-4 tracking-widest text-center">SCORECARD</h2>
                <div className="flex gap-2 overflow-x-auto">
                    {players.map((p, idx) => (
                        <div
                            key={p.id}
                            className={`
                                flex-1 p-2 rounded-lg text-center border transition-all
                                ${idx === currentPlayerIdx
                                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                    : 'bg-black/40 border-white/10 text-gray-500'}
                            `}
                        >
                            <p className="text-[8px] truncate">{p.name}</p>
                            <p className="text-[10px] mt-1 text-yellow-400">{p.score}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Frames List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
                {/* Header Row */}
                <div className="flex text-[8px] text-gray-500 mb-2 px-2">
                    <span className="w-8">FR</span>
                    <span className="flex-1 text-center">PINS</span>
                    <span className="w-12 text-right">TOT</span>
                </div>

                {Array.from({ length: 10 }).map((_, i) => {
                    const frameNum = i + 1;
                    // Just show current player's frames for vertical detail, or maybe side-by-side?
                    // Vertical list usually best for single player focus. Let's show current player.
                    const frameData = renderFrame(players[currentPlayerIdx]?.frames[i], frameNum);
                    const isCurrent = currentFrameIdx === frameNum;

                    return (
                        <div
                            key={i}
                            className={`
                                flex items-center py-3 px-2 mb-1 rounded border-l-4
                                ${isCurrent ? 'bg-white/10 border-blue-500' : 'bg-transparent border-transparent hover:bg-white/5'}
                            `}
                        >
                            {/* Frame Number */}
                            <div className="w-8 text-[10px] text-gray-400">{frameNum}</div>

                            {/* Rolls */}
                            <div className="flex-1 flex justify-center gap-2 text-[10px] text-white">
                                <span className="w-4 text-center">{frameData.roll1}</span>
                                <span className="w-4 text-center">{frameData.roll2}</span>
                                {frameNum === 10 && <span className="w-4 text-center">{frameData.roll3}</span>}
                            </div>

                            {/* Cumulative Score */}
                            <div className="w-12 text-right text-[10px] text-yellow-500">
                                {frameData.score}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer / Total */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-t from-blue-900/20 to-transparent">
                <div className="flex justify-between items-end">
                    <span className="text-[8px] text-gray-400">TOTAL SCORE</span>
                    <span className="text-xl text-white shadow-glow">{players[currentPlayerIdx]?.score || 0}</span>
                </div>
            </div>
        </div>
    );
};

export default VerticalScoreboard;
