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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95">
             <div className="flex flex-col gap-6 items-center w-full max-w-md p-6 border-4 border-blue-500 bg-black shadow-[0_0_20px_#3b82f6]">
                 <h2 className="text-3xl text-yellow-400 font-['Press_Start_2P'] mb-4 text-center text-shadow">SELECT MODE</h2>
                 
                 <button 
                    onClick={() => onSelectMode('SOLO')}
                    className="w-full py-4 bg-gray-800 hover:bg-gray-700 border-2 border-white text-white font-['Press_Start_2P'] text-sm"
                 >
                    1 PLAYER
                 </button>

                 <button 
                    onClick={() => onSelectMode('TWO_PLAYER')}
                    className="w-full py-4 bg-gray-800 hover:bg-gray-700 border-2 border-white text-white font-['Press_Start_2P'] text-sm"
                 >
                    2 PLAYER (VS)
                 </button>

                 <div className="w-full border-t border-gray-600 my-2"></div>
                 
                 <div className="text-white font-['Press_Start_2P'] text-xs mb-2 text-center">VS CPU</div>
                 <div className="flex w-full gap-2">
                     {CPU_OPPONENTS.map(cpu => (
                         <button
                            key={cpu.id}
                            onClick={() => onSelectMode('VS_CPU', cpu)}
                            className="flex-1 py-3 bg-red-900 hover:bg-red-800 border border-red-500 text-white font-['Press_Start_2P'] text-[10px]"
                         >
                            {cpu.name.split(' ')[0]}<br/>
                            <span className="text-gray-400">Lvl {cpu.difficulty * 10}</span>
                         </button>
                     ))}
                 </div>
             </div>
        </div>
    );
};

export default ModeSelect;
