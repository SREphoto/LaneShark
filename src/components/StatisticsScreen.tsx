
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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/80 backdrop-blur-xl pointer-events-auto">
            <div className="relative w-full max-w-lg glass-card p-10 flex flex-col animate-slide-up bg-[#1a1a2e]/60 border-2 border-yellow-500/30">

                {/* Header */}
                <div className="text-center mb-10 bloom chromatic-aberration">
                    <h2 className="text-4xl font-['Press_Start_2P'] gradient-text mb-2 tracking-tighter">
                        TOURNAMENT RESULTS
                    </h2>
                    <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full shadow-gold-glow" />
                </div>

                {/* Game Stats */}
                <div className="space-y-6 mb-10">
                    <div className="glass-panel p-6 flex justify-between items-center group hover:bg-white/5 transition-all">
                        <span className="text-[10px] font-['Press_Start_2P'] text-gray-400 group-hover:text-white">FINAL SCORE</span>
                        <span className="text-3xl font-['Press_Start_2P'] gold-text shadow-gold-glow animate-pulse">
                            {stats.totalScore.toLocaleString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 flex flex-col items-center gap-2">
                            <span className="text-[8px] font-['Press_Start_2P'] text-emerald-400">STRIKES</span>
                            <span className="text-lg font-['Press_Start_2P'] text-white">{stats.strikes}</span>
                        </div>
                        <div className="glass-panel p-4 flex flex-col items-center gap-2">
                            <span className="text-[8px] font-['Press_Start_2P'] text-blue-400">SPARES</span>
                            <span className="text-lg font-['Press_Start_2P'] text-white">{stats.spares}</span>
                        </div>
                        <div className="glass-panel p-4 flex flex-col items-center gap-2">
                            <span className="text-[8px] font-['Press_Start_2P'] text-purple-400">ACCURACY</span>
                            <span className="text-sm font-['Press_Start_2P'] text-white">{stats.accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="glass-panel p-4 flex flex-col items-center gap-2">
                            <span className="text-[8px] font-['Press_Start_2P'] text-red-400">GUTTERS</span>
                            <span className="text-sm font-['Press_Start_2P'] text-white">{stats.gutters}</span>
                        </div>
                    </div>
                </div>

                {/* Career Section */}
                {profile?.career && (
                    <div className="glass-panel p-6 bg-purple-900/10 border-purple-500/20 mb-8">
                        <h3 className="text-[9px] font-['Press_Start_2P'] text-purple-400 mb-4 text-center tracking-widest">CAREER ACHIEVEMENTS</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[7px] font-['Press_Start_2P'] text-gray-500 uppercase">Personal Best</span>
                                <span className="text-[10px] font-['Press_Start_2P'] text-white">{profile.career.soloHighScore}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[7px] font-['Press_Start_2P'] text-gray-500 uppercase">Arena Record</span>
                                <span className="text-[10px] font-['Press_Start_2P'] text-emerald-400">
                                    {profile.career.vsCpuWins}W - {profile.career.vsCpuLosses}L
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[7px] font-['Press_Start_2P'] text-gray-500 uppercase">Season Streak</span>
                                <span className={`text-[10px] font-['Press_Start_2P'] ${profile.career.currentStreak >= 0 ? "text-blue-400" : "text-red-400"}`}>
                                    {profile.career.currentStreak > 0 ? `+${profile.career.currentStreak} FIRE` : `${profile.career.currentStreak} COLD`}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={onClose}
                    className="btn-primary w-full py-5 text-sm font-['Press_Start_2P'] group relative overflow-hidden"
                >
                    <span className="relative z-10">🚀 RETURN TO ARENA</span>
                </button>

                {/* Visual Flair */}
                <div className="absolute top-0 right-0 p-4">
                    <div className="w-16 h-16 border-t-2 border-r-2 border-yellow-500/40 rounded-tr-xl" />
                </div>
                <div className="absolute bottom-0 left-0 p-4">
                    <div className="w-16 h-16 border-b-2 border-l-2 border-yellow-500/40 rounded-bl-xl" />
                </div>
            </div>
        </div>
    );
};

export default StatisticsScreen;