
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMode, CpuPersonality } from '../types';
import { CPU_OPPONENTS } from '../constants';

interface ModeSelectProps {
    onSelectMode: (mode: GameMode, cpu?: CpuPersonality) => void;
}

const ModeSelect: React.FC<ModeSelectProps> = ({ onSelectMode }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            <div className="relative w-full max-w-lg glass-card p-10 flex flex-col items-center animate-slide-up">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-['Press_Start_2P'] gradient-text mb-2">
                        LANESHARK
                    </h2>
                    <p className="text-[10px] text-gray-400 font-['Press_Start_2P'] tracking-wider">
                        CHOOSE YOUR CHAMPIONSHIP MODE
                    </p>
                </div>

                <div className="w-full flex flex-col gap-4 mb-8">
                    <button
                        onClick={() => onSelectMode('SOLO')}
                        className="btn-primary w-full text-lg group overflow-hidden"
                    >
                        <span className="relative z-10 font-['Press_Start_2P']">🕹️ 1 PLAYER SOLO</span>
                    </button>

                    <button
                        onClick={() => onSelectMode('TWO_PLAYER')}
                        className="btn-success w-full text-lg group"
                    >
                        <span className="relative z-10 font-['Press_Start_2P']">🤜🤛 2 PLAYER VS</span>
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
                                onClick={() => onSelectMode('VS_CPU', cpu)}
                                className="glass-panel p-4 flex flex-col items-center justify-center gap-2 hover:border-purple-500 transition-all hover:scale-105 group"
                            >
                                <div className="text-[10px] text-white font-['Press_Start_2P'] group-hover:text-purple-300">
                                    {cpu.name.split(' ')[0]}
                                </div>
                                <div className="px-2 py-1 bg-purple-900/40 border border-purple-500 rounded text-[8px] text-purple-200 font-['Press_Start_2P']">
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
