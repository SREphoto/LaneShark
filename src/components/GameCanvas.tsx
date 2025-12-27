/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Ball, Pin, GameState, Particle, Spectator } from '../types';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, LANE_WIDTH, LANE_COLOR, LANE_BORDER_COLOR,
    GUTTER_COLOR, PIN_RADIUS, PIN_COLOR, PIN_STRIPE_COLOR, BALL_COLOR,
    BALL_RETURN_WIDTH, BALL_START_Y, HEAD_PIN_Y, GUTTER_WIDTH
} from '../constants';

interface GameCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    ball: Ball;
    pins: Pin[];
    trail: { x: number, y: number, speed: number }[];
    particles: Particle[];
    gameState: GameState;
    ballImage: HTMLImageElement;
    spectators?: Spectator[];
    laneCondition?: 'NORMAL' | 'DRY' | 'OILY';
    isZoomed?: boolean;
    equippedOutfitId?: string;
    equippedItems?: string[];
    showAimLine?: boolean;

    aimOscillation?: number;
    powerOscillation?: number;
    throwStep?: string;
    screenShake?: number;
    onClickBowler?: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    canvasRef, ball, pins, trail, particles, gameState, ballImage, spectators = [], laneCondition = 'NORMAL', isZoomed = false, equippedOutfitId, equippedItems = [], showAimLine = false,
    aimOscillation = 0, powerOscillation = 0.8, throwStep = 'POSITION', screenShake = 0, onClickBowler
}) => {

    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Procedural Lane Scuffs & Wood Knots
    const scuffs = useMemo(() => {
        const items = [];
        const laneX = (CANVAS_WIDTH - LANE_WIDTH) / 2;
        for (let i = 0; i < 100; i++) {
            items.push({
                x: laneX + Math.random() * LANE_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                w: 2 + Math.random() * 15,
                h: 1 + Math.random() * 1.5,
                opacity: 0.01 + Math.random() * 0.04,
                color: Math.random() > 0.8 ? '#4a3728' : '#000'
            });
        }
        return items;
    }, []);

    // High-Fidelity Wood Texture (Cached)
    const woodPattern = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const c = document.createElement('canvas');
        c.width = LANE_WIDTH;
        c.height = 1024;
        const ctx = c.getContext('2d');
        if (!ctx) return null;

        // Base Wood
        const woodGradient = ctx.createLinearGradient(0, 0, LANE_WIDTH, 0);
        woodGradient.addColorStop(0, '#eaccad');
        woodGradient.addColorStop(0.2, '#d6a87c');
        woodGradient.addColorStop(0.5, '#cba274');
        woodGradient.addColorStop(0.8, '#d6a87c');
        woodGradient.addColorStop(1, '#eaccad');
        ctx.fillStyle = woodGradient;
        ctx.fillRect(0, 0, c.width, c.height);

        // 39 Boards (Standard Bowling Lane)
        const boardWidth = LANE_WIDTH / 39;
        for (let i = 0; i < 39; i++) {
            // Alternating slight shades
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.03)';
                ctx.fillRect(i * boardWidth, 0, boardWidth, c.height);
            }

            // Side gaps
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(i * boardWidth, 0, 1, c.height);

            // Wood Grain Noise (Vertical streaks)
            for (let j = 0; j < 10; j++) {
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(74, 55, 40, 0.05)' : 'rgba(255,255,255,0.05)';
                const streakW = 1 + Math.random() * 2;
                const streakX = i * boardWidth + Math.random() * (boardWidth - streakW);
                ctx.fillRect(streakX, 0, streakW, c.height);
            }
        }

        return c;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const updateSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctxRef.current = canvas.getContext('2d', { alpha: false });
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [canvasRef]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || !onClickBowler) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate scale to fit content within window
        const scale = Math.min(canvas.width / CANVAS_WIDTH, canvas.height / CANVAS_HEIGHT);
        const scaledWidth = CANVAS_WIDTH * scale;
        const scaledHeight = CANVAS_HEIGHT * scale;

        // Convert mouse to game coords
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;

        const gameX = (mouseX - offsetX) / scale;
        const gameY = (mouseY - offsetY) / scale;

        // Check if clicking near ball/bowler area (bottom center)
        const dist = Math.sqrt(Math.pow(gameX - ball.x, 2) + Math.pow(gameY - (ball.y + 40), 2));
        if (dist < 80) {
            onClickBowler();
        }
    };

    const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        // Deep Space / Arena Background
        const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 100, width / 2, height / 2, width);
        bgGrad.addColorStop(0, '#1a1c29'); // Deep Blue-Grey center
        bgGrad.addColorStop(0.4, '#11131f');
        bgGrad.addColorStop(1, '#050505'); // Pitch black corners
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Volumetric Spotlights (Animated)
        const time = Date.now() / 3000;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < 4; i++) {
            const angle = (Math.sin(time + i) * 0.2);
            const x = width / 2 + (i - 1.5) * 300;

            ctx.save();
            ctx.translate(x, -50);
            ctx.rotate(angle);

            const beamGrad = ctx.createLinearGradient(0, 0, 0, height * 0.8);
            beamGrad.addColorStop(0, `hsla(${210 + i * 20}, 70%, 60%, 0.15)`);
            beamGrad.addColorStop(0.5, `hsla(${210 + i * 20}, 70%, 60%, 0.02)`);
            beamGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(-40, 0);
            ctx.lineTo(40, 0);
            ctx.lineTo(150, height);
            ctx.lineTo(-150, height);
            ctx.fill();
            ctx.restore();
        }

        // Ambient Particles (Dust motes in light)
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 80; i++) {
            const x = (Math.sin(i * 123.45 + time) * 0.5 + 0.5) * width;
            const y = (Math.cos(i * 678.9 + time * 0.5) * 0.5 + 0.5) * height * 0.7;
            const alpha = Math.sin(time * 2 + i) * 0.2 + 0.2;
            ctx.globalAlpha = alpha;
            ctx.beginPath(); ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    };

    const drawBowler = (ctx: CanvasRenderingContext2D, x: number, y: number, isHoldingBall: boolean, gameState: GameState, angle: number) => {
        const isRolling = gameState === 'ROLLING';
        const time = Date.now();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle * (Math.PI / 180) * 0.1);

        const shadowScale = 1.0 + Math.sin(time / 200) * 0.05;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(0, 15, 35 * shadowScale, 15, 0, 0, Math.PI * 2); ctx.fill();

        // Bowler Position & Animation State
        const animY = isRolling ? Math.abs(Math.sin(time / 120)) * 6 : 0;
        ctx.translate(0, -animY);

        let primaryColor = '#4834d4';
        let accentColor = '#686de0';
        let detailType: string = 'DEFAULT';

        const outfits: Record<string, any> = {
            retro_shirt: { p: '#f9ca24', a: '#f0932b', d: 'STRIPES' },
            neon_outfit: { p: '#050505', a: '#32ff7e', d: 'NEON' },
            pro_jersey: { p: '#1e3799', a: '#4a69bd', d: 'STRIPES' },
            chicken_suit: { p: '#ffffff', a: '#fa8231', d: 'CHICKEN' },
            samurai_armor: { p: '#2d3436', a: '#eb2f06', d: 'ARMOR' },
            disco_outfit: { p: `hsl(${(time / 5) % 360}, 80%, 40%)`, a: '#fff', d: 'GLOW' },
            space_suit: { p: '#f1f2f6', a: '#2f3542', d: 'SPACE' },
            tuxedo: { p: '#000', a: '#fff', d: 'TUX' }
        };

        if (equippedOutfitId && outfits[equippedOutfitId]) {
            primaryColor = outfits[equippedOutfitId].p;
            accentColor = outfits[equippedOutfitId].a;
            detailType = outfits[equippedOutfitId].d;
        }

        // --- PIXEL ART SPRITE RENDERING ---
        // Scale factor for pixel look (V1.3)
        const S = 4; // 1 pixel = 4 units

        // Helper to draw a "pixel" rect
        const drawRect = (x: number, y: number, w: number, h: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(x * S, y * S, w * S, h * S);
        };

        // 1. LEGS
        // Left Leg
        drawRect(-4, -10, 3, 10, '#1a1a1a'); // Dark pants
        // Right Leg
        drawRect(1, -10, 3, 10, '#1a1a1a');

        // Shoes
        drawRect(-4, 0, 3, 2, '#333');
        drawRect(1, 0, 3, 2, '#333');

        // 2. TORSO (Body)
        // Main block
        drawRect(-5, -22, 10, 12, primaryColor);

        // Shirt Detail
        if (detailType === 'STRIPES') {
            drawRect(-3, -22, 2, 12, accentColor);
            drawRect(1, -22, 2, 12, accentColor);
        } else if (detailType === 'NEON') {
            ctx.shadowBlur = 10; ctx.shadowColor = accentColor;
            drawRect(-2, -18, 4, 4, accentColor); // chest glow
            ctx.shadowBlur = 0;
        } else if (detailType === 'TUX') {
            drawRect(-2, -22, 4, 12, '#fff'); // Shirt front
            drawRect(-1, -20, 2, 1, '#aa0000'); // Bowtie / button
        }

        // 3. ARMS
        if (isHoldingBall) {
            // Holding ball pose
            drawRect(-8, -20, 3, 8, primaryColor); // Left arm down
            drawRect(5, -20, 6, 3, primaryColor); // Right arm forward holding ball
            drawRect(11, -20, 2, 2, '#ffdbac'); // Hand
        } else {
            // Idle / Swing pose
            const swing = Math.sin(time / 200) * 2;
            drawRect(-8, -20 + swing, 3, 9, primaryColor);
            drawRect(5, -20 - swing, 3, 9, primaryColor);
        }

        // 4. HEAD
        drawRect(-4, -30, 8, 8, '#ffdbac'); // Skin

        // Hair / Hat
        if (equippedItems.includes('headband')) {
            drawRect(-4, -28, 8, 2, '#ef4444');
        } else {
            drawRect(-4, -30, 8, 2, '#2d3436'); // Hair top
            drawRect(-4, -28, 2, 2, '#2d3436'); // Sideburns
            drawRect(2, -28, 2, 2, '#2d3436');
        }

        // Sunglasses / Eyes
        if (equippedItems.includes('sunglasses')) {
            drawRect(-3, -26, 6, 2, '#111');
        } else {
            drawRect(-2, -26, 1, 1, '#000'); // Left Eye
            drawRect(1, -26, 1, 1, '#000'); // Right Eye
        }

        // 5. ACCESSORIES (Pixelated)
        if (equippedItems.includes('championship_ring')) {
            drawRect(11, -19, 2, 2, '#ffd700'); // Ring on hand
        }
        if (equippedItems.includes('power_glove') && isHoldingBall) {
            drawRect(10, -21, 4, 4, '#333');
            drawRect(11, -20, 1, 1, '#0f0'); // LED
        }

        ctx.restore();

    };

    const drawReflections = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        // Masking for reflection fade
        // We draw scale -Y
        ctx.translate(0, -HEAD_PIN_Y * 2 - 120); // Mirror plane
        ctx.scale(1, -0.4); // Flatsquash reflection

        ctx.globalAlpha = 0.25;

        // Draw Pins Reflection
        pins.forEach(pin => {
            if (pin.isDown) return;
            // Simple white silhouette for reflection looks cleaner than full detail
            ctx.save();
            ctx.translate(pin.x, pin.y);
            ctx.fillStyle = '#e6e6e6';
            ctx.shadowBlur = 10; ctx.shadowColor = '#fff';
            ctx.beginPath(); ctx.arc(0, 0, PIN_RADIUS, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        // Ball Reflection
        if (gameState === 'ROLLING' || gameState === 'THROW_SEQUENCE') {
            ctx.save();
            ctx.translate(ball.x, ball.y);
            // Ball reflection matches color
            const bRefGrad = ctx.createRadialGradient(-5, -5, 0, 0, 0, ball.radius);
            bRefGrad.addColorStop(0, '#3b82f6');
            bRefGrad.addColorStop(1, '#1d4ed8');
            ctx.fillStyle = bRefGrad;
            ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    };

    const drawPin = (ctx: CanvasRenderingContext2D, pin: Pin) => {
        ctx.save();
        ctx.translate(pin.x, pin.y);
        ctx.rotate(pin.angle);
        ctx.globalAlpha = pin.isDown ? 0.3 : 1.0;

        const scale = 1.0 + (pin.y / CANVAS_HEIGHT) * 0.15;
        ctx.scale(scale, scale);

        // 1. Drop Shadow (Soft Realism)
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(0, 8, PIN_RADIUS * 0.7, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // 2. Pin Body Shape (Path)
        const createPinPath = () => {
            ctx.beginPath();
            ctx.moveTo(0, -PIN_RADIUS * 1.5); // Top center
            // Neck
            ctx.bezierCurveTo(PIN_RADIUS * 0.7, -PIN_RADIUS * 1.5, PIN_RADIUS * 0.9, -PIN_RADIUS * 0.6, PIN_RADIUS, 0); // Shoulder
            // Belly
            ctx.bezierCurveTo(PIN_RADIUS * 1.05, PIN_RADIUS * 0.8, -PIN_RADIUS * 1.05, PIN_RADIUS * 0.8, -PIN_RADIUS, 0);
            // Other Shoulder
            ctx.bezierCurveTo(-PIN_RADIUS * 0.9, -PIN_RADIUS * 0.6, -PIN_RADIUS * 0.7, -PIN_RADIUS * 1.5, 0, -PIN_RADIUS * 1.5);
            ctx.closePath();
        };

        // 3. Main Gradient (Simulate 3D Cylindrical lighting)
        // Light comes from top-left
        const pGrad = ctx.createLinearGradient(-PIN_RADIUS, 0, PIN_RADIUS, 0);
        pGrad.addColorStop(0.0, '#b2bec3'); // Dark edge
        pGrad.addColorStop(0.2, '#ffffff'); // Highlight
        pGrad.addColorStop(0.5, '#dfe6e9'); // Mid
        pGrad.addColorStop(0.9, '#636e72'); // Shadow edge
        pGrad.addColorStop(1.0, '#2d3436'); // Rim shadow

        ctx.fillStyle = pGrad;
        createPinPath();
        ctx.fill();

        // 4. Red Stripes (With curvature)
        // Clip to pin body so stripes don't bleed
        ctx.save();
        ctx.clip();
        const drawStripe = (yOffset: number, thickness: number) => {
            ctx.fillStyle = '#d63031';
            // Use a gradient for the stripe too
            const sGrad = ctx.createLinearGradient(-PIN_RADIUS, 0, PIN_RADIUS, 0);
            sGrad.addColorStop(0, '#b00');
            sGrad.addColorStop(0.2, '#f00');
            sGrad.addColorStop(0.8, '#a00');
            ctx.fillStyle = sGrad;

            ctx.beginPath();
            // Arc simulating cylinder wrap
            ctx.ellipse(0, yOffset, PIN_RADIUS, thickness, 0, 0, Math.PI * 2);
            ctx.fill();
        };

        drawStripe(-PIN_RADIUS * 0.9, 5); // Neck stripe
        drawStripe(-PIN_RADIUS * 0.55, 5); // Lower stripe
        ctx.restore();

        // 5. Specular Gloss (Shiny Plastic)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const glossGrad = ctx.createLinearGradient(-5, -30, 0, 10);
        glossGrad.addColorStop(0, 'rgba(255,255,255,0.8)');
        glossGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glossGrad;
        ctx.beginPath(); ctx.ellipse(-PIN_RADIUS * 0.3, -PIN_RADIUS * 0.5, 3, 12, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        ctx.restore();
    };

    const drawSweeper = (ctx: CanvasRenderingContext2D, y: number) => {
        // Draw the mechanical sweeper bar
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = '#000';
        ctx.fillStyle = '#2d3436';
        ctx.fillRect((CANVAS_WIDTH - LANE_WIDTH) / 2 - 20, y, LANE_WIDTH + 40, 20);
        ctx.fillStyle = '#636e72';
        ctx.fillRect((CANVAS_WIDTH - LANE_WIDTH) / 2 - 20, y + 5, LANE_WIDTH + 40, 10);

        // Hydraulic arms
        ctx.fillStyle = '#cecece';
        ctx.fillRect((CANVAS_WIDTH - LANE_WIDTH) / 2 - 30, y - 200, 10, 200);
        ctx.fillRect((CANVAS_WIDTH - LANE_WIDTH) / 2 + LANE_WIDTH + 20, y - 200, 10, 200);
        ctx.restore();
    };

    const drawBallReturn = (ctx: CanvasRenderingContext2D) => {
        const trackX = 20;
        const trackW = 32;

        ctx.save();
        // Base Unit (Floor Level) - The "Ball Return Machine"
        const machineY = BALL_START_Y - 40;
        const machineH = 120;
        const machineW = 50;

        const machineGrad = ctx.createLinearGradient(trackX - machineW / 2, machineY, trackX + machineW / 2, machineY);
        machineGrad.addColorStop(0, '#1a1a1a');
        machineGrad.addColorStop(0.5, '#454545');
        machineGrad.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = machineGrad;
        ctx.beginPath();
        ctx.roundRect(trackX - machineW / 2, machineY, machineW, machineH, 12);
        ctx.fill();

        // Metallic Rim
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();

        // The Return Hole
        ctx.fillStyle = '#050505';
        ctx.beginPath();
        ctx.arc(trackX, machineY + 35, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0fbcf9';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Neon Accents on Machine
        ctx.shadowBlur = 10; ctx.shadowColor = '#0fbcf9';
        ctx.fillStyle = '#0fbcf9';
        ctx.fillRect(trackX - machineW / 2 + 5, machineY + 80, machineW - 10, 3);
        ctx.shadowBlur = 0;

        // Tracks leading up the lane
        ctx.fillStyle = '#222';
        ctx.fillRect(trackX - 10, 0, 20, machineY);

        const railsGrad = ctx.createLinearGradient(trackX - 10, 0, trackX + 10, 0);
        railsGrad.addColorStop(0, '#444');
        railsGrad.addColorStop(0.4, '#aaa');
        railsGrad.addColorStop(0.6, '#aaa');
        railsGrad.addColorStop(1, '#444');
        ctx.fillStyle = railsGrad;
        ctx.fillRect(trackX - 8, 0, 3, machineY); // Left Rail
        ctx.fillRect(trackX + 5, 0, 3, machineY); // Right Rail

        // Rollers
        ctx.fillStyle = '#111';
        for (let y = 0; y < machineY; y += 60) {
            ctx.fillRect(trackX - 6, y, 12, 4);
        }

        // --- Side Wall Monitor (Information Display) ---
        const monitorY = 400;
        ctx.fillStyle = '#0a0a0c';
        ctx.beginPath();
        ctx.roundRect(5, monitorY, 70, 90, 8);
        ctx.fill();
        ctx.strokeStyle = '#4c51bf';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Monitor Content
        ctx.fillStyle = 'rgba(76, 81, 191, 0.15)';
        ctx.fillRect(10, monitorY + 5, 60, 80);
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#0fbcf9';
        ctx.fillText("LANE 1", 15, monitorY + 25);
        ctx.fillStyle = '#fff';
        ctx.fillText("AUTO", 15, monitorY + 45);
        ctx.fillStyle = '#f53b57';
        ctx.fillText("PRO", 15, monitorY + 65);

        ctx.restore();
    };

    useEffect(() => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        drawBackground(ctx, canvas.width, canvas.height);

        const scale = Math.min(canvas.width / CANVAS_WIDTH, canvas.height / CANVAS_HEIGHT);
        const scaledWidth = CANVAS_WIDTH * scale;
        const scaledHeight = CANVAS_HEIGHT * scale;

        const offsetX = (canvas.width - scaledWidth) / 2 + (Math.random() - 0.5) * screenShake * 2;
        const offsetY = (canvas.height - scaledHeight) / 2 + (Math.random() - 0.5) * screenShake * 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        const time = Date.now() / 1500;
        const neonGlow = Math.abs(Math.sin(time)) * 25 + 15;

        ctx.save();
        ctx.shadowBlur = neonGlow;
        ctx.shadowColor = '#0fbcf9';
        ctx.fillStyle = '#0fbcf9';
        ctx.font = 'bold 36px "Press Start 2P"';
        ctx.textAlign = 'center';
        // Multi-pass bloom
        ctx.fillText("LANE", 110, 80);
        ctx.shadowBlur = neonGlow * 0.5;
        ctx.fillText("LANE", 110, 80);

        ctx.shadowColor = '#f53b57';
        ctx.fillStyle = '#f53b57';
        ctx.shadowBlur = neonGlow;
        ctx.fillText("SHARK", 300, 80);
        ctx.shadowBlur = neonGlow * 0.5;
        ctx.fillText("SHARK", 300, 80);
        ctx.restore();

        if (isZoomed) {
            const zoomCx = CANVAS_WIDTH / 2;
            const zoomCy = HEAD_PIN_Y - 50;
            const scale = 1.7;
            ctx.translate(zoomCx, zoomCy); ctx.scale(scale, scale); ctx.translate(-zoomCx, -zoomCy);
        }

        const laneX = (CANVAS_WIDTH - LANE_WIDTH) / 2;
        const rightGutterX = laneX + LANE_WIDTH;

        ctx.fillStyle = '#050505';
        ctx.fillRect(laneX - GUTTER_WIDTH, 0, GUTTER_WIDTH, CANVAS_HEIGHT);
        ctx.fillRect(rightGutterX, 0, GUTTER_WIDTH, CANVAS_HEIGHT);

        // Pin Deck (Dark Box Area)
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(laneX, 0, LANE_WIDTH, 150); // Dark area behind pins

        // Header / Masking Unit Shadow
        ctx.shadowBlur = 50; ctx.shadowColor = '#000';
        ctx.fillStyle = '#000';
        ctx.fillRect(laneX, 0, LANE_WIDTH, 50);
        ctx.shadowBlur = 0;

        const woodGrad = ctx.createLinearGradient(laneX, 0, rightGutterX, 0);
        woodGrad.addColorStop(0, '#63442a');
        woodGrad.addColorStop(0.3, '#8e5d2b');
        woodGrad.addColorStop(0.5, '#d2a679');
        woodGrad.addColorStop(0.7, '#8e5d2b');
        woodGrad.addColorStop(1, '#63442a');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);

        // Apply High-Res Wood Pattern
        if (woodPattern) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = 0.6;
            // Tile the pattern vertically
            const pattern = ctx.createPattern(woodPattern, 'repeat');
            if (pattern) {
                ctx.translate(laneX, 0);
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, LANE_WIDTH, CANVAS_HEIGHT);
            }
            ctx.restore();
        }

        // Lane Arrows (Marks) - Realistic
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        for (let i = 1; i <= 5; i++) {
            const arrowX = laneX + (LANE_WIDTH / 6) * i;
            const arrowY = 300;
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - 5, arrowY - 20);
            ctx.lineTo(arrowX + 5, arrowY - 20);
            ctx.fill();
        }

        drawBallReturn(ctx);

        drawReflections(ctx);

        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
        for (let i = 1; i <= 15; i++) {
            const px = laneX + (LANE_WIDTH / 15) * i;
            ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, CANVAS_HEIGHT); ctx.stroke();
        }

        const gloss = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gloss.addColorStop(0, 'rgba(255,255,255,0.25)');
        gloss.addColorStop(0.4, 'rgba(255,255,255,0.02)');
        gloss.addColorStop(0.9, 'rgba(255,255,255,0.15)');
        ctx.fillStyle = gloss;
        ctx.fillRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);

        // Ball Emission Glow (Cinematic Lighting)
        if (gameState === 'ROLLING') {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const ballGlow = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, 150);
            ballGlow.addColorStop(0, 'rgba(96, 165, 250, 0.35)');
            ballGlow.addColorStop(0.5, 'rgba(96, 165, 250, 0.05)');
            ballGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = ballGlow;
            ctx.fillRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);
            ctx.restore();
        }

        spectators.forEach(spec => {
            ctx.save(); ctx.translate(spec.x, spec.y);
            const jump = (spec.state === 'CHEER') ? Math.abs(Math.sin(time * 6 + spec.id)) * 14 : 0;
            ctx.translate(0, -jump);
            ctx.shadowBlur = 12; ctx.shadowColor = spec.color;
            ctx.fillStyle = spec.color;
            ctx.beginPath(); ctx.roundRect(-14, 5, 28, 24, 8); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffdbac';
            ctx.beginPath(); ctx.arc(0, -5, 12, 0, Math.PI * 2); ctx.fill();
            if (gameState === 'ROLLING' && Math.random() > 0.99) {
                ctx.save(); ctx.globalCompositeOperation = 'screen';
                const fG = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
                fG.addColorStop(0, '#fff'); fG.addColorStop(1, 'transparent');
                ctx.fillStyle = fG; ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        });



        pins.forEach(p => drawPin(ctx, p));

        // Tapering Neon Trail with Electric Effect
        if (gameState === 'ROLLING' && trail.length > 2) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Core Trail
            ctx.beginPath();
            trail.forEach((p, i) => {
                const opacity = (i / trail.length);
                const width = (i / trail.length) * ball.radius * 0.6;
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
            ctx.lineWidth = ball.radius * 0.4;
            ctx.stroke();

            // Electric Arcs
            ctx.shadowBlur = 15; ctx.shadowColor = '#00f2ff';
            for (let i = 2; i < trail.length; i += 2) {
                const p = trail[i];
                const prev = trail[i - 1];
                const opacity = (i / trail.length);
                if (Math.random() > 0.3) continue;

                ctx.beginPath();
                ctx.moveTo(prev.x + (Math.random() - 0.5) * 10, prev.y);
                ctx.lineTo(p.x + (Math.random() - 0.5) * 10, p.y);
                ctx.strokeStyle = `rgba(180, 240, 255, ${opacity * 0.8})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.restore();
        }

        // Advanced Particle System
        particles.forEach(p => {
            ctx.save();
            const safeLife = Math.max(0, p.life);
            ctx.globalAlpha = safeLife;
            ctx.translate(p.x, p.y);

            // Rotate particles based on life for dynamic feel
            ctx.rotate(safeLife * 10);

            ctx.shadowBlur = 10; ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;

            // Varied Shapes based on color/randomness (Simulated)
            if (p.color === '#ffd32a' || p.color === '#eab308') {
                // Gold/Sparkle (Star shape)
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 5, Math.sin((18 + i * 72) * Math.PI / 180) * 5);
                    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 2, Math.sin((54 + i * 72) * Math.PI / 180) * 2);
                }
                ctx.fill();
            } else if (p.color === '#f53b57' || p.color.includes('red')) {
                // Fire/Explosion (Jagged shard)
                ctx.fillRect(-3, -3, 6, 6);
            } else {
                // Standard Dust/Smoke (Circle)
                ctx.beginPath(); ctx.arc(0, 0, Math.max(0, 3 * safeLife), 0, Math.PI * 2); ctx.fill();
            }

            ctx.restore();
        });


        if (!['SPLASH', 'MENU', 'PLAYER_CREATOR'].includes(gameState)) {
            const isPreparing = (gameState === 'READY_TO_BOWL' || gameState === 'THROW_SEQUENCE');
            if (isPreparing) {
                drawBowler(ctx, ball.x, ball.y + 40, true, gameState, ball.angle);
            } else if (gameState === 'ROLLING' && ball.y > BALL_START_Y - 250) {
                drawBowler(ctx, ball.x, BALL_START_Y + 40, false, gameState, ball.angle);
            }

            // Hide ball if inside return mechanism (Travels underground)
            const isHiddenInReturn = gameState === 'BALL_RETURN' && ball.x <= 30 && ball.y < BALL_START_Y - 40;

            if (!isHiddenInReturn) {
                ctx.save();
                ctx.translate(ball.x, ball.y);

                // Dynamic Shadow
                if (gameState === 'ROLLING') {
                    ctx.save();
                    ctx.translate(0, 15);
                    ctx.scale(1, 0.3);
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }

                // Rolling Animation (Rotation)
                if (gameState === 'ROLLING') {
                    const rotation = (ball.y / (ball.radius * 2 * Math.PI)) * Math.PI * 2;
                    // Rotate along X-axis simulation? 
                    // Since it's 2D top-down, we simulate rolling by rotating the context
                    ctx.rotate(rotation);
                }

                if (ballImage && ballImage.complete && ballImage.naturalWidth > 0) {
                    ctx.save();
                    ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.clip();
                    ctx.drawImage(ballImage, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
                    ctx.restore();

                    // Spherical Shading Overlay
                    const sphereGrad = ctx.createRadialGradient(-ball.radius * 0.4, -ball.radius * 0.4, 2, 0, 0, ball.radius);
                    sphereGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
                    sphereGrad.addColorStop(0.5, 'transparent');
                    sphereGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
                    ctx.fillStyle = sphereGrad;
                    ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();
                } else {
                    // PROCEDURAL PRO BALL
                    // Base material
                    const mat = ball.material || 'PLASTIC';

                    ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);

                    if (mat === 'RESIN') {
                        // Swirl Pattern
                        const swirl = ctx.createLinearGradient(-ball.radius, -ball.radius, ball.radius, ball.radius);
                        swirl.addColorStop(0, '#1e3a8a');
                        swirl.addColorStop(0.3, '#3b82f6');
                        swirl.addColorStop(0.5, '#172554');
                        swirl.addColorStop(0.7, '#60a5fa');
                        swirl.addColorStop(1, '#1e3a8a');
                        ctx.fillStyle = swirl;
                    } else if (mat === 'URETHANE') {
                        // Solid Matte with speckled noise
                        ctx.fillStyle = '#be123c'; // Deep Red Urethane default
                    } else {
                        // Plastic (High Polish)
                        const bGrad = ctx.createRadialGradient(-ball.radius * 0.4, -ball.radius * 0.4, 2, 0, 0, ball.radius);
                        bGrad.addColorStop(0, '#93c5fd');
                        bGrad.addColorStop(0.7, '#1e4ed8');
                        bGrad.addColorStop(1, '#0c2461');
                        ctx.fillStyle = bGrad;
                    }
                    ctx.fill();

                    // Speckles for Urethane
                    if (mat === 'URETHANE') {
                        ctx.save();
                        ctx.fillStyle = 'rgba(0,0,0,0.2)';
                        for (let k = 0; k < 10; k++) {
                            const rx = (Math.random() - 0.5) * ball.radius * 1.5;
                            const ry = (Math.random() - 0.5) * ball.radius * 1.5;
                            if (rx * rx + ry * ry < ball.radius * ball.radius) {
                                ctx.beginPath(); ctx.arc(rx, ry, 2, 0, Math.PI * 2); ctx.fill();
                            }
                        }
                        ctx.restore();
                    }

                    // Intense Gloss for Plastic/Resin
                    if (mat !== 'URETHANE') {
                        ctx.fillStyle = 'rgba(255,255,255,0.7)';
                        ctx.beginPath(); ctx.ellipse(-ball.radius * 0.3, -ball.radius * 0.3, ball.radius * 0.25, ball.radius * 0.15, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
                    }
                }
                ctx.restore();
            }
        }

        if (gameState === 'THROW_SEQUENCE') {
            ctx.save(); ctx.translate(ball.x, ball.y);
            if (throwStep === 'AIM') {
                const aimAngle = aimOscillation * Math.PI * 0.25;
                ctx.rotate(aimAngle);
                const jitterX = (Math.random() - 0.5) * 4;
                const aimG = ctx.createLinearGradient(0, 0, 0, -150);
                aimG.addColorStop(0, '#fff'); aimG.addColorStop(0.5, '#0fbcf9'); aimG.addColorStop(1, 'transparent');
                ctx.strokeStyle = aimG; ctx.lineWidth = 10;
                ctx.shadowBlur = 25; ctx.shadowColor = '#0fbcf9';
                ctx.setLineDash([18, 10]); ctx.lineDashOffset = -Date.now() / 8;
                ctx.beginPath(); ctx.moveTo(jitterX, 0); ctx.lineTo(jitterX, -140); ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.moveTo(jitterX, -160); ctx.lineTo(-18, -140); ctx.lineTo(18, -140); ctx.fill();
            }
            if (throwStep === 'POWER') {
                const p = powerOscillation;
                const h = p * 120;
                ctx.translate(65, -60);
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.beginPath(); ctx.roundRect(0, 0, 28, 120, 8); ctx.fill();
                const pG = ctx.createLinearGradient(0, 120, 0, 0);
                pG.addColorStop(0, '#00d8d6'); pG.addColorStop(0.5, '#ffd32a'); pG.addColorStop(1, '#f53b57');
                ctx.fillStyle = pG;
                ctx.shadowBlur = (p > 1.2) ? 30 : 20;
                ctx.shadowColor = (p > 1.2) ? '#f53b57' : '#ffd32a';
                ctx.beginPath(); ctx.roundRect(3, 120 - h, 22, h, 6); ctx.fill();
                if (p > 1.3) {
                    ctx.save(); ctx.globalCompositeOperation = 'screen';
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
                    ctx.strokeRect(-4, 116 - h, 36, 6);
                    ctx.restore();
                }
                ctx.fillStyle = '#fff'; ctx.font = '9px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText("PWR", 14, 145);
            }
            ctx.restore();
            ctx.restore();
        }

        // Sweeper Animation
        if (gameState === 'PIN_SETTLEMENT' || gameState === 'SWEEPING' as any) {
            const time = Date.now();
            const sweepY = Math.abs(Math.sin(time / 500)) * 100; // Oscillate for effect
            drawSweeper(ctx, sweepY);
        }

        ctx.restore();
    }, [ball, pins, trail, particles, gameState, ballImage, spectators, laneCondition, isZoomed, scuffs, equippedOutfitId, showAimLine, aimOscillation, powerOscillation, throwStep, screenShake, dimensions]);

    return <canvas ref={canvasRef} className="game-canvas-element" onClick={handleCanvasClick} />;
};

export default GameCanvas;
