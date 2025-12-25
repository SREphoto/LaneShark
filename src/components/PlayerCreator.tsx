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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900 overflow-y-auto">
            <div className="flex flex-col gap-6 items-center w-full max-w-md p-6 border-4 border-blue-500 bg-black shadow-[0_0_20px_#3b82f6] text-white my-8">
                <h2 className="text-2xl text-yellow-400 font-['Press_Start_2P'] mb-4 text-center">CREATE BOWLER</h2>
                
                {/* Avatar Section */}
                {avatar ? (
                    <div className="flex flex-col items-center">
                        <img src={avatar} alt="Avatar" className="w-32 h-32 border-4 border-white shadow-lg mb-2 object-cover" />
                        <button 
                            onClick={() => setAvatar(null)}
                            className="text-xs text-red-400 hover:text-red-300 underline font-['Press_Start_2P']"
                        >
                            CHANGE AVATAR
                        </button>
                    </div>
                ) : (
                    <AvatarGenerator onAvatarGenerated={setAvatar} />
                )}

                <div className="w-full">
                    <label className="block text-xs font-['Press_Start_2P'] mb-2 text-blue-300">NAME</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={10}
                        className="w-full bg-gray-800 border-2 border-gray-600 p-2 text-white font-['Press_Start_2P'] focus:border-yellow-400 outline-none uppercase"
                        placeholder="ENTER NAME"
                    />
                </div>

                <div className="w-full">
                    <label className="block text-xs font-['Press_Start_2P'] mb-2 text-blue-300">HANDEDNESS</label>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setHand('LEFT')}
                            className={`flex-1 py-3 border-2 font-['Press_Start_2P'] text-xs ${hand === 'LEFT' ? 'bg-green-600 border-white' : 'bg-gray-800 border-gray-600'}`}
                        >
                            LEFTY
                        </button>
                        <button 
                            onClick={() => setHand('RIGHT')}
                            className={`flex-1 py-3 border-2 font-['Press_Start_2P'] text-xs ${hand === 'RIGHT' ? 'bg-green-600 border-white' : 'bg-gray-800 border-gray-600'}`}
                        >
                            RIGHTY
                        </button>
                    </div>
                </div>

                <div className="text-xs text-gray-400 font-['Press_Start_2P'] text-center mt-2">
                    Start your career to earn XP and unlock abilities!
                </div>

                <button 
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className={`w-full py-4 mt-4 border-2 font-['Press_Start_2P'] text-sm ${!name.trim() ? 'bg-gray-700 border-gray-600 text-gray-500' : 'bg-yellow-600 border-white text-white hover:bg-yellow-500 shadow-lg'}`}
                >
                    START CAREER
                </button>
            </div>
        </div>
    );
};

export default PlayerCreator;