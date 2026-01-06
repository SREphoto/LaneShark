
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- Dimensions ---
export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 1200;

export const LANE_WIDTH = 260;
export const LANE_LENGTH = 1400;
export const GUTTER_WIDTH = 45;
export const BALL_RETURN_WIDTH = 30;

export const LANE_LEFT_EDGE = (CANVAS_WIDTH - LANE_WIDTH) / 2;
export const LANE_RIGHT_EDGE = LANE_LEFT_EDGE + LANE_WIDTH;

export const PIN_RADIUS = 12;
export const BALL_RADIUS = 18;
export const PIN_SPACING = 60;

export const BALL_START_Y = 1120;
export const HEAD_PIN_Y = 200;

// --- Colors ---
export const LANE_COLOR = '#eebc65';
export const LANE_BORDER_COLOR = '#744210';
export const GUTTER_COLOR = '#111';
export const PIN_COLOR = '#fff';
export const PIN_STRIPE_COLOR = '#e53e3e';
export const BALL_COLOR = '#2b6cb0';

// --- Physics ---
export const MAX_FRAMES = 10;
export const BASE_THROW_SPEED = 18;

export const PIN_COLLISION_RADIUS = PIN_RADIUS + BALL_RADIUS;
export const PIN_PIN_COLLISION_RADIUS = PIN_RADIUS * 2;
export const PIN_DAMPING = 0.95;
export const PIN_ROTATION_DAMPING = 0.95;
export const IMPACT_FACTOR = 0.75;
export const WALL_BOUNCE = 0.5;

export const BALL_WEIGHT_LIGHT = 1.0;
export const BALL_WEIGHT_HEAVY = 2.5;
export const MAX_SPIN = 0.5;

export const MAX_TRAIL_LENGTH = 45;

// --- Economy ---
export const WINNINGS_PER_POINT = 2;
export const WINNINGS_STRIKE_BONUS = 50;
export const WAGER_TARGET_SCORE = 150;

// --- RPG ---
export const XP_PER_PIN = 5;
export const XP_PER_STRIKE = 50;
export const XP_PER_SPARE = 25;
export const LEVELS = [0, 500, 1500, 3000, 5000, 8000, 12000, 17000, 25000, 50000];
export const ACHIEVEMENT_POPUP_DURATION = 4000;

// --- Advanced Physics Props ---
export const MATERIAL_PROPS = {
    PLASTIC: { friction: 0.99, hookPotential: 0.5, restitution: 0.8 },
    URETHANE: { friction: 0.96, hookPotential: 1.2, restitution: 0.6 },
    RESIN: { friction: 0.94, hookPotential: 2.0, restitution: 0.4 }
};

export const LANE_PROPS = {
    DRY: { friction: 1.05, hookModifier: 1.5, color: '#dcb15e', difficulty: 'HARD' },
    NORMAL: { friction: 1.0, hookModifier: 1.0, color: '#eebc65', difficulty: 'MEDIUM' },
    OILY: { friction: 0.92, hookModifier: 0.5, color: '#f5d085', difficulty: 'EASY' }
};

// --- Tutorial ---
export const TUTORIAL_STEPS = [
    { title: "Welcome to LaneShark!", text: "Follow the 6-step sequence to master your roll." },
    { title: "The 6-Step Throw", text: "1. Weight, 2. Spin, 3. Position, 4. Aim, 5. Power, 6. Release!" },
    { title: "Aiming", text: "Wait for the arrow to align with your target, then confirm. Timing is everything!" },
    { title: "Spin", text: "Apply spin to 'hook' the ball into the pocket for more strikes." }
];

// --- CPU Opponents ---
export const CPU_OPPONENTS = [
    {
        id: 'easy',
        name: 'Gutter Gus',
        difficulty: 0.2,
        spinPreference: 0.0,
        powerPreference: 0.8,
        description: "Throws mostly straight. Tends to panic under pressure."
    },
    {
        id: 'med',
        name: 'Hooking Hannah',
        difficulty: 0.6,
        spinPreference: 0.3,
        powerPreference: 1.0,
        description: "Uses a reliable hook. Solid intermediate playstyle."
    },
    {
        id: 'hard',
        name: 'Spin Doctor Sid',
        difficulty: 0.85,
        spinPreference: -0.45,
        powerPreference: 1.2,
        description: "Aggressive left-handed hook. Very high accuracy."
    },
    {
        id: 'pro',
        name: 'Kingpin Klaus',
        difficulty: 0.98,
        spinPreference: 0.1,
        powerPreference: 1.4,
        description: "Perfect technique. Adjusts perfectly to lane conditions."
    }
];

// --- Audio Assets ---
export const SOUNDS = {
    PIN_HIT: 'https://storage.googleapis.com/gemini-95-icons/wicket.m4a',
    STRIKE: 'https://storage.googleapis.com/gemini-95-icons/bathit.mp3',
    RETURN: 'https://storage.googleapis.com/gemini-95-icons/mechanical_roll.mp3',
    CLAP: 'https://storage.googleapis.com/gemini-95-icons/clapping.mp3',
    AWW: 'https://storage.googleapis.com/gemini-95-icons/crowd_aww.mp3',
    CHEER: 'https://storage.googleapis.com/gemini-95-icons/crowd_cheer.mp3',
    SPLASH_CHIME: 'https://storage.googleapis.com/gemini-95-icons/ding.mp3',
    FOOTSTEPS: 'https://storage.googleapis.com/gemini-95-icons/footsteps_gravel.mp3'
};
