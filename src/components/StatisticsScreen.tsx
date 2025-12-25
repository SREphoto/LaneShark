/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { GameStatistics, PlayerProfile } from '../types';

interface StatisticsScreenProps {
    stats: GameStatistics;
    profile?: PlayerProfile; // Pass profile to show career stats
    onClose: () => void;
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ stats, profile, onClose }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 animate-fade-in">
            <div className="bg-gray-800 border-4 border-yellow-500 p-6 max-w-md w-full shadow-[0_0_20px_rgba(234,179,8,0.5)] font-['Press_Start_2P'] text-white">
                <h2 className="text-2xl text-yellow-400 text-center mb-6 text-shadow">GAME OVER</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between border-b border-gray-600 pb-2">
                        <span className="text-gray-400">FINAL SCORE</span>
                        <span className="text-xl text-yellow-300">{stats.totalScore}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-blue-300">STRIKES</span>
                        <span>{stats.strikes}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-green-300">SPARES</span>
                        <span>{stats.spares}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-purple-300">ACCURACY</span>
                        <span>{stats.accuracy.toFixed(1)}%</span>
                    </div>
                </div>

                {profile?.career && (
                    <div className="mt-4 pt-4 border-t-2 border-white">
                        <h3 className="text-sm text-yellow-200 mb-2 text-center">CAREER RECORD</h3>
                        <div className="text-xs space-y-2 text-gray-300">
                             <div className="flex justify-between">
                                <span>SOLO HIGH SCORE:</span>
                                <span className="text-white">{profile.career.soloHighScore}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VS CPU RECORD:</span>
                                <span className="text-white">{profile.career.vsCpuWins}W - {profile.career.vsCpuLosses}L</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CURRENT STREAK:</span>
                                <span className={profile.career.currentStreak >= 0 ? "text-green-400" : "text-red-400"}>
                                    {profile.career.currentStreak > 0 ? `+${profile.career.currentStreak} W` : `${profile.career.currentStreak} L`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>TOTAL GAMES:</span>
                                <span className="text-white">{profile.career.gamesPlayed}</span>
                            </div>
                        </div>
                    </div>
                )}

                <button 
                    onClick={onClose}
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-3 border-2 border-white shadow-lg transition-transform active:scale-95 mt-6"
                >
                    CONTINUE
                </button>
            </div>
        </div>
    );
};

export default StatisticsScreen;