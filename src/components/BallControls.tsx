
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { UserInventory, BallMaterial, LaneCondition } from '../types';

interface BallControlsProps {
    spin: number;
    weight: number;
    material: BallMaterial;
    laneCondition: LaneCondition;
    inventory: UserInventory;
    volume?: number;
    onSpinChange: (val: number) => void;
    onWeightChange: (val: number) => void;
    onMaterialChange: (val: BallMaterial) => void;
    onLaneConditionChange: (val: LaneCondition) => void;
    onVolumeChange?: (val: number) => void;
    onClose?: () => void;
}

const BallControls: React.FC<BallControlsProps> = ({ 
    spin, weight, material, laneCondition, inventory, volume = 0.5,
    onSpinChange, onWeightChange, onMaterialChange, onLaneConditionChange, onVolumeChange, onClose 
}) => {
    const hasHeavyBall = inventory.items.includes('heavy_ball_license');
    const hasWristGuard = inventory.items.includes('wrist_guard');
    const hasUrethane = inventory.items.includes('urethane_ball');
    const hasResin = inventory.items.includes('resin_ball');

    const maxWeight = hasHeavyBall ? 2.5 : 1.8;
    const maxSpin = hasWristGuard ? 0.5 : 0.25; 

    return (
        <div className="ball-controls-panel relative pointer-events-auto bg-gray-900 border-2 border-yellow-600 p-3 mb-2 w-80 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex flex-col gap-3 z-50 font-['Press_Start_2P']">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-1">
                <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">GAME SETUP</span>
                {onClose && (
                    <button onClick={onClose} className="text-[10px] text-red-500 hover:text-white">[X]</button>
                )}
            </div>

            {onVolumeChange && (
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-[8px] text-yellow-400 block tracking-widest uppercase">Announcer Vol</label>
                        <span className="text-[8px] text-white">{Math.floor(volume * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="1" step="0.01" value={volume} 
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))} 
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                </div>
            )}

            <div>
                <label className="text-[8px] text-yellow-400 block mb-1 tracking-widest">BALL WEIGHT</label>
                <div className="flex justify-between gap-1">
                    {[1.0, 1.8, 2.5].map((w, idx) => {
                         const labels = ['10lb', '14lb', '16lb'];
                         const isSelected = Math.abs(weight - w) < 0.1;
                         const isLocked = w > maxWeight;
                         return (
                            <button key={w} onClick={() => !isLocked && onWeightChange(w)} disabled={isLocked}
                                className={`flex-1 py-1 text-[8px] border-2 font-bold ${isSelected ? 'bg-red-600 border-white text-white' : isLocked ? 'bg-gray-800 border-gray-700 text-gray-600' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                                {labels[idx]} {isLocked && '🔒'}
                            </button>
                         );
                    })}
                </div>
            </div>

            <div>
                <label className="text-[8px] text-yellow-400 block mb-1 tracking-widest">COVERSTOCK</label>
                <div className="flex justify-between gap-1">
                    {[{ id: 'PLASTIC', label: 'PLAST' }, { id: 'URETHANE', label: 'URETH' }, { id: 'RESIN', label: 'RESIN' }].map((m) => {
                        const isLocked = (m.id === 'URETHANE' && !hasUrethane) || (m.id === 'RESIN' && !hasResin);
                        return (
                            <button key={m.id} onClick={() => !isLocked && onMaterialChange(m.id as BallMaterial)} disabled={isLocked}
                                className={`flex-1 py-1 text-[8px] border-2 font-bold ${material === m.id ? 'bg-purple-600 border-white text-white' : isLocked ? 'bg-gray-800 border-gray-700 text-gray-600' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                                {m.label} {isLocked && '🔒'}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-1">
                    <label className="text-[8px] text-yellow-400 font-bold tracking-widest">SPIN</label>
                    <span className="text-[8px] text-red-400 font-bold">{spin < -0.1 ? 'LEFT' : spin > 0.1 ? 'RIGHT' : 'STRAIGHT'}</span>
                </div>
                <input type="range" min={-maxSpin} max={maxSpin} step="0.05" value={spin} onChange={(e) => onSpinChange(parseFloat(e.target.value))} className="w-full cursor-pointer accent-red-500" />
            </div>

            <div className="mt-2 text-center text-gray-500 text-[7px]">PC: ARROWS TO MOVE | SPACE TO ROLL</div>
        </div>
    );
};
export default BallControls;
