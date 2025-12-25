
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
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in bg-[#0f0c29]/90 backdrop-blur-2xl">
            <div className="relative w-full max-w-md glass-card p-10 flex flex-col animate-slide-up border-2 border-emerald-500/40 bg-black/50">

                {/* Header Section */}
                <div className="text-center mb-8 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                    <h2 className="relative text-3xl font-['Press_Start_2P'] text-emerald-400 mb-2 shadow-emerald-glow">
                        LEVEL UP!
                    </h2>
                    <div className="relative flex items-center justify-center gap-2">
                        <span className="text-[10px] font-['Press_Start_2P'] text-gray-400 uppercase tracking-widest">Available Points:</span>
                        <span className="text-xl font-['Press_Start_2P'] text-white animate-bounce-slow">
                            {points}
                        </span>
                    </div>
                </div>

                {/* Stats List */}
                <div className="space-y-4 mb-8">
                    {(Object.keys(stats) as Array<keyof PlayerStats>).map(key => (
                        <div key={key} className="glass-panel p-4 flex flex-col transition-all hover:bg-white/5 border border-white/5 hover:border-emerald-500/20">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-['Press_Start_2P'] text-blue-400 uppercase">
                                        {STAT_LABELS[key]}
                                    </span>
                                    <span className="text-[7px] font-['Press_Start_2P'] text-gray-600 mt-1">
                                        {STAT_DESCS[key]}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-['Press_Start_2P'] text-white w-6 text-center">
                                        {stats[key]}
                                    </span>
                                    <button
                                        onClick={() => handleIncrement(key)}
                                        disabled={points === 0}
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all active:scale-90 ${points > 0
                                                ? 'btn-success bg-gradient-to-br from-emerald-500 to-green-600 border-white/30 text-white shadow-emerald-glow'
                                                : 'bg-gray-800/50 border-white/5 text-gray-700 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="text-xl leading-none font-bold">+</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    className="btn-primary w-full py-5 text-sm font-['Press_Start_2P'] tracking-wider shadow-glow-effect group"
                >
                    <span className="group-hover:scale-110 transition-transform block">UNLOCK POTENTIAL</span>
                </button>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-xl p-6" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-xl p-6" />
            </div>
        </div>
    );
};

export default LevelUpModal;
