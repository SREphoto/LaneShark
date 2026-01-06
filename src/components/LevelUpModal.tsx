
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
    strength: 'Raw power for pin impact',
    control: 'Hook stability & response',
    accuracy: 'Precision and aim speed',
    endurance: 'Stability over long games',
    crowdControl: 'Earning & XP multipliers',
    specialty: 'Advanced physics mastery'
};

const LevelUpModal: React.FC<LevelUpModalProps> = ({ profile, onSave }) => {
    const [stats, setStats] = useState<PlayerStats>({ ...profile.stats });
    const [points, setPoints] = useState(profile.statPoints);

    // Sync state if profile changes (e.g. nested level ups or sync delay)
    React.useEffect(() => {
        setStats({ ...profile.stats });
        setPoints(profile.statPoints);
    }, [profile.level, profile.statPoints]);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            {/* Solid Retro Background */}
            <div className="absolute inset-0 bg-black/90" />

            <div className="relative w-full max-w-lg border-4 border-white bg-[#000] p-8 flex flex-col animate-slide-up shadow-[12px_12px_0_rgba(0,0,0,0.5)]">

                {/* Header Section */}
                <div className="text-center mb-6 relative">
                    {/* Level Badge */}
                    <div className="relative inline-flex items-center justify-center mb-4">
                        <div className="w-24 h-24 bg-emerald-600 flex items-center justify-center border-4 border-white shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
                            <span className="text-4xl font-['Press_Start_2P'] text-white">{profile.level}</span>
                        </div>
                    </div>

                    <h2 className="relative text-4xl font-['Press_Start_2P'] text-emerald-400 mb-3 uppercase">
                        LEVEL UP!
                    </h2>
                </div>

                {/* Reward Summary */}
                <div className="border-4 border-emerald-900 bg-emerald-950/20 p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-['Press_Start_2P'] text-gray-400">REWARD</span>
                        <span className="text-[9px] font-['Press_Start_2P'] text-emerald-400">+2 STAT POINTS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 text-center py-2 bg-black border-2 border-white/10">
                            <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 block mb-1">AVAILABLE</span>
                            <span className="text-2xl font-['Press_Start_2P'] text-yellow-400">{points}</span>
                        </div>
                    </div>
                </div>

                {/* Stats List */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                    {(Object.keys(stats) as Array<keyof PlayerStats>).map(key => (
                        <div key={key} className="border-4 border-gray-800 bg-gray-950 p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-['Press_Start_2P'] text-blue-400 uppercase">
                                    {STAT_LABELS[key]}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-base font-['Press_Start_2P'] text-white w-5 text-center">
                                    {stats[key]}
                                </span>
                                <button
                                    onClick={() => handleIncrement(key)}
                                    disabled={points === 0}
                                    className={`w-8 h-8 flex items-center justify-center border-2 ${points > 0
                                        ? 'bg-emerald-600 border-white text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="text-lg font-bold">+</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    className="btn-retro !bg-emerald-600 !border-white w-full py-4 text-sm font-['Press_Start_2P']"
                >
                    CONFIRM STATS
                </button>
            </div>
        </div>
    );
};

export default LevelUpModal;
