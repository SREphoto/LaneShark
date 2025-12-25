/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
    // ========== BOWLING BALLS ==========
    {
        id: 'urethane_ball',
        name: 'Storm Urethane',
        description: 'Smooth controllable arc. Perfect for DRY lanes where reactive balls over-hook.',
        price: 400,
        category: 'BALL',
        effectDescription: 'Material: Urethane (Stable on Dry Lanes)'
    },
    {
        id: 'resin_ball',
        name: 'Viper Reactive Resin',
        description: 'Aggressive hook potential. Ideal for NORMAL or OILY lanes to cut through the oil.',
        price: 900,
        category: 'BALL',
        effectDescription: 'Material: Resin (Cuts through Oil)'
    },
    {
        id: 'magma_ball',
        name: 'Magma Core Pro',
        description: 'Heavy internal weight block. Massive pin carry and explosive impact.',
        price: 1500,
        category: 'BALL',
        effectDescription: 'Explosive Pin Action +15%'
    },
    {
        id: 'ice_storm',
        name: 'Ice Storm Elite',
        description: 'Zero-hook plastic ball. Best for technical spare shooting or extremely DRY conditions.',
        price: 1200,
        category: 'BALL',
        effectDescription: 'Ultra-Straight Glide +Accuracy'
    },
    {
        id: 'quantum_sphere',
        name: 'Quantum Sphere X',
        description: 'Nanotech surface adapts to any lane. Great all-around reaction.',
        price: 2500,
        category: 'BALL',
        effectDescription: 'Adaptive Hook Control'
    },
    {
        id: 'heavy_ball_license',
        name: 'Rhino Core Ball',
        description: 'High-density core. Smashes through the pins with pure momentum.',
        price: 800,
        category: 'BALL',
        effectDescription: 'Unlocks Heavy Weight (2.5lb)'
    },
    {
        id: 'neon_glow_ball',
        name: 'Cyber Neon Ball',
        description: 'Holographic surface. Increases crowd hype and scoring multiplier.',
        price: 1800,
        category: 'BALL',
        effectDescription: 'Visual Flair +Crowd Appeal'
    },
    {
        id: 'titanium_beast',
        name: 'Titanium Beast',
        description: 'Military-grade core. Unstoppable force for OILY lanes.',
        price: 3000,
        category: 'BALL',
        effectDescription: 'Maximum Power +25%'
    },

    // ========== SHOES ==========
    {
        id: 'pro_shoes',
        name: 'Pro Glide Shoes',
        description: 'Superior approach stability. Better sliding control.',
        price: 500,
        category: 'SHOES',
        effectDescription: 'Earn 2x Winnings'
    },
    {
        id: 'stealth_slides',
        name: 'Stealth Slides',
        description: 'Precision grip for better aim timing.',
        price: 750,
        category: 'SHOES',
        effectDescription: '+Accuracy Bonus'
    },
    {
        id: 'rocket_boots',
        name: 'Rocket Boots',
        description: 'Turbocharge your approach speed.',
        price: 1200,
        category: 'SHOES',
        effectDescription: 'Faster Games +1 Frame'
    },
    {
        id: 'golden_slippers',
        name: 'Golden Slippers',
        description: 'Gold-plated soles for the elite.',
        price: 2000,
        category: 'SHOES',
        effectDescription: 'Earn 3x Winnings'
    },

    // ========== CLOTHING ==========
    {
        id: 'retro_shirt',
        name: 'Retro Bowling Shirt',
        description: 'Classic 50s style silk shirt. A vintage look for the lane.',
        price: 300,
        category: 'CLOTHING',
        effectDescription: 'Classic Style'
    },
    {
        id: 'pro_jersey',
        name: 'Pro Tour Jersey',
        description: 'Breathable composite fabric for pro tournaments.',
        price: 800,
        category: 'CLOTHING',
        effectDescription: '+Endurance +1 Power'
    },
    {
        id: 'neon_outfit',
        name: 'Neon Cyber Suit',
        description: 'Glowing circuitry woven into the fabric.',
        price: 2000,
        category: 'CLOTHING',
        effectDescription: 'Ultimate Style +Crowd Love'
    },
    {
        id: 'chicken_suit',
        name: 'Chicken Mascot',
        description: 'Distract your opponents. Enter the arena as a giant chicken.',
        price: 1000,
        category: 'CLOTHING',
        effectDescription: 'Crowd Goes Wild'
    },
    {
        id: 'samurai_armor',
        name: 'Samurai Armor',
        description: 'Dishonor for the pins. Heavy plated armor for protection.',
        price: 2500,
        category: 'CLOTHING',
        effectDescription: '+3 All Stats'
    },
    {
        id: 'disco_outfit',
        name: 'Disco Inferno',
        description: 'Reflective sequins for maximum groove.',
        price: 1500,
        category: 'CLOTHING',
        effectDescription: 'Groovy Vibes +XP Bonus'
    },
    {
        id: 'space_suit',
        name: 'Cosmic Explorer Suit',
        description: 'Pressurized for bowling in a vacuum.',
        price: 3500,
        category: 'CLOTHING',
        effectDescription: 'Zero Gravity Mode'
    },
    {
        id: 'tuxedo',
        name: 'Championship Tuxedo',
        description: 'The finest Italian silk for the world finals.',
        price: 2200,
        category: 'CLOTHING',
        effectDescription: 'Professional Aura +2 All'
    },

    // ========== ACCESSORIES ==========
    {
        id: 'wrist_guard',
        name: 'Cobra Wrist Guard',
        description: 'Locked-in wrist position for consistent hook.',
        price: 600,
        category: 'GEAR',
        effectDescription: 'Unlocks Max Spin Control'
    },
    {
        id: 'power_glove',
        name: 'Power Glove Pro',
        description: 'Electronic sensors for the perfect release point.',
        price: 850,
        category: 'GEAR',
        effectDescription: '+Control +Accuracy'
    },
    {
        id: 'lucky_towel',
        name: 'Lucky Champion Towel',
        description: 'Keeps your ball clean and your luck high.',
        price: 200,
        category: 'ACCESSORY',
        effectDescription: '+5% Strike Chance'
    },
    {
        id: 'rosin_bag',
        name: 'Ultra Rosin Bag',
        description: 'Eliminate hand tension for a silky release.',
        price: 150,
        category: 'ACCESSORY',
        effectDescription: 'Better Release'
    },
    {
        id: 'smart_watch',
        name: 'BowlSmart Watch',
        description: 'Measures rev rate and ball speed.',
        price: 1200,
        category: 'ACCESSORY',
        effectDescription: 'Show Advanced Stats'
    },
    {
        id: 'championship_ring',
        name: 'Championship Ring',
        description: 'The heaviest hardware in the industry.',
        price: 5000,
        category: 'ACCESSORY',
        effectDescription: 'Prestige +50% XP Gain'
    },
    {
        id: 'energy_drink',
        name: 'Infinite Energy Drink',
        description: 'Synthesized electrolytes for infinite stamina.',
        price: 300,
        category: 'ACCESSORY',
        effectDescription: '+Endurance No Fatigue'
    },
    {
        id: 'headband',
        name: 'Focus Headband',
        description: 'Blocks out the crowd. Just you and the pins.',
        price: 400,
        category: 'ACCESSORY',
        effectDescription: '+Concentration +Aim'
    },
    {
        id: 'sunglasses',
        name: 'Cool Shades',
        description: 'Polarized for cosmic bowling laser shows.',
        price: 350,
        category: 'ACCESSORY',
        effectDescription: 'Style Points +150%'
    },
    {
        id: 'golden_dice',
        name: 'Golden Luck Dice',
        description: 'Physics-defying luck with every roll.',
        price: 800,
        category: 'ACCESSORY',
        effectDescription: '+Luck +Critical Strikes'
    },

    // ========== SPECIAL ITEMS ==========
    {
        id: 'vip_membership',
        name: 'VIP Alley Pass',
        description: 'The ultimate status symbol. Access to hidden alleys.',
        price: 10000,
        category: 'ACCESSORY',
        effectDescription: 'Unlock VIP Features'
    },
    {
        id: 'ai_coach',
        name: 'AI Coach Assistant',
        description: 'Real-time biomechanical analysis.',
        price: 7500,
        category: 'ACCESSORY',
        effectDescription: 'Real-time Tips +Hints'
    },
    {
        id: 'mystery_box',
        name: 'Mystery Mega Box',
        description: 'A gamble for the truly brave bowlers.',
        price: 2500,
        category: 'ACCESSORY',
        effectDescription: 'Random Premium Item'
    },
];