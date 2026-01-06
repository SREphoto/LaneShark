import { Stage } from '../types';

export const STAGES: Stage[] = [
    {
        id: 'CLASSIC',
        name: 'Classic Lanes',
        description: 'The original 16-bit bowling experience.',
        unlockLevel: 1,
        friction: 1.0,
        hookMult: 1.0,
        colors: {
            lane: '#d6a87c',
            gutter: '#111',
            bg: ['#1a1c29', '#050505']
        }
    },
    {
        id: 'RETRO_NEON',
        name: 'Retro Neon',
        description: 'Vibrant colors and faster lanes.',
        unlockLevel: 5,
        friction: 0.9,
        hookMult: 1.2,
        colors: {
            lane: '#2d3436',
            gutter: '#e84393',
            bg: ['#2d3436', '#000000']
        }
    },
    {
        id: 'NEO_TOKYO',
        name: 'Neo Tokyo',
        description: 'The ultimate urban bowling challenge.',
        unlockLevel: 10,
        friction: 0.85,
        hookMult: 1.5,
        colors: {
            lane: '#0984e3',
            gutter: '#00cec9',
            bg: ['#000000', '#2d3436']
        }
    },
    {
        id: 'COSMIC_VOID',
        name: 'Cosmic Void',
        description: 'Bowling in zero gravity (almost).',
        unlockLevel: 20,
        friction: 0.7,
        hookMult: 2.0,
        colors: {
            lane: '#6c5ce7',
            gutter: '#a29bfe',
            bg: ['#000000', '#1a1c29']
        }
    }
];
