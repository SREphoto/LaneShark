
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            {/* Animated Background with Particles */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-black/98 to-purple-950/95 backdrop-blur-xl">
                {/* Particle Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: ['#34d399', '#fbbf24', '#a78bfa', '#60a5fa'][i % 4],
                                animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                                opacity: 0.5 + Math.random() * 0.5
                            }}
                        />
                    ))}
                </div>
                {/* Radial glow behind modal */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-lg glass-card p-8 flex flex-col animate-slide-up border-2 border-emerald-400/50 bg-black/70 shadow-2xl rounded-2xl overflow-hidden">

                {/* Glowing Corner Accents */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />

                {/* Header Section */}
                <div className="text-center mb-6 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />

                    {/* Level Badge */}
                    <div className="relative inline-flex items-center justify-center mb-4">
                        <div className="absolute w-28 h-28 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full blur-md animate-pulse" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center border-4 border-white/40 shadow-2xl">
                            <span className="text-4xl font-['Press_Start_2P'] text-white drop-shadow-lg">{profile.level}</span>
                        </div>
                    </div>

                    <h2 className="relative text-4xl font-['Press_Start_2P'] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-300 mb-3 animate-pulse">
                        LEVEL UP!
                    </h2>
                    <p className="text-[10px] font-['Press_Start_2P'] text-emerald-200/80 tracking-widest">
                        You've reached new heights!
                    </p>
                </div>

                {/* Reward Summary */}
                <div className="glass-panel bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] font-['Press_Start_2P'] text-gray-400">REWARD</span>
                        <span className="text-[9px] font-['Press_Start_2P'] text-emerald-400">+2 STAT POINTS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 text-center py-2 bg-black/30 rounded-lg border border-white/5">
                            <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 block mb-1">AVAILABLE</span>
                            <span className="text-2xl font-['Press_Start_2P'] text-yellow-400 animate-bounce">{points}</span>
                        </div>
                        <div className="flex-1 text-center py-2 bg-black/30 rounded-lg border border-white/5">
                            <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 block mb-1">TOTAL XP</span>
                            <span className="text-lg font-['Press_Start_2P'] text-emerald-300">{profile.xp}</span>
                        </div>
                    </div>
                </div>

                {/* Stats List - Compact */}
                <div className="grid grid-cols-2 gap-3 mb-6 max-h-[240px] overflow-y-auto custom-shop-scrollbar pr-1">
                    {(Object.keys(stats) as Array<keyof PlayerStats>).map(key => (
                        <div key={key} className="glass-panel p-3 flex items-center justify-between transition-all hover:bg-emerald-900/20 border border-white/5 hover:border-emerald-500/30 rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-['Press_Start_2P'] text-blue-400 uppercase">
                                    {STAT_LABELS[key]}
                                </span>
                                <span className="text-[6px] font-['Press_Start_2P'] text-gray-600 mt-0.5">
                                    {STAT_DESCS[key]}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-base font-['Press_Start_2P'] text-white w-5 text-center">
                                    {stats[key]}
                                </span>
                                <button
                                    onClick={() => handleIncrement(key)}
                                    disabled={points === 0}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border-2 transition-all active:scale-90 ${points > 0
                                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 border-white/40 text-white shadow-lg hover:shadow-emerald-500/50'
                                        : 'bg-gray-900/50 border-white/10 text-gray-700 cursor-not-allowed'
                                        }`}
                                >
                                    <span className="text-lg leading-none font-bold">+</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    className="btn-primary w-full py-4 text-sm font-['Press_Start_2P'] tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 border-2 border-white/30 rounded-xl shadow-lg shadow-emerald-500/30 group transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span className="group-hover:scale-110 transition-transform block">✨ UNLOCK POTENTIAL ✨</span>
                </button>
            </div>
        </div>
    );
};

export default LevelUpModal;
