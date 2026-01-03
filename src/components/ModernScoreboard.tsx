/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BowlingFrame } from '../types';

interface ModernScoreboardProps {
    score: number;
    money: number;
    frame: number;
    ball: number;
    playerName: string;
    xpProgress: number;
    level: number;
}

const ModernScoreboard: React.FC<ModernScoreboardProps> = ({
    score,
    money,
    frame,
    ball,
    playerName,
    xpProgress,
    level
}) => {
    return (
        <div className="flex flex-col gap-4 w-full max-w-4xl animate-slide-in-down pointer-events-auto">
            {/* Top Bar: Player Info & XP */}
            <div className="flex items-center justify-between px-6 py-3 glass-morphism rounded-2xl border-b-2 border-purple-500/30">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-xl flex items-center justify-center border-2 border-white/20 shadow-lg">
                            <span className="text-white text-xs font-['Press_Start_2P']">{level}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <span className="text-[6px] text-black font-black">★</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-['Press_Start_2P'] text-white tracking-widest">{playerName}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-32 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-400 shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all duration-1000"
                                    style={{ width: `${xpProgress}%` }}
                                />
                            </div>
                            <span className="text-[6px] font-['Press_Start_2P'] text-gray-400">XP</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 uppercase mb-1">Economy</span>
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-['Press_Start_2P'] text-sm leading-none">${money.toLocaleString()}</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-emerald-glow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Game Stats & HUD */}
            <div className="grid grid-cols-3 gap-4">
                {/* Score Panel */}
                <div className="col-span-1 glass-morphism p-4 rounded-2xl border-l-4 border-yellow-500/50 led-bg">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-['Press_Start_2P'] text-yellow-500/70 uppercase mb-3 tracking-widest">Total Score</span>
                        <div className="text-4xl font-['Press_Start_2P'] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                            {score.toString().padStart(3, '0')}
                        </div>
                    </div>
                </div>

                {/* Frame & Ball Panel */}
                <div className="col-span-2 glass-morphism p-4 rounded-2xl flex items-center justify-around bg-gradient-to-r from-transparent via-blue-900/10 to-transparent">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-['Press_Start_2P'] text-blue-400/70 uppercase mb-2">Frame</span>
                        <div className="flex items-center gap-2">
                            {[...Array(10)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-sm border ${i + 1 === frame ? 'bg-blue-500 border-white shadow-blue-glow scale-110' : 'bg-black/20 border-white/10'}`}
                                />
                            ))}
                        </div>
                        <span className="text-[12px] font-['Press_Start_2P'] text-white mt-2">{frame} / 10</span>
                    </div>

                    <div className="w-[1px] h-10 bg-white/10" />

                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-['Press_Start_2P'] text-cyan-400/70 uppercase mb-2">Ball</span>
                        <div className="flex gap-2">
                            {[1, 2, 3].map((b) => (
                                <div
                                    key={b}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${b === ball ? 'bg-cyan-500/20 border-cyan-400 shadow-blue-glow scale-110' : 'bg-black/20 border-white/5 opacity-30'}`}
                                >
                                    <span className={`text-[10px] font-['Press_Start_2P'] ${b === ball ? 'text-white' : 'text-gray-600'}`}>
                                        {b}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernScoreboard;
