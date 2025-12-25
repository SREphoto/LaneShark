/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserInventory, BallMaterial, LaneCondition } from '../types';
import { SHOP_ITEMS } from '../data/shopItems';

interface BallControlsProps {
    spin: number;
    weight: number;
    material: BallMaterial;
    laneCondition: LaneCondition;
    inventory: UserInventory;
    onSpinChange: (val: number) => void;
    onWeightChange: (val: number) => void;
    onMaterialChange: (val: BallMaterial) => void;
    onLaneConditionChange: (val: LaneCondition) => void;
    onClose?: () => void;
}

const BallControls: React.FC<BallControlsProps> = ({
    spin, weight, material, laneCondition, inventory,
    onSpinChange, onWeightChange, onMaterialChange, onLaneConditionChange, onClose
}) => {
    // Filter owned balls
    const ownedBalls = SHOP_ITEMS.filter(item =>
        item.category === 'BALL' && inventory.items.includes(item.id)
    );

    const equippedBall = SHOP_ITEMS.find(i => i.id === inventory.profile?.equippedBallId) || SHOP_ITEMS[0];

    const hasHeavyBall = inventory.items.includes('heavy_ball_license');
    const hasWristGuard = inventory.items.includes('wrist_guard');

    const maxWeight = hasHeavyBall ? 2.5 : 1.8;
    const maxSpin = hasWristGuard ? 0.5 : 0.25;

    return (
        <div className="relative pointer-events-auto bg-gray-950/95 backdrop-blur-xl border-2 border-white/10 p-6 w-[400px] shadow-2xl flex flex-col gap-5 z-50 font-['Press_Start_2P'] rounded-3xl animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-yellow-500 font-bold uppercase tracking-wider">BALL ARSENAL</span>
                    <span className="text-[8px] text-gray-500">READY TO BOWL</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-red-950/40 text-red-500 rounded-xl hover:bg-red-900 hover:text-white transition-all transform hover:rotate-90"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Ball Arsenal Selection */}
            <div className="flex flex-col gap-3">
                <label className="text-[9px] text-blue-400 block tracking-widest uppercase opacity-80">SELECT BALL</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                    {ownedBalls.length > 0 ? ownedBalls.map(ball => {
                        const isEquipped = inventory.profile?.equippedBallId === ball.id;
                        return (
                            <div
                                key={ball.id}
                                onClick={() => {
                                    // Extract properties from effectDescription or just map by name
                                    if (ball.id.includes('heavy') || ball.id.includes('magma') || ball.id.includes('titanium')) onWeightChange(2.5);
                                    else if (ball.id.includes('ice') || ball.id.includes('urethane')) onWeightChange(1.0);
                                    else onWeightChange(1.8);

                                    if (ball.id.includes('resin') || ball.id.includes('magma') || ball.id.includes('quantum') || ball.id.includes('titanium')) onMaterialChange('RESIN');
                                    else if (ball.id.includes('urethane')) onMaterialChange('URETHANE');
                                    else onMaterialChange('PLASTIC');
                                }}
                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${isEquipped ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                            >
                                <p className="text-[7px] text-white mb-1">{ball.name}</p>
                                <p className="text-[6px] text-gray-500 leading-tight">{ball.effectDescription}</p>
                            </div>
                        );
                    }) : (
                        <div className="col-span-2 p-4 border-2 border-dashed border-white/10 rounded-xl text-center">
                            <p className="text-[8px] text-gray-600">NO CUSTOM BALLS</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Ball Description */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] text-yellow-400 mb-2 uppercase">{equippedBall.name}</p>
                <p className="text-[8px] text-gray-400 leading-relaxed italic">"{equippedBall.description}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Weight Selection */}
                <div className="flex flex-col gap-3">
                    <label className="text-[9px] text-blue-400 block tracking-widest uppercase opacity-80">WEIGHT</label>
                    <div className="flex flex-col gap-2">
                        {[1.0, 1.8, 2.5].map((w, idx) => {
                            const labels = ['10lb (LITE)', '14lb (MED)', '16lb (HVY)'];
                            const isSelected = Math.abs(weight - w) < 0.1;
                            const isLocked = w > maxWeight;
                            return (
                                <button
                                    key={w}
                                    onClick={() => !isLocked && onWeightChange(w)}
                                    disabled={isLocked}
                                    title={isLocked ? "Unlocks with Heavy Ball License" : ""}
                                    className={`py-3 px-4 text-[7px] border-2 font-bold rounded-xl transition-all ${isSelected ? 'bg-emerald-600 border-white text-white shadow-emerald-glow' : isLocked ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed opacity-40' : 'bg-gray-800/50 border-white/5 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    {labels[idx]} {isLocked && '🔒'}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Core Selection */}
                <div className="flex flex-col gap-3">
                    <label className="text-[9px] text-blue-400 block tracking-widest uppercase opacity-80">MATERIAL</label>
                    <div className="flex flex-col gap-2">
                        {[{ id: 'PLASTIC', label: 'PLASTIC' }, { id: 'URETHANE', label: 'URETHANE' }, { id: 'RESIN', label: 'REACTIVE' }].map((m) => {
                            const isSelected = material === m.id;
                            // Basic material locking (legacy) or just allow any if they own any ball?
                            // Let's keep it simple: allow any material, but custom balls provide bonuses.
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => onMaterialChange(m.id as BallMaterial)}
                                    className={`py-3 px-4 text-[7px] border-2 font-bold rounded-xl transition-all ${isSelected ? 'bg-purple-600 border-white text-white shadow-purple-glow' : 'bg-gray-800/50 border-white/5 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Spin Slider */}
            <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <label htmlFor="spin-slider" className="text-[9px] text-blue-400 font-bold tracking-widest uppercase opacity-80">HOOK POTENTIAL</label>
                    <span className="text-[8px] text-red-500 font-bold px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                        {spin < -0.1 ? 'LEFT HOOK' : spin > 0.1 ? 'RIGHT HOOK' : 'STRAIGHT'}
                    </span>
                </div>
                <input
                    id="spin-slider"
                    type="range"
                    min={-maxSpin}
                    max={maxSpin}
                    step="0.05"
                    value={spin}
                    onChange={(e) => onSpinChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    title="Adjust ball hook amount"
                />
            </div>

            <div className="text-center">
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-[10px] shadow-lg hover:shadow-blue-glow active:scale-95 transition-all"
                >
                    CONFIRM SETUP
                </button>
                <div className="mt-4 text-gray-500 text-[7px] leading-relaxed uppercase tracking-tighter">
                    Ready to compete in the LanesHark Pro Tour
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.4); border-radius: 10px; }
            `}</style>
        </div>
    );
};
export default BallControls;
