/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Achievement Definitions
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    requirement: number;
    type: 'STRIKES' | 'SPARES' | 'PERFECT_GAMES' | 'TOTAL_PINS' | 'GAMES_PLAYED' | 'HIGH_SCORE' | 'STREAK' | 'LEVEL';
    xpReward: number;
    moneyReward: number;
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
}

export const ACHIEVEMENTS: Achievement[] = [
    // Strike Achievements
    { id: 'first_strike', name: 'First Strike!', description: 'Get your first strike', icon: '🎯', requirement: 1, type: 'STRIKES', xpReward: 50, moneyReward: 25, tier: 'BRONZE' },
    { id: 'strike_10', name: 'Strike Machine', description: 'Get 10 total strikes', icon: '🔥', requirement: 10, type: 'STRIKES', xpReward: 150, moneyReward: 75, tier: 'SILVER' },
    { id: 'strike_50', name: 'Strike Legend', description: 'Get 50 total strikes', icon: '⚡', requirement: 50, type: 'STRIKES', xpReward: 500, moneyReward: 250, tier: 'GOLD' },
    { id: 'strike_200', name: 'Strike God', description: 'Get 200 total strikes', icon: '👑', requirement: 200, type: 'STRIKES', xpReward: 2000, moneyReward: 1000, tier: 'DIAMOND' },

    // Spare Achievements
    { id: 'first_spare', name: 'Saved It!', description: 'Get your first spare', icon: '🎱', requirement: 1, type: 'SPARES', xpReward: 30, moneyReward: 15, tier: 'BRONZE' },
    { id: 'spare_25', name: 'Clean Up Crew', description: 'Get 25 total spares', icon: '🧹', requirement: 25, type: 'SPARES', xpReward: 200, moneyReward: 100, tier: 'SILVER' },
    { id: 'spare_100', name: 'Spare Master', description: 'Get 100 total spares', icon: '💫', requirement: 100, type: 'SPARES', xpReward: 750, moneyReward: 400, tier: 'GOLD' },

    // Games Played
    { id: 'rookie', name: 'Rookie Bowler', description: 'Complete your first game', icon: '🎳', requirement: 1, type: 'GAMES_PLAYED', xpReward: 100, moneyReward: 50, tier: 'BRONZE' },
    { id: 'regular', name: 'Regular', description: 'Complete 10 games', icon: '🏆', requirement: 10, type: 'GAMES_PLAYED', xpReward: 300, moneyReward: 150, tier: 'SILVER' },
    { id: 'veteran', name: 'Veteran', description: 'Complete 50 games', icon: '🎖️', requirement: 50, type: 'GAMES_PLAYED', xpReward: 1000, moneyReward: 500, tier: 'GOLD' },
    { id: 'pro_bowler', name: 'Pro Bowler', description: 'Complete 100 games', icon: '💎', requirement: 100, type: 'GAMES_PLAYED', xpReward: 2500, moneyReward: 1500, tier: 'PLATINUM' },

    // High Score
    { id: 'score_100', name: 'Century Club', description: 'Score 100+ in a game', icon: '💯', requirement: 100, type: 'HIGH_SCORE', xpReward: 200, moneyReward: 100, tier: 'BRONZE' },
    { id: 'score_150', name: 'Rising Star', description: 'Score 150+ in a game', icon: '⭐', requirement: 150, type: 'HIGH_SCORE', xpReward: 400, moneyReward: 200, tier: 'SILVER' },
    { id: 'score_200', name: 'Pro Status', description: 'Score 200+ in a game', icon: '🌟', requirement: 200, type: 'HIGH_SCORE', xpReward: 800, moneyReward: 400, tier: 'GOLD' },
    { id: 'score_250', name: 'Elite Bowler', description: 'Score 250+ in a game', icon: '✨', requirement: 250, type: 'HIGH_SCORE', xpReward: 1500, moneyReward: 750, tier: 'PLATINUM' },
    { id: 'perfect_game', name: 'PERFECT 300!', description: 'Bowl a perfect game', icon: '🏅', requirement: 300, type: 'HIGH_SCORE', xpReward: 10000, moneyReward: 5000, tier: 'DIAMOND' },

    // Streak
    { id: 'streak_3', name: 'On Fire!', description: '3 strikes in a row (Turkey)', icon: '🦃', requirement: 3, type: 'STREAK', xpReward: 150, moneyReward: 75, tier: 'SILVER' },
    { id: 'streak_5', name: 'Unstoppable', description: '5 strikes in a row', icon: '🔥', requirement: 5, type: 'STREAK', xpReward: 400, moneyReward: 200, tier: 'GOLD' },
    { id: 'streak_10', name: 'LEGENDARY', description: '10 strikes in a row', icon: '💥', requirement: 10, type: 'STREAK', xpReward: 2000, moneyReward: 1000, tier: 'DIAMOND' },

    // Level Milestones
    { id: 'level_5', name: 'Getting Serious', description: 'Reach Level 5', icon: '📈', requirement: 5, type: 'LEVEL', xpReward: 250, moneyReward: 150, tier: 'BRONZE' },
    { id: 'level_10', name: 'Dedicated', description: 'Reach Level 10', icon: '🚀', requirement: 10, type: 'LEVEL', xpReward: 500, moneyReward: 300, tier: 'SILVER' },
    { id: 'level_25', name: 'Lane Shark', description: 'Reach Level 25', icon: '🦈', requirement: 25, type: 'LEVEL', xpReward: 1500, moneyReward: 750, tier: 'GOLD' },
    { id: 'level_50', name: 'Bowling Legend', description: 'Reach Level 50', icon: '👑', requirement: 50, type: 'LEVEL', xpReward: 5000, moneyReward: 2500, tier: 'PLATINUM' },

    // Total Pins
    { id: 'pins_100', name: 'Pin Destroyer', description: 'Knock down 100 pins', icon: '💪', requirement: 100, type: 'TOTAL_PINS', xpReward: 100, moneyReward: 50, tier: 'BRONZE' },
    { id: 'pins_1000', name: 'Pin Annihilator', description: 'Knock down 1,000 pins', icon: '⚔️', requirement: 1000, type: 'TOTAL_PINS', xpReward: 500, moneyReward: 250, tier: 'SILVER' },
    { id: 'pins_10000', name: 'Pin Apocalypse', description: 'Knock down 10,000 pins', icon: '☄️', requirement: 10000, type: 'TOTAL_PINS', xpReward: 2500, moneyReward: 1250, tier: 'GOLD' },
];

// Daily Challenge Definitions
export interface DailyChallenge {
    id: string;
    name: string;
    description: string;
    goal: number;
    type: 'STRIKES' | 'SPARES' | 'PINS' | 'GAMES' | 'SCORE';
    xpReward: number;
    moneyReward: number;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
    { id: 'daily_strikes', name: 'Strike Seeker', description: 'Get 3 strikes today', goal: 3, type: 'STRIKES', xpReward: 100, moneyReward: 50 },
    { id: 'daily_spares', name: 'Spare Hunter', description: 'Get 5 spares today', goal: 5, type: 'SPARES', xpReward: 75, moneyReward: 40 },
    { id: 'daily_pins', name: 'Pin Crusher', description: 'Knock down 50 pins today', goal: 50, type: 'PINS', xpReward: 60, moneyReward: 30 },
    { id: 'daily_games', name: 'Practice Makes Perfect', description: 'Play 3 games today', goal: 3, type: 'GAMES', xpReward: 120, moneyReward: 60 },
    { id: 'daily_score', name: 'High Roller', description: 'Score 120+ in a game today', goal: 120, type: 'SCORE', xpReward: 150, moneyReward: 80 },
];

// Milestone Bonuses (shown at specific XP thresholds)
export interface Milestone {
    xp: number;
    title: string;
    reward: string;
    moneyBonus: number;
}

export const MILESTONES: Milestone[] = [
    { xp: 100, title: 'First Steps', reward: 'Starter Bonus', moneyBonus: 50 },
    { xp: 500, title: 'Getting Warmed Up', reward: 'Warm-Up Bonus', moneyBonus: 100 },
    { xp: 1000, title: 'Serious Contender', reward: 'Contender Bonus', moneyBonus: 200 },
    { xp: 2500, title: 'Rising Star', reward: 'Star Bonus', moneyBonus: 500 },
    { xp: 5000, title: 'Pro Circuit', reward: 'Pro Bonus', moneyBonus: 1000 },
    { xp: 10000, title: 'Championship Material', reward: 'Champion Bonus', moneyBonus: 2500 },
    { xp: 25000, title: 'Hall of Fame', reward: 'Legend Bonus', moneyBonus: 5000 },
    { xp: 50000, title: 'Bowling Immortal', reward: 'Immortal Bonus', moneyBonus: 10000 },
];

// Streak Multipliers
export const STREAK_MULTIPLIERS: Record<number, { name: string; multiplier: number; color: string }> = {
    2: { name: 'Double!', multiplier: 1.5, color: '#fbbf24' },
    3: { name: 'Turkey!', multiplier: 2.0, color: '#f97316' },
    4: { name: 'Four-Bagger!', multiplier: 2.5, color: '#ef4444' },
    5: { name: 'Five-Bagger!', multiplier: 3.0, color: '#ec4899' },
    6: { name: 'Six-Pack!', multiplier: 3.5, color: '#a855f7' },
    7: { name: 'Lucky Seven!', multiplier: 4.0, color: '#8b5cf6' },
    8: { name: 'Octuple!', multiplier: 4.5, color: '#6366f1' },
    9: { name: 'Golden Nine!', multiplier: 5.0, color: '#3b82f6' },
    10: { name: 'PERFECT TEN!', multiplier: 6.0, color: '#14b8a6' },
    11: { name: 'LEGENDARY!', multiplier: 8.0, color: '#22c55e' },
    12: { name: 'PERFECT GAME!', multiplier: 10.0, color: '#eab308' },
};

// Tier Colors
export const TIER_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    BRONZE: { bg: '#92400e', border: '#d97706', text: '#fcd34d', glow: 'rgba(217, 119, 6, 0.5)' },
    SILVER: { bg: '#374151', border: '#9ca3af', text: '#f3f4f6', glow: 'rgba(156, 163, 175, 0.5)' },
    GOLD: { bg: '#854d0e', border: '#eab308', text: '#fef08a', glow: 'rgba(234, 179, 8, 0.6)' },
    PLATINUM: { bg: '#083344', border: '#22d3ee', text: '#cffafe', glow: 'rgba(34, 211, 238, 0.5)' },
    DIAMOND: { bg: '#4c1d95', border: '#a78bfa', text: '#e9d5ff', glow: 'rgba(167, 139, 250, 0.6)' },
};
