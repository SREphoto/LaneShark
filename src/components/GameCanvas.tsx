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
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width);
        bgGrad.addColorStop(0, '#16213e');
        bgGrad.addColorStop(0.6, '#0f0c29');
        bgGrad.addColorStop(1, '#050505');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const time = Date.now() / 4000;
        for (let i = 0; i < 3; i++) {
            const beamX = width / 2 + Math.sin(time + i) * 300;
            const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 200, height);
            beamGrad.addColorStop(0, `hsla(${200 + i * 40}, 80%, 50%, 0.05)`);
            beamGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(beamX, 0); ctx.lineTo(beamX + 300, 0);
            ctx.lineTo(beamX + 600, height); ctx.lineTo(beamX, height);
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * width;
            const y = (Math.cos(i * 678.9) * 0.5 + 0.5) * height * 0.4;
            ctx.globalAlpha = Math.random() * 0.3;
            ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1.0;
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
        ctx.globalAlpha = 0.1;
        ctx.scale(1, -0.4);
        ctx.translate(0, -HEAD_PIN_Y * 2 - 120);

        pins.forEach(pin => {
            if (pin.isDown) return;
            ctx.save(); ctx.translate(pin.x, pin.y);
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(0, 0, PIN_RADIUS, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        if (gameState === 'ROLLING' || gameState === 'THROW_SEQUENCE') {
            ctx.save(); ctx.translate(ball.x, ball.y);
            ctx.fillStyle = '#fff';
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

        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(0, 10, PIN_RADIUS, 5, 0, 0, Math.PI * 2); ctx.fill();

        const pGrad = ctx.createRadialGradient(-PIN_RADIUS * 0.3, -PIN_RADIUS * 0.4, 2, 0, 0, PIN_RADIUS);
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.8, '#dfe6e9');
        pGrad.addColorStop(1, '#b2bec3');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.moveTo(0, -PIN_RADIUS * 1.5);
        ctx.bezierCurveTo(PIN_RADIUS, -PIN_RADIUS * 1.5, PIN_RADIUS, -PIN_RADIUS * 0.5, PIN_RADIUS, 0);
        ctx.bezierCurveTo(PIN_RADIUS, PIN_RADIUS, -PIN_RADIUS, PIN_RADIUS, -PIN_RADIUS, 0);
        ctx.bezierCurveTo(-PIN_RADIUS, -PIN_RADIUS * 0.5, -PIN_RADIUS, -PIN_RADIUS * 1.5, 0, -PIN_RADIUS * 1.5);
        ctx.fill();

        ctx.fillStyle = '#d63031';
        ctx.fillRect(-PIN_RADIUS * 0.7, -PIN_RADIUS * 0.8, PIN_RADIUS * 1.4, 3);
        ctx.fillRect(-PIN_RADIUS * 0.6, -PIN_RADIUS * 0.6, PIN_RADIUS * 1.2, 2);

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath(); ctx.ellipse(-3, -8, 4, 8, Math.PI / 6, 0, Math.PI * 2); ctx.fill();

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
        ctx.fillText("LANE", 110, 80);

        ctx.shadowColor = '#f53b57';
        ctx.fillStyle = '#f53b57';
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

            ctx.save();
            ctx.translate(ball.x, ball.y);
            if (gameState === 'ROLLING') {
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = 'rgba(96, 165, 250, 0.4)';
                ctx.beginPath(); ctx.arc(0, 15, ball.radius, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            const bGrad = ctx.createRadialGradient(-ball.radius * 0.4, -ball.radius * 0.4, 2, 0, 0, ball.radius);
            bGrad.addColorStop(0, '#93c5fd');
            bGrad.addColorStop(0.7, '#1e4ed8');
            bGrad.addColorStop(1, '#0c2461');
            ctx.fillStyle = bGrad;
            ctx.shadowBlur = 25; ctx.shadowColor = 'rgba(30, 78, 216, 0.6)';
            ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath(); ctx.ellipse(-6, -7, 8, 4, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
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
