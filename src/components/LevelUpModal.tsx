/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { PlayerProfile, PlayerStats } from '../types';

interface LevelUpModalProps {
    profile: PlayerProfile;
    onSave: (updatedProfile: PlayerProfile) => void;
}

const STAT_LABELS: Record<keyof PlayerStats, string> = {
    strength: 'STRENGTH',
    control: 'CONTROL',
    accuracy: 'ACCURACY',
    endurance: 'ENDURANCE',
    crowdControl: 'CROWD',
    specialty: 'SPECIALTY'
};

const STAT_DESCS: Record<keyof PlayerStats, string> = {
    strength: 'Increases throw power',
    control: 'Spin consistency',
    accuracy: 'Aim stability',
    endurance: 'Stamina for tournaments',
    crowdControl: 'Bonus XP/Money',
    specialty: 'Trick shot ability'
};

const LevelUpModal: React.FC<LevelUpModalProps> = ({ profile, onSave }) => {
    const [stats, setStats] = useState<PlayerStats>({ ...profile.stats });
    const [points, setPoints] = useState(profile.statPoints);

    const handleIncrement = (statKey: keyof PlayerStats) => {
        if (points > 0) {
            setStats(prev => ({ ...prev, [statKey]: prev[statKey] + 1 }));
            setPoints(prev => prev - 1);
        }
    };

    const handleConfirm = () => {
        onSave({
            ...profile,
            stats,
            statPoints: points
        });
    };

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-95">
            <div className="w-full max-w-md bg-gray-900 border-4 border-yellow-400 p-4 text-white font-['Press_Start_2P'] shadow-[0_0_30px_#ecc94b]">
                <h2 className="text-xl text-yellow-400 text-center mb-2 animate-pulse">LEVEL UP!</h2>
                <div className="text-center text-sm mb-6 text-green-400">POINTS AVAILABLE: {points}</div>

                <div className="space-y-3 mb-6">
                    {(Object.keys(stats) as Array<keyof PlayerStats>).map(key => (
                        <div key={key} className="flex flex-col border-b border-gray-700 pb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-blue-300">{STAT_LABELS[key]}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-yellow-200">{stats[key]}</span>
                                    <button 
                                        onClick={() => handleIncrement(key)}
                                        disabled={points === 0}
                                        className={`w-6 h-6 flex items-center justify-center border ${points > 0 ? 'bg-green-600 border-white hover:bg-green-500' : 'bg-gray-700 border-gray-600 text-gray-500'}`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <span className="text-[9px] text-gray-500">{STAT_DESCS[key]}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleConfirm}
                    className="w-full py-3 bg-blue-600 border-2 border-white hover:bg-blue-500 shadow-lg text-sm"
                >
                    CONFIRM
                </button>
            </div>
        </div>
    );
};

export default LevelUpModal;
