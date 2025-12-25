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
        description: 'Vintage feel. Smooth controllable arc.',
        price: 400,
        category: 'BALL',
        effectDescription: 'Material: Urethane (Med Hook)'
    },
    {
        id: 'resin_ball',
        name: 'Viper Reactive Resin',
        description: 'High friction coverstock for aggressive hook.',
        price: 900,
        category: 'BALL',
        effectDescription: 'Material: Resin (Max Hook)'
    },
    {
        id: 'magma_ball',
        name: 'Magma Core Pro',
        description: 'Molten power for maximum pin action.',
        price: 1500,
        category: 'BALL',
        effectDescription: 'Explosive Pin Action +15%'
    },
    {
        id: 'ice_storm',
        name: 'Ice Storm Elite',
        description: 'Precision ball for dry lanes.',
        price: 1200,
        category: 'BALL',
        effectDescription: 'Smooth Glide +Accuracy'
    },
    {
        id: 'quantum_sphere',
        name: 'Quantum Sphere X',
        description: 'Experimental nano-coating technology.',
        price: 2500,
        category: 'BALL',
        effectDescription: 'Perfect Hook Control'
    },
    {
        id: 'heavy_ball_license',
        name: 'Rhino Core Ball',
        description: 'Dense core technology for maximum impact.',
        price: 800,
        category: 'BALL',
        effectDescription: 'Unlocks Heavy Weight (2.5x)'
    },
    {
        id: 'neon_glow_ball',
        name: 'Neon Glow Ball',
        description: 'Glows in cosmic patterns. Pure style.',
        price: 1800,
        category: 'BALL',
        effectDescription: 'Visual Flair +Crowd Appeal'
    },
    {
        id: 'titanium_beast',
        name: 'Titanium Beast',
        description: 'Military-grade bowling power.',
        price: 3000,
        category: 'BALL',
        effectDescription: 'Maximum Power +25%'
    },

    // ========== SHOES ==========
    {
        id: 'pro_shoes',
        name: 'Pro Glide Shoes',
        description: 'High-performance leather bowling shoes.',
        price: 500,
        category: 'SHOES',
        effectDescription: 'Earn 2x Winnings'
    },
    {
        id: 'stealth_slides',
        name: 'Stealth Slides',
        description: 'Silent approach, deadly accuracy.',
        price: 750,
        category: 'SHOES',
        effectDescription: '+Accuracy Bonus'
    },
    {
        id: 'rocket_boots',
        name: 'Rocket Boots',
        description: 'For bowlers who move fast.',
        price: 1200,
        category: 'SHOES',
        effectDescription: 'Faster Games +1 Frame'
    },
    {
        id: 'golden_slippers',
        name: 'Golden Slippers',
        description: 'Luxury footwear for champions.',
        price: 2000,
        category: 'SHOES',
        effectDescription: 'Earn 3x Winnings'
    },

    // ========== CLOTHING ==========
    {
        id: 'retro_shirt',
        name: 'Retro Bowling Shirt',
        description: 'Classic 50s style silk shirt.',
        price: 300,
        category: 'CLOTHING',
        effectDescription: 'Classic Style'
    },
    {
        id: 'pro_jersey',
        name: 'Pro Tour Jersey',
        description: 'Moisture wicking fabric for serious bowlers.',
        price: 800,
        category: 'CLOTHING',
        effectDescription: '+Endurance +1 Power'
    },
    {
        id: 'neon_outfit',
        name: 'Neon Cyber Suit',
        description: 'Glow in the dark outfit. Future vibes.',
        price: 2000,
        category: 'CLOTHING',
        effectDescription: 'Ultimate Style +Crowd Love'
    },
    {
        id: 'chicken_suit',
        name: 'Chicken Mascot',
        description: 'Why? Because it\'s hilarious.',
        price: 1000,
        category: 'CLOTHING',
        effectDescription: 'Crowd Goes Wild'
    },
    {
        id: 'samurai_armor',
        name: 'Samurai Armor',
        description: 'Ancient warrior meets modern bowler.',
        price: 2500,
        category: 'CLOTHING',
        effectDescription: '+3 All Stats'
    },
    {
        id: 'disco_outfit',
        name: 'Disco Inferno',
        description: 'Bring back the 70s in style.',
        price: 1500,
        category: 'CLOTHING',
        effectDescription: 'Groovy Vibes +XP Bonus'
    },
    {
        id: 'space_suit',
        name: 'Cosmic Explorer Suit',
        description: 'Bowl among the stars.',
        price: 3500,
        category: 'CLOTHING',
        effectDescription: 'Zero Gravity Mode'
    },
    {
        id: 'tuxedo',
        name: 'Championship Tuxedo',
        description: 'Bowl like a boss. Look like a champion.',
        price: 2200,
        category: 'CLOTHING',
        effectDescription: 'Professional Aura +2 All'
    },

    // ========== ACCESSORIES ==========
    {
        id: 'wrist_guard',
        name: 'Cobra Wrist Guard',
        description: 'Stabilizes your throw for extreme spin.',
        price: 600,
        category: 'GEAR',
        effectDescription: 'Unlocks Max Spin Control'
    },
    {
        id: 'power_glove',
        name: 'Power Glove Pro',
        description: 'Enhanced grip and ball control.',
        price: 850,
        category: 'GEAR',
        effectDescription: '+Control +Accuracy'
    },
    {
        id: 'lucky_towel',
        name: 'Lucky Champion Towel',
        description: 'Every pro has one. Now you do too.',
        price: 200,
        category: 'ACCESSORY',
        effectDescription: '+5% Strike Chance'
    },
    {
        id: 'rosin_bag',
        name: 'Ultra Rosin Bag',
        description: 'Perfect grip every time.',
        price: 150,
        category: 'ACCESSORY',
        effectDescription: 'Better Release'
    },
    {
        id: 'smart_watch',
        name: 'BowlSmart Watch',
        description: 'Tracks your stats in real-time.',
        price: 1200,
        category: 'ACCESSORY',
        effectDescription: 'Show Advanced Stats'
    },
    {
        id: 'championship_ring',
        name: 'Championship Ring',
        description: 'Proof of your excellence.',
        price: 5000,
        category: 'ACCESSORY',
        effectDescription: 'Prestige +50% XP Gain'
    },
    {
        id: 'energy_drink',
        name: 'Infinite Energy Drink',
        description: 'Never get tired. Unlimited power!',
        price: 300,
        category: 'ACCESSORY',
        effectDescription: '+Endurance No Fatigue'
    },
    {
        id: 'headband',
        name: 'Focus Headband',
        description: 'Channel your inner champion.',
        price: 400,
        category: 'ACCESSORY',
        effectDescription: '+Concentration +Aim'
    },
    {
        id: 'sunglasses',
        name: 'Cool Shades',
        description: 'Look cool, bowl cooler.',
        price: 350,
        category: 'ACCESSORY',
        effectDescription: 'Style Points +150%'
    },
    {
        id: 'golden_dice',
        name: 'Golden Luck Dice',
        description: 'Roll the dice, strike it nice.',
        price: 800,
        category: 'ACCESSORY',
        effectDescription: '+Luck +Critical Strikes'
    },

    // ========== SPECIAL ITEMS ==========
    {
        id: 'vip_membership',
        name: 'VIP Alley Pass',
        description: 'Access to premium lanes and features.',
        price: 10000,
        category: 'ACCESSORY',
        effectDescription: 'Unlock VIP Features'
    },
    {
        id: 'ai_coach',
        name: 'AI Coach Assistant',
        description: 'Personal AI bowling coach.',
        price: 7500,
        category: 'ACCESSORY',
        effectDescription: 'Real-time Tips +Hints'
    },
    {
        id: 'mystery_box',
        name: 'Mystery Mega Box',
        description: 'Could be anything! Take a chance.',
        price: 2500,
        category: 'ACCESSORY',
        effectDescription: 'Random Premium Item'
    },
];