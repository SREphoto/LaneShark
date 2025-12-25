
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { ThrowStep, UserInventory, BallMaterial } from '../types';

interface ThrowSequenceProps {
    step: ThrowStep;
    onNext: () => void;
    userWeight: number;
    userSpin: number;
    inventory: UserInventory;
    onWeightChange: (w: number) => void;
    onSpinChange: (s: number) => void;
    onPositionMove: (x: number) => void;
    onAimMove: (angle: number) => void;
    ballX: number;
    ballAngle: number;
}

const ThrowSequence: React.FC<ThrowSequenceProps> = ({
    step, onNext, userWeight, userSpin, inventory, 
    onWeightChange, onSpinChange, onPositionMove, onAimMove,
    ballX, ballAngle
}) => {
    const [aimDirection, setAimDirection] = useState(1);
    const aimRef = useRef<number>(ballAngle);

    const hasHeavyBall = inventory.items.includes('heavy_ball_license');
    const maxWeight = hasHeavyBall ? 2.5 : 1.8;

    useEffect(() => {
        if (step === 'AIM') {
            const interval = setInterval(() => {
                // Slower movement: changed increment from 1.5 to 0.7
                let nextAngle = aimRef.current + aimDirection * 0.7;
                if (nextAngle > 18) { setAimDirection(-1); nextAngle = 18; }
                if (nextAngle < -18) { setAimDirection(1); nextAngle = -18; }
                aimRef.current = nextAngle;
                onAimMove(nextAngle);
            }, 16);
            return () => clearInterval(interval);
        }
    }, [step, aimDirection, onAimMove]);

    const stepsList: { id: ThrowStep, label: string }[] = [
        { id: 'WEIGHT', label: '1. CHOOSE WEIGHT' },
        { id: 'SPIN', label: '2. PICK SPIN' },
        { id: 'POSITION', label: '3. POSITION' },
        { id: 'AIM', label: '4. AIM THROW' },
        { id: 'POWER', label: '5. SET POWER' },
        { id: 'RELEASE', label: '6. RELEASE!' },
    ];

    const currentIdx = stepsList.findIndex(s => s.id === step);

    return (
        <div className="absolute top-16 right-4 w-72 pointer-events-auto z-50 flex flex-col gap-4">
            {/* Step Track */}
            <div className="bg-black/90 border-2 border-yellow-500 p-3 font-['Press_Start_2P'] shadow-[4px_4px_0px_#000]">
                <div className="text-[8px] text-yellow-500/60 mb-2">SEQUENCE PROGRESS</div>
                <div className="grid grid-cols-6 gap-1">
                    {stepsList.map((s, i) => (
                        <div key={s.id} className={`h-2 border ${i <= currentIdx ? 'bg-yellow-500 border-white' : 'bg-gray-800 border-gray-600'}`}></div>
                    ))}
                </div>
            </div>

            {/* Main Interaction Area */}
            <div className="bg-gray-900 border-4 border-white p-5 shadow-[8px_8px_0px_#000] font-['Press_Start_2P'] animate-fade-in">
                <div className="text-yellow-400 text-[10px] mb-5 text-center leading-relaxed underline underline-offset-4">{stepsList[currentIdx].label}</div>

                <div className="min-h-[100px] flex flex-col justify-center">
                    {step === 'WEIGHT' && (
                        <div className="flex flex-col gap-3">
                            {[1.0, 1.8, 2.5].map((w, idx) => {
                                const isLocked = w > maxWeight;
                                const isSelected = Math.abs(userWeight - w) < 0.1;
                                return (
                                    <button key={w} disabled={isLocked} onClick={() => onWeightChange(w)}
                                        className={`py-3 text-[8px] border-2 transition-all ${isSelected ? 'bg-red-600 border-white shadow-[2px_2px_0px_#000]' : isLocked ? 'bg-gray-800 text-gray-600 border-gray-700' : 'bg-gray-700 border-gray-500 hover:bg-gray-600 text-white'}`}>
                                        {['10lb (LIGHT)', '14lb (NORMAL)', '16lb (HEAVY)'][idx]} {isLocked && '🔒'}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {step === 'SPIN' && (
                        <div className="flex flex-col items-center">
                            <div className="text-white text-[8px] mb-4">HOOK: {userSpin > 0 ? `+${userSpin.toFixed(2)}` : userSpin.toFixed(2)}</div>
                            <input type="range" min="-0.5" max="0.5" step="0.05" value={userSpin} onChange={(e) => onSpinChange(parseFloat(e.target.value))} className="w-full accent-blue-500 mb-4" />
                            <div className="flex justify-between w-full text-[6px] text-gray-500">
                                <span>LEFT HOOK</span><span>STRAIGHT</span><span>RIGHT HOOK</span>
                            </div>
                        </div>
                    )}

                    {step === 'POSITION' && (
                        <div className="flex flex-col items-center">
                            <div className="text-white text-[8px] mb-5">DRAG TO SHIFT</div>
                            <input type="range" min="80" max="320" value={ballX} onChange={(e) => onPositionMove(parseFloat(e.target.value))} className="w-full accent-green-500" />
                            <div className="text-[6px] text-gray-500 mt-2">CENTER: 200</div>
                        </div>
                    )}

                    {step === 'AIM' && (
                        <div className="flex flex-col items-center">
                            <div className="text-[9px] text-blue-400 animate-pulse mb-4 tracking-tighter">WATCH THE ARROW!</div>
                            <div className="text-white text-[12px] font-bold border-2 border-blue-500 px-4 py-2 bg-blue-900/30">
                                {ballAngle > 0 ? 'R' : ballAngle < 0 ? 'L' : ''} {Math.abs(ballAngle).toFixed(1)}°
                            </div>
                        </div>
                    )}

                    {step === 'POWER' && (
                        <div className="flex flex-col items-center">
                            <div className="w-full h-6 bg-gray-800 border-2 border-white relative overflow-hidden mb-3">
                                 <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-600 animate-pulse shadow-[0_0_10px_#f00]" style={{ width: '100%' }}></div>
                            </div>
                            <div className="text-[8px] text-red-400 animate-pulse font-bold">MAX VELOCITY!</div>
                        </div>
                    )}

                    {step === 'RELEASE' && (
                        <div className="flex flex-col items-center py-2">
                            <div className="text-green-400 text-[12px] mb-3 animate-bounce font-bold">READY TO FIRE!</div>
                            <div className="text-[7px] text-gray-500">CLICK BOWL TO RELEASE</div>
                        </div>
                    )}
                </div>

                <button onClick={onNext} className="w-full mt-8 py-4 bg-blue-600 border-2 border-white text-white text-[10px] hover:bg-blue-500 shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                    {step === 'RELEASE' ? 'BOWL!' : 'CONFIRM >'}
                </button>
            </div>

            <style>{`
                input[type=range] { -webkit-appearance: none; background: #333; height: 12px; border: 2px solid white; cursor: pointer; }
                input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 12px; background: #fff; border: 2px solid #000; box-shadow: 2px 2px 0px #000; }
            `}</style>
        </div>
    );
};

export default ThrowSequence;
