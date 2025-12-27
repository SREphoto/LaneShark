/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserInventory } from '../types';
import { ACHIEVEMENTS, DAILY_CHALLENGES, MILESTONES, TIER_COLORS } from '../data/progression';
import { LEVELS } from '../constants';

interface ProgressionPanelProps {
    inventory: UserInventory;
    onClose: () => void;
}

const ProgressionPanel: React.FC<ProgressionPanelProps> = ({ inventory, onClose }) => {
    const profile = inventory.profile;
    const stats = inventory.lifetimeStats || {
        totalStrikes: 0,
        totalSpares: 0,
        totalPinsKnocked: 0,
        gamesPlayed: 0,
        highScore: 0,
        bestStreak: 0,
        perfectGames: 0
    };
    const unlockedAchievements = inventory.unlockedAchievements || [];
    const dailyProgress = inventory.dailyProgress;

    // Get next achievements to unlock
    const getNextAchievements = () => {
        return ACHIEVEMENTS.filter(a => !unlockedAchievements.includes(a.id)).slice(0, 4);
    };

    // Get achievement progress
    const getAchievementProgress = (achievement: typeof ACHIEVEMENTS[0]): number => {
        switch (achievement.type) {
            case 'STRIKES': return Math.min(100, (stats.totalStrikes / achievement.requirement) * 100);
            case 'SPARES': return Math.min(100, (stats.totalSpares / achievement.requirement) * 100);
            case 'GAMES_PLAYED': return Math.min(100, (stats.gamesPlayed / achievement.requirement) * 100);
            case 'HIGH_SCORE': return Math.min(100, (stats.highScore / achievement.requirement) * 100);
            case 'STREAK': return Math.min(100, (stats.bestStreak / achievement.requirement) * 100);
            case 'LEVEL': return Math.min(100, ((profile?.level || 1) / achievement.requirement) * 100);
            case 'TOTAL_PINS': return Math.min(100, (stats.totalPinsKnocked / achievement.requirement) * 100);
            default: return 0;
        }
    };

    // Get next milestone
    const currentXp = profile?.xp || 0;
    const nextMilestone = MILESTONES.find(m => m.xp > currentXp);

    // Check today's date for daily challenges
    const today = new Date().toISOString().split('T')[0];
    const isTodayProgress = dailyProgress?.date === today;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-shop-scrollbar bg-gradient-to-br from-gray-900 via-purple-950/50 to-gray-900 rounded-2xl border border-purple-500/30 shadow-2xl animate-scale-in">

                {/* Header */}
                <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {profile?.avatarImage && (
                            <img src={profile.avatarImage} alt="Avatar" className="w-16 h-16 rounded-xl border-2 border-purple-500/50" />
                        )}
                        <div>
                            <h2 className="text-xl font-['Press_Start_2P'] gradient-text">{profile?.name || 'BOWLER'}</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-3 py-1 bg-yellow-600/40 rounded-lg border border-yellow-500/30 text-[10px] font-['Press_Start_2P'] text-yellow-300">
                                    LVL {profile?.level || 1}
                                </span>
                                <span className="text-[8px] font-['Press_Start_2P'] text-gray-400">
                                    {currentXp.toLocaleString()} XP
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 hover:bg-red-900 transition-all text-red-400">
                        ✕
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Lifetime Stats */}
                    <div className="glass-panel p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-['Press_Start_2P'] text-purple-400 mb-4">📊 LIFETIME STATS</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <StatBox label="Games Played" value={stats.gamesPlayed} icon="🎳" />
                            <StatBox label="Total Strikes" value={stats.totalStrikes} icon="🎯" />
                            <StatBox label="Total Spares" value={stats.totalSpares} icon="🎱" />
                            <StatBox label="Pins Knocked" value={stats.totalPinsKnocked} icon="📍" />
                            <StatBox label="High Score" value={stats.highScore} icon="🏆" />
                            <StatBox label="Best Streak" value={stats.bestStreak} icon="🔥" />
                        </div>
                    </div>

                    {/* Next Milestone */}
                    <div className="glass-panel p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-['Press_Start_2P'] text-emerald-400 mb-4">🎯 NEXT MILESTONE</h3>
                        {nextMilestone ? (
                            <div className="flex flex-col gap-3">
                                <div className="text-lg font-['Press_Start_2P'] text-white">{nextMilestone.title}</div>
                                <div className="text-[9px] font-['Press_Start_2P'] text-gray-400">{nextMilestone.reward}</div>
                                <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                                        style={{ width: `${Math.min(100, (currentXp / nextMilestone.xp) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[8px] font-['Press_Start_2P'] text-gray-500">
                                    <span>{currentXp.toLocaleString()} XP</span>
                                    <span>{nextMilestone.xp.toLocaleString()} XP</span>
                                </div>
                                <div className="text-[10px] font-['Press_Start_2P'] text-emerald-400">
                                    Reward: +${nextMilestone.moneyBonus.toLocaleString()}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 font-['Press_Start_2P'] text-[10px]">
                                All milestones complete! 🎉
                            </div>
                        )}
                    </div>

                    {/* Daily Challenges */}
                    <div className="glass-panel p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-['Press_Start_2P'] text-blue-400 mb-4">📅 DAILY CHALLENGES</h3>
                        <div className="space-y-3">
                            {DAILY_CHALLENGES.slice(0, 3).map(challenge => {
                                const progress = isTodayProgress ? getDailyProgress(challenge, dailyProgress!) : 0;
                                const isComplete = progress >= challenge.goal;
                                return (
                                    <div key={challenge.id} className={`p-3 rounded-lg border ${isComplete ? 'bg-emerald-900/30 border-emerald-500/30' : 'bg-black/20 border-white/5'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[9px] font-['Press_Start_2P'] text-white">{challenge.name}</span>
                                            {isComplete && <span className="text-emerald-400">✓</span>}
                                        </div>
                                        <div className="text-[7px] font-['Press_Start_2P'] text-gray-500 mb-2">{challenge.description}</div>
                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(100, (progress / challenge.goal) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[6px] font-['Press_Start_2P'] text-gray-600">
                                            <span>{progress} / {challenge.goal}</span>
                                            <span>+{challenge.xpReward} XP</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Achievements */}
                    <div className="glass-panel p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-['Press_Start_2P'] text-yellow-400 mb-4">🏅 NEXT ACHIEVEMENTS</h3>
                        <div className="space-y-3">
                            {getNextAchievements().map(achievement => {
                                const progress = getAchievementProgress(achievement);
                                const tierStyle = TIER_COLORS[achievement.tier];
                                return (
                                    <div key={achievement.id} className="p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/20 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xl">{achievement.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-['Press_Start_2P'] text-white">{achievement.name}</span>
                                                    <span
                                                        className="text-[6px] font-['Press_Start_2P'] px-1 rounded"
                                                        style={{ backgroundColor: tierStyle.border, color: tierStyle.bg }}
                                                    >
                                                        {achievement.tier}
                                                    </span>
                                                </div>
                                                <div className="text-[7px] font-['Press_Start_2P'] text-gray-500">{achievement.description}</div>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    width: `${progress}%`,
                                                    backgroundColor: tierStyle.border
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[6px] font-['Press_Start_2P'] text-gray-600">
                                            <span>{Math.round(progress)}%</span>
                                            <span>+{achievement.xpReward} XP | +${achievement.moneyReward}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Unlocked Achievements */}
                    <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-['Press_Start_2P'] text-purple-400 mb-4">🏆 UNLOCKED ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {unlockedAchievements.length === 0 ? (
                                <span className="text-[9px] font-['Press_Start_2P'] text-gray-500">No achievements yet. Keep playing!</span>
                            ) : (
                                unlockedAchievements.map(id => {
                                    const ach = ACHIEVEMENTS.find(a => a.id === id);
                                    if (!ach) return null;
                                    const tierStyle = TIER_COLORS[ach.tier];
                                    return (
                                        <div
                                            key={id}
                                            className="p-2 rounded-lg border"
                                            style={{
                                                backgroundColor: `${tierStyle.bg}60`,
                                                borderColor: tierStyle.border
                                            }}
                                            title={`${ach.name}: ${ach.description}`}
                                        >
                                            <span className="text-lg">{ach.icon}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatBox: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
    <div className="p-3 bg-black/30 rounded-lg border border-white/5 text-center">
        <div className="text-lg mb-1">{icon}</div>
        <div className="text-base font-['Press_Start_2P'] text-white">{value.toLocaleString()}</div>
        <div className="text-[6px] font-['Press_Start_2P'] text-gray-500 mt-1">{label}</div>
    </div>
);

// Helper function
const getDailyProgress = (challenge: typeof DAILY_CHALLENGES[0], progress: NonNullable<UserInventory['dailyProgress']>): number => {
    switch (challenge.type) {
        case 'STRIKES': return progress.strikesToday;
        case 'SPARES': return progress.sparesToday;
        case 'PINS': return progress.pinsToday;
        case 'GAMES': return progress.gamesToday;
        case 'SCORE': return progress.highScoreToday;
        default: return 0;
    }
};

export default ProgressionPanel;
