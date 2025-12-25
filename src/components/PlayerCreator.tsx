
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Handedness, PlayerProfile, PlayerStats } from '../types';
import AvatarGenerator from './AvatarGenerator';

interface PlayerCreatorProps {
    onComplete: (profile: PlayerProfile) => void;
}

const INITIAL_STATS: PlayerStats = {
    strength: 1,
    accuracy: 1,
    control: 1,
    endurance: 1,
    crowdControl: 1,
    specialty: 0
};

const PlayerCreator: React.FC<PlayerCreatorProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [hand, setHand] = useState<Handedness>('RIGHT');
    const [avatar, setAvatar] = useState<string | null>(null);

    const handleCreate = () => {
        if (!name.trim()) return;
        const newProfile: PlayerProfile = {
            name: name.trim().toUpperCase(),
            handedness: hand,
            stats: { ...INITIAL_STATS },
            level: 1,
            xp: 0,
            statPoints: 0,
            avatarImage: avatar || undefined,
            career: {
                gamesPlayed: 0,
                soloHighScore: 0,
                vsCpuWins: 0,
                vsCpuLosses: 0,
                currentStreak: 0
            }
        };
        onComplete(newProfile);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-[#0f0c29]/80 backdrop-blur-md">
            <div className="relative w-full max-w-xl glass-card p-10 flex flex-col items-center animate-slide-up bg-black/40">

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-['Press_Start_2P'] gradient-text mb-2">
                        CHAMPION CREATOR
                    </h2>
                    <p className="text-[10px] text-gray-400 font-['Press_Start_2P'] tracking-widest">
                        ESTABLISH YOUR BOWLING LEGACY
                    </p>
                </div>

                {/* Avatar Section */}
                <div className="mb-8 w-full flex flex-col items-center">
                    <div className="relative group">
                        {avatar ? (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="p-1 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-gold-glow">
                                    <img
                                        src={avatar}
                                        alt="Avatar"
                                        className="w-40 h-40 rounded-xl border-2 border-white/50 object-cover shadow-2xl"
                                    />
                                </div>
                                <button
                                    onClick={() => setAvatar(null)}
                                    className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] text-gray-400 hover:text-white hover:bg-white/10 transition-all font-['Press_Start_2P']"
                                >
                                    🔄 REDESIGN AVATAR
                                </button>
                            </div>
                        ) : (
                            <div className="glass-panel p-6 animate-pulse-glow">
                                <AvatarGenerator onAvatarGenerated={setAvatar} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full space-y-6">
                    {/* Name Input */}
                    <div className="w-full">
                        <label className="block text-[8px] font-['Press_Start_2P'] mb-3 text-purple-400 uppercase tracking-widest">
                            CHAMPION NAME
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={12}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-lg p-4 text-white font-['Press_Start_2P'] text-sm focus:border-purple-500 focus:bg-white/10 transition-all outline-none uppercase placeholder:text-gray-700"
                            placeholder="ENTER NAME..."
                        />
                    </div>

                    {/* Handedness Selection */}
                    <div className="w-full">
                        <label className="block text-[8px] font-['Press_Start_2P'] mb-3 text-emerald-400 uppercase tracking-widest">
                            HAND DOMINANCE
                        </label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setHand('LEFT')}
                                className={`flex-1 py-4 rounded-lg font-['Press_Start_2P'] text-[10px] transition-all border-2 ${hand === 'LEFT'
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 border-white text-white shadow-glow'
                                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                ⬅️ LEFTY
                            </button>
                            <button
                                onClick={() => setHand('RIGHT')}
                                className={`flex-1 py-4 rounded-lg font-['Press_Start_2P'] text-[10px] transition-all border-2 ${hand === 'RIGHT'
                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 border-white text-white shadow-glow'
                                        : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                RIGHTY ➡️
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 w-full space-y-4">
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim()}
                        className={`w-full py-5 rounded-xl font-['Press_Start_2P'] text-sm tracking-wider transition-all border-2 ${!name.trim()
                                ? 'bg-gray-800/50 border-white/5 text-gray-700 cursor-not-allowed'
                                : 'btn-gold animate-pulse-glow shadow-gold-glow border-white/30 text-white'
                            }`}
                    >
                        🏆 BEGIN LEGACY
                    </button>

                    <p className="text-[7px] text-gray-600 font-['Press_Start_2P'] text-center uppercase tracking-tighter">
                        * Stat bonuses and equipment will unlock after your first frames
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PlayerCreator;