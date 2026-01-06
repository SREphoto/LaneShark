
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type GameState = 'SPLASH' | 'PLAYER_CREATOR' | 'MENU' | 'IDLE' | 'LOADING' | 'READY_TO_BOWL' | 'ROLLING' | 'PIN_SETTLEMENT' | 'BALL_RETURN' | 'GAME_OVER' | 'TUTORIAL' | 'LEVEL_UP' | 'THROW_SEQUENCE';

export type ThrowStep = 'WEIGHT' | 'SPIN' | 'POSITION' | 'AIM' | 'POWER' | 'RELEASE';

export type GameMode = 'SOLO' | 'TWO_PLAYER' | 'VS_CPU';

export type LaneCondition = 'NORMAL' | 'DRY' | 'OILY';
export type BallMaterial = 'PLASTIC' | 'URETHANE' | 'RESIN';
export type StageId = 'CLASSIC' | 'RETRO_NEON' | 'NEO_TOKYO' | 'COSMIC_VOID';

export interface Stage {
    id: StageId;
    name: string;
    description: string;
    unlockLevel: number;
    friction: number;
    hookMult: number;
    colors: {
        lane: string;
        gutter: string;
        bg: string[];
    };
}

export interface CpuPersonality {
    id: string;
    name: string;
    difficulty: number; // 0.1 to 1.0 (Accuracy)
    spinPreference: number;
    powerPreference: number;
}

export type Handedness = 'LEFT' | 'RIGHT';

export interface PlayerStats {
    strength: number;       // Throw speed
    accuracy: number;       // Aim stability
    control: number;        // Spin consistency
    endurance: number;      // Consistency over long games
    crowdControl: number;   // Bonus XP/Money
    specialty: number;      // Split conversion chance
}

export interface CareerRecord {
    gamesPlayed: number;
    soloHighScore: number;
    vsCpuWins: number;
    vsCpuLosses: number;
    currentStreak: number; // Positive for win streak, negative for loss streak
}

export interface PlayerProfile {
    name: string;
    handedness: Handedness;
    stats: PlayerStats;
    level: number;
    xp: number;
    statPoints: number; // Available to spend
    avatarImage?: string; // Base64 string of the generated avatar
    equippedOutfitId?: string;
    equippedBallId?: string;
    career?: CareerRecord;
}

export interface Player {
    id: number;
    name: string;
    isCpu: boolean;
    cpuProfile?: CpuPersonality;
    profile?: PlayerProfile; // Only for human P1 usually
    rolls: number[];
    frames: BowlingFrame[];
    score: number;
    inventory: UserInventory;
    consecutiveStrikes: number;
}

export interface Ball {
    x: number;
    y: number;
    radius: number;
    dx: number;
    dy: number;
    weight: number; // 1.0 (Light) to 2.5 (Heavy)
    spin: number; // -0.5 (Left Hook) to 0.5 (Right Hook)
    inGutter: boolean;
    material: BallMaterial;
    angle: number; // Added for aiming
}

export interface Pin {
    id: number;
    x: number;
    y: number;
    isDown: boolean;
    vx: number;
    vy: number;
    angle: number;
    va: number;
    wobble: number;
}

export interface GameContextForCommentary {
    event: string;
    pinsKnocked?: number;
    frame?: number;
    totalScore?: number;
    throwInFrame?: number;
    ballSpin?: number;
    ballWeight?: number;
    ballMaterial?: string;
    laneCondition?: string;
    playerName?: string;
}

export interface AssetsLoaded {
    ball: boolean;
    all: boolean;
}

export interface VoicePersona {
    id: string;
    name: string;
    description: string;
    voiceName: string;
    systemInstruction: string;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export interface BowlingFrame {
    frameNumber: number;
    rolls: number[];
    score: number | null;
    isStrike: boolean;
    isSpare: boolean;
    cumulativeScore: number | null;
}

export type ShopCategory = 'BALL' | 'SHOES' | 'GEAR' | 'ACCESSORY' | 'CLOTHING';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ShopCategory;
    effectDescription: string;
}

export interface LifetimeStats {
    totalStrikes: number;
    totalSpares: number;
    totalPinsKnocked: number;
    gamesPlayed: number;
    highScore: number;
    bestStreak: number;
    perfectGames: number;
}

export interface DailyChallengeProgress {
    date: string; // ISO date string
    strikesToday: number;
    sparesToday: number;
    pinsToday: number;
    gamesToday: number;
    highScoreToday: number;
    completedChallenges: string[];
}

export interface UserInventory {
    money: number;
    items: string[];
    profile?: PlayerProfile;
    lifetimeStats?: LifetimeStats;
    unlockedAchievements?: string[];
    dailyProgress?: DailyChallengeProgress;
    lastPlayedDate?: string;
    loginStreak?: number;
}


export interface GameStatistics {
    totalScore: number;
    strikes: number;
    spares: number;
    gutters: number;
    openFrames: number;
    totalPins: number;
    accuracy: number;
    wagerAmount?: number;
    wagerWon?: boolean;
}

export interface Spectator {
    id: number;
    x: number;
    y: number;
    color: string;
    state: 'IDLE' | 'CHEER' | 'BOO' | 'JUMP';
    animOffset: number;
}
