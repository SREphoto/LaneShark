
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMode, CpuPersonality } from '../types';
import { CPU_OPPONENTS, WAGER_TARGET_SCORE } from '../constants';

interface ModeSelectProps {
    onSelectMode: (mode: GameMode, cpu?: CpuPersonality, wager?: number) => void;
    currentMoney: number;
}

const ModeSelect: React.FC<ModeSelectProps> = ({ onSelectMode, currentMoney }) => {
    const [wager, setWager] = React.useState(0);
    const wagers = [0, 100, 500, 1000];

    const handleSelect = (mode: GameMode, cpu?: CpuPersonality) => {
        onSelectMode(mode, cpu, wager);
    };
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="relative w-full max-w-lg border-4 border-white bg-[#000] p-10 flex flex-col items-center animate-slide-up shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-['Press_Start_2P'] text-white mb-2">
                        LANESHARK
                    </h2>
                    <p className="text-[10px] text-gray-500 font-['Press_Start_2P'] tracking-wider">
                        CHOOSE YOUR CHAMPIONSHIP MODE
                    </p>
                </div>

                <div className="w-full mb-8">
                    <p className="text-[8px] text-yellow-400 font-['Press_Start_2P'] mb-4 text-center">🏆 SET YOUR WAGER (WIN AT {WAGER_TARGET_SCORE}+)</p>
                    <div className="flex justify-center gap-2">
                        {wagers.map(w => (
                            <button
                                key={w}
                                onClick={() => setWager(w)}
                                disabled={currentMoney < w}
                                className={`px-3 py-2 border-2 text-[8px] font-['Press_Start_2P'] transition-all ${wager === w
                                    ? 'bg-yellow-500 border-white text-black translate-y-1'
                                    : currentMoney < w
                                        ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed'
                                        : 'bg-black border-yellow-800 text-yellow-600 hover:border-yellow-400'
                                    }`}
                            >
                                {w === 0 ? 'NONE' : `$${w}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full flex flex-col gap-4 mb-8">
                    <button
                        onClick={() => handleSelect('SOLO')}
                        className="btn-retro w-full py-4 flex items-center justify-center gap-4 group"
                    >
                        <span className="font-['Press_Start_2P'] text-sm">🕹️ 1 PLAYER SOLO</span>
                    </button>

                    <button
                        onClick={() => handleSelect('TWO_PLAYER')}
                        className="btn-retro w-full py-4 flex items-center justify-center gap-4 group !border-blue-500"
                    >
                        <span className="font-['Press_Start_2P'] text-sm">🤜🤛 2 PLAYER VS</span>
                    </button>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

                <div className="w-full text-center">
                    <h3 className="text-xs text-purple-400 font-['Press_Start_2P'] mb-6">
                        LEGENDARY CPU CHALLENGERS
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {CPU_OPPONENTS.map(cpu => (
                            <button
                                key={cpu.id}
                                onClick={() => handleSelect('VS_CPU', cpu)}
                                className="border-4 border-gray-800 bg-gray-950 p-4 flex flex-col items-center justify-center gap-2 hover:border-purple-500 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0_rgba(0,0,0,0.5)] group"
                            >
                                <div className="text-[10px] text-gray-400 font-['Press_Start_2P'] group-hover:text-purple-300">
                                    {cpu.name.split(' ')[0]}
                                </div>
                                <div className="px-2 py-1 bg-purple-900 border-2 border-purple-500 text-[8px] text-purple-200 font-['Press_Start_2P']">
                                    LVL {Math.round(cpu.difficulty * 10)}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Style Decoration */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" />
            </div>
        </div>
    );
};

export default ModeSelect;
