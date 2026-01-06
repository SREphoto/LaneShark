import React from 'react';
import { STAGES } from '../data/stages';
import { StageId } from '../types';

interface StageSelectProps {
    currentLevel: number;
    onSelect: (stageId: StageId) => void;
    onClose: () => void;
}

const StageSelect: React.FC<StageSelectProps> = ({ currentLevel, onSelect, onClose }) => {
    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl border-4 border-white bg-black p-8 flex flex-col items-center animate-scale-in shadow-[12px_12px_0_rgba(0,0,0,0.5)]">
                <h2 className="text-2xl font-['Press_Start_2P'] text-white mb-8">SELECT STAGE</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {STAGES.map(stage => {
                        const isLocked = currentLevel < stage.unlockLevel;
                        return (
                            <button
                                key={stage.id}
                                disabled={isLocked}
                                onClick={() => onSelect(stage.id)}
                                className={`relative border-4 p-4 flex flex-col gap-2 transition-all ${isLocked
                                        ? 'border-gray-800 bg-gray-900 cursor-not-allowed opacity-60'
                                        : 'border-white bg-gray-950 hover:border-yellow-400 hover:-translate-y-1 shadow-[4px_4px_0_rgba(0,0,0,0.5)]'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs font-['Press_Start_2P'] ${isLocked ? 'text-gray-600' : 'text-yellow-400'}`}>
                                        {stage.name}
                                    </span>
                                    {isLocked && <span className="text-[8px] font-['Press_Start_2P'] text-red-500">LVL {stage.unlockLevel}</span>}
                                </div>
                                <p className={`text-[8px] font-['Press_Start_2P'] text-left leading-relaxed ${isLocked ? 'text-gray-700' : 'text-gray-400'}`}>
                                    {stage.description}
                                </p>
                                {!isLocked && (
                                    <div className="mt-2 flex gap-2">
                                        <div className="text-[6px] font-['Press_Start_2P'] text-blue-400">HOOK: x{stage.hookMult}</div>
                                        <div className="text-[6px] font-['Press_Start_2P'] text-emerald-400">GLIDE: x{stage.friction}</div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 text-[10px] font-['Press_Start_2P'] text-gray-500 hover:text-white transition-colors"
                >
                    BACK TO MODES
                </button>
            </div>
        </div>
    );
};

export default StageSelect;
