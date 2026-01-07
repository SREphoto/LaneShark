/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Ball, Pin, GameState, Particle, Spectator, BallMaterial, StageId } from '../types';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, LANE_WIDTH, BALL_RADIUS, PIN_RADIUS,
    BALL_START_Y, HEAD_PIN_Y, BALL_COLOR, PIN_SPACING
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
    availableBalls?: BallMaterial[];
    onSelectBall?: (material: BallMaterial) => void;
    currentStage?: StageId;
    onSwipeThrow?: (power: number, angle: number) => void; // Call with calculated power/angle
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    canvasRef, ball, pins, trail, particles, gameState, ballImage,
    spectators = [], laneCondition = 'NORMAL', equippedOutfitId,
    equippedItems = [], aimOscillation = 0, powerOscillation = 0.8,
    throwStep = 'POSITION', screenShake = 0, onClickBowler,
    availableBalls = ['PLASTIC', 'URETHANE', 'RESIN'], onSelectBall,
    currentStage = 'CLASSIC', onSwipeThrow
}) => {

    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const gameLoopIdRef = useRef<number | null>(null);

    // High-Fidelity Wood Texture (Cached)
    const WoodPattern = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const stageColors = {
            CLASSIC: { primary: '#d6a87c', secondary: '#cba274', board: '#a67c52', grain: 'rgba(0,0,0,0.1)' },
            RETRO_NEON: { primary: '#2d3436', secondary: '#2d3436', board: '#e84393', grain: 'rgba(232, 67, 147, 0.2)' },
            NEO_TOKYO: { primary: '#0984e3', secondary: '#0984e3', board: '#00cec9', grain: 'rgba(0, 206, 201, 0.2)' },
            COSMIC_VOID: { primary: '#6c5ce7', secondary: '#4834d4', board: '#a29bfe', grain: 'rgba(162, 155, 254, 0.2)' }
        };
        const colors = stageColors[currentStage] || stageColors.CLASSIC;

        const c = document.createElement('canvas');
        c.width = LANE_WIDTH;
        c.height = 1024;
        const ctx = c.getContext('2d');
        if (!ctx) return null;

        // Retro Wood Pattern (Tiled/Pixelated)
        ctx.fillStyle = colors.primary;
        ctx.fillRect(0, 0, c.width, c.height);

        // Boards with solid lines
        const boardWidth = c.width / 10;
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = i % 2 === 0 ? colors.secondary : colors.primary;
            ctx.fillRect(i * boardWidth, 0, boardWidth, c.height);
            ctx.fillStyle = colors.board;
            ctx.fillRect(i * boardWidth, 0, 2, c.height);
        }

        // Add some "grain" pixels
        for (let i = 0; i < 200; i++) {
            ctx.fillStyle = colors.grain;
            ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 2, currentStage === 'CLASSIC' ? 8 : 2);
        }
        return c;
    }, [currentStage]);

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
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scale = Math.min(canvas.width / CANVAS_WIDTH, canvas.height / CANVAS_HEIGHT);
        const offsetX = (canvas.width - CANVAS_WIDTH * scale) / 2;
        const offsetY = (canvas.height - CANVAS_HEIGHT * scale) / 2;

        const gameX = (mouseX - offsetX) / scale;
        const gameY = (mouseY - offsetY) / scale;

        // Check if clicking near bowler to start throw
        const distToBowler = Math.sqrt(Math.pow(gameX - ball.x, 2) + Math.pow(gameY - (ball.y + 40), 2));
        if (distToBowler < 60 && onClickBowler) {
            onClickBowler();
            return;
        }

        // Check if clicking balls in return area (Single Lane Return Position)
        if (onSelectBall) {
            availableBalls.forEach((mat, i) => {
                const bx = 380; // Right side return
                const by = BALL_START_Y - 40 + (i * 45);
                const dist = Math.sqrt(Math.pow(gameX - bx, 2) + Math.pow(gameY - by, 2));
                if (dist < 20) {
                    onSelectBall(mat);
                }
            });
        }
    };

    const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const stageBg = {
            CLASSIC: ['#1a1c29', '#050505'],
            RETRO_NEON: ['#000000', '#1a1c29'], // Darker for neon pop
            NEO_TOKYO: ['#050505', '#1e272e'], // Industrial dark
            COSMIC_VOID: ['#000000', '#0a0a2a'] // Deep space
        };
        const colors = stageBg[currentStage] || stageBg.CLASSIC;

        const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 100, width / 2, height / 2, width);
        bgGrad.addColorStop(0, colors[0]);
        bgGrad.addColorStop(1, colors[1]);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Stage-specific Background Details
        const time = Date.now() / 1000;

        if (currentStage === 'RETRO_NEON') {
            // Glowing Grid
            ctx.strokeStyle = 'rgba(232, 67, 147, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
            }
            for (let i = 0; i < height; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
            }
        } else if (currentStage === 'COSMIC_VOID') {
            // Stars
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 50; i++) {
                const sTime = time + i * 137.5;
                const opacity = (Math.sin(sTime) + 1) / 2;
                ctx.globalAlpha = opacity * 0.5;
                const x = (i * 12345) % width;
                const y = (i * 54321) % height;
                ctx.fillRect(x, y, 2, 2);
            }
            ctx.globalAlpha = 1.0;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 4; i++) {
            const angle = (Math.sin(time / 3 + i) * 0.1);
            const x = width / 2 + (i - 1.5) * (currentStage === 'COSMIC_VOID' ? 600 : 400);
            ctx.save();
            ctx.translate(x, -50);
            ctx.rotate(angle);
            const beamGrad = ctx.createLinearGradient(0, 0, 0, height);
            const beamColors = {
                CLASSIC: [210, 70, 50],
                RETRO_NEON: [330, 80, 60],
                NEO_TOKYO: [180, 90, 50],
                COSMIC_VOID: [260, 100, 40]
            };
            const [h, s, l] = beamColors[currentStage] || beamColors.CLASSIC;
            beamGrad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 0.15)`);
            beamGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = beamGrad;
            ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(60, 0); ctx.lineTo(300, height); ctx.lineTo(-300, height); ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    };

    const drawPin = (ctx: CanvasRenderingContext2D, pin: Pin) => {
        ctx.save();
        ctx.translate(pin.x, pin.y);
        ctx.rotate(pin.angle);
        ctx.globalAlpha = pin.isDown ? 0.3 : 1.0;

        const pinColors = {
            CLASSIC: { body: '#fff', stripe: '#e53e3e' },
            RETRO_NEON: { body: '#f1f2f6', stripe: '#e84393' },
            NEO_TOKYO: { body: '#dfe6e9', stripe: '#00cec9' },
            COSMIC_VOID: { body: '#a29bfe', stripe: '#6c5ce7' }
        };
        const colors = pinColors[currentStage] || pinColors.CLASSIC;

        // Pixel Art Pin
        ctx.fillStyle = colors.body;
        // Base
        ctx.fillRect(-8, -2, 16, 4);
        // Body (Blocky)
        ctx.fillRect(-10, -12, 20, 10);
        ctx.fillRect(-8, -18, 16, 6);
        // Neck
        ctx.fillRect(-5, -24, 10, 6);
        // Head
        ctx.fillRect(-7, -32, 14, 8);

        // Stripe
        ctx.fillStyle = colors.stripe;
        ctx.fillRect(-5, -22, 10, 4);
        ctx.restore();
    };

    const drawBowler = (ctx: CanvasRenderingContext2D, x: number, y: number, isHoldingBall: boolean, gameState: GameState, angle: number) => {
        const time = Date.now();
        const animY = (gameState === 'ROLLING') ? Math.abs(Math.sin(time / 100)) * 10 : 0;

        ctx.save();
        ctx.translate(x, y - animY);
        ctx.scale(1.5, 1.5);

        // 16-bit Sprite Style Bowler
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-12, 10, 24, 6);

        // Shoes
        ctx.fillStyle = '#000';
        ctx.fillRect(-10, 5, 8, 5);
        ctx.fillRect(2, 5, 8, 5);

        // Pants
        ctx.fillStyle = '#222';
        ctx.fillRect(-10, -5, 20, 10);

        // Shirt
        ctx.fillStyle = '#4834d4';
        ctx.fillRect(-12, -25, 24, 20);
        ctx.fillStyle = '#5f27cd'; // Shirt Highlights
        ctx.fillRect(-12, -25, 4, 15);

        // Arms
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(-16, -20, 6, 12); // Left
        ctx.fillRect(10, -20, 6, 12);  // Right

        // Head
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(-8, -40, 16, 15);
        // Hair
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(-10, -42, 20, 6);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(-4, -34, 2, 2);
        ctx.fillRect(2, -34, 2, 2);

        if (isHoldingBall) {
            ctx.fillStyle = '#34495e'; // Heavy charcoal ball
            ctx.fillRect(12, -15, 12, 12);
            // Holes
            ctx.fillStyle = '#000';
            ctx.fillRect(15, -12, 2, 2);
            ctx.fillRect(19, -12, 2, 2);
            ctx.fillRect(17, -8, 2, 2);
        }
        ctx.restore();
    };

    useEffect(() => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        const drawLoop = () => {
            if (!ctx) return;
            drawBackground(ctx, canvas.width, canvas.height);

            const scale = Math.min(canvas.width / CANVAS_WIDTH, canvas.height / CANVAS_HEIGHT);
            const offsetX = (canvas.width - CANVAS_WIDTH * scale) / 2 + (Math.random() - 0.5) * screenShake;
            const offsetY = (canvas.height - CANVAS_HEIGHT * scale) / 2 + (Math.random() - 0.5) * screenShake;

            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);

            // --- ENVIRONMENT ---
            // Single Lane Setup
            const lx = (CANVAS_WIDTH - LANE_WIDTH) / 2;
            const Wood = ctx.createPattern(WoodPattern!, 'repeat')!;

            const stageGutter = {
                CLASSIC: '#111',
                RETRO_NEON: '#e84393',
                NEO_TOKYO: '#00cec9',
                COSMIC_VOID: '#a29bfe'
            };
            const gutterColor = stageGutter[currentStage] || stageGutter.CLASSIC;

            // Gutters
            ctx.fillStyle = gutterColor;
            ctx.fillRect(lx - 25, 0, 25, CANVAS_HEIGHT);
            ctx.fillRect(lx + LANE_WIDTH, 0, 25, CANVAS_HEIGHT);

            // Lane
            ctx.fillStyle = Wood;
            ctx.fillRect(lx, 0, LANE_WIDTH, CANVAS_HEIGHT);

            // Dynamic Reflections (Subtle)
            const time = Date.now() / 1000;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const reflectGrad = ctx.createLinearGradient(lx, 0, lx + LANE_WIDTH, 0);
            reflectGrad.addColorStop(0, 'rgba(255,255,255,0)');
            reflectGrad.addColorStop(0.5, `rgba(255,255,255,${0.05 + Math.sin(time) * 0.02})`);
            reflectGrad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = reflectGrad;
            ctx.fillRect(lx, 0, LANE_WIDTH, CANVAS_HEIGHT);
            ctx.restore();

            // Foul line
            ctx.fillStyle = '#000';
            ctx.fillRect(lx, BALL_START_Y - 20, LANE_WIDTH, 5);

            // Ball Return (Right Side)
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(360, 0, 40, CANVAS_HEIGHT);
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.ellipse(380, BALL_START_Y + 20, 12, 80, 0, 0, Math.PI * 2); ctx.fill();

            // Available Balls in Return
            availableBalls.forEach((mat, i) => {
                ctx.save();
                ctx.translate(380, BALL_START_Y - 20 + (i * 45));
                const colors: Record<string, string> = { PLASTIC: '#3b82f6', URETHANE: '#be123c', RESIN: '#1e3a8a' };
                ctx.fillStyle = colors[mat] || '#666';
                ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });

            // Spectators (Use props, but keep simple placement)
            const t = Date.now();
            spectators.forEach(s => {
                ctx.save();
                ctx.translate(s.x, s.y);
                const jump = (s.state === 'CHEER') ? Math.abs(Math.sin(t / 200 + s.id)) * 10 : 0;
                ctx.translate(0, -jump);
                ctx.fillStyle = s.color; ctx.beginPath(); ctx.roundRect(-10, 0, 20, 15, 4); ctx.fill();
                ctx.fillStyle = '#ffdbac'; ctx.beginPath(); ctx.arc(0, -5, 8, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });

            // --- VISUAL ENHANCEMENTS: REFLECTIONS & SHADOWS ---
            const drawShadow = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.translate(x, y);
                ctx.scale(1, 0.4); // Flatten oval
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            const drawReflection = (ctx: CanvasRenderingContext2D, drawFn: () => void, x: number, y: number) => {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(1, -1); // Flip vertically
                ctx.translate(-x, -y);

                // Reflection mask/opacity
                ctx.globalAlpha = 0.15;
                // Add a slight vertical offset for the reflection to appear "in" the floor
                ctx.translate(0, 10);

                drawFn();
                ctx.restore();
            };

            // 1. Reflections Layer (Shiny Lane)
            // Pins Reflections
            pins.forEach(p => {
                drawReflection(ctx, () => drawPin(ctx, p), p.x, p.y);
            });
            // Ball Reflection
            if (gameState === 'ROLLING' || gameState === 'PIN_SETTLEMENT' || gameState === 'BALL_RETURN') {
                drawReflection(ctx, () => {
                    ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(ball.angle * Math.PI / 180);
                    // Simplify ball for reflection (no image, just color/shape) for perf & style
                    ctx.fillStyle = ball.material === 'PLASTIC' ? '#3b82f6' : ball.material === 'URETHANE' ? '#be123c' : '#1e3a8a';
                    ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();
                }, ball.x, ball.y);
            }

            // 2. Shadows Layer
            pins.forEach(p => {
                if (!p.isDown) drawShadow(ctx, p.x, p.y + 4, 10);
            });
            if (gameState === 'ROLLING' || gameState === 'PIN_SETTLEMENT') {
                drawShadow(ctx, ball.x, ball.y + 16, 14);
            }

            // 3. Gameplay Objects (Main Layer)
            pins.forEach(p => drawPin(ctx, p));

            if (trail.length > 2) {
                ctx.save(); ctx.globalCompositeOperation = 'screen';
                ctx.beginPath(); trail.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
                ctx.strokeStyle = '#0fbcf9'; ctx.lineWidth = 8; ctx.stroke();
                ctx.restore();
            }

            if (gameState === 'ROLLING' || gameState === 'PIN_SETTLEMENT' || gameState === 'BALL_RETURN') {
                ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(ball.angle * Math.PI / 180);

                // Spin Motion Blur (Subtle)
                if (Math.abs(ball.spin) > 0.1) {
                    ctx.save();
                    ctx.globalAlpha = 0.3;
                    ctx.rotate(Math.sin(time * 10) * 0.1);
                    if (ballImage) ctx.drawImage(ballImage, -ball.radius - 2, -ball.radius - 2, ball.radius * 2 + 4, ball.radius * 2 + 4);
                    ctx.restore();
                }

                if (ballImage) ctx.drawImage(ballImage, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
                else {
                    const ballColors: Record<string, string> = {
                        PLASTIC: '#3b82f6',
                        URETHANE: '#be123c',
                        RESIN: '#1e3a8a'
                    };
                    ctx.fillStyle = ballColors[ball.material] || BALL_COLOR;
                    ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();
            }

            particles.forEach(p => {
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
            });

            if (gameState === 'THROW_SEQUENCE' || gameState === 'READY_TO_BOWL' || gameState === 'MENU') {
                // Bowler Shadow
                drawShadow(ctx, ball.x, ball.y + 40 + 5, 18);
                drawBowler(ctx, ball.x, ball.y + 40, true, gameState, ball.angle);
            }

            if (gameState === 'THROW_SEQUENCE') {
                ctx.save(); ctx.translate(ball.x, ball.y);
                if (throwStep === 'AIM') {
                    // FIX: Aiming arc at 10 degrees (User liked this)
                    const ang = aimOscillation * Math.PI * (5 / 180);
                    ctx.rotate(ang); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([10, 5]);
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -200); ctx.stroke();
                }
                if (throwStep === 'POWER') {
                    // FIX: Constrained power bar height
                    const h = Math.min(114, powerOscillation * 120);
                    ctx.translate(45, -60); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, 20, 120);
                    ctx.fillStyle = '#f53b57'; ctx.fillRect(2, 118 - h, 16, h);
                }
                ctx.restore();
            }

            ctx.restore();
            gameLoopIdRef.current = requestAnimationFrame(drawLoop);
        };

        gameLoopIdRef.current = requestAnimationFrame(drawLoop);
        return () => { if (gameLoopIdRef.current) cancelAnimationFrame(gameLoopIdRef.current); };
    }, [ball, pins, trail, particles, gameState, ballImage, spectators, laneCondition, aimOscillation, powerOscillation, throwStep, screenShake, WoodPattern, currentStage]);

    // --- TOUCH CONTROLS (SWIPE TO BOWL) ---
    const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (gameState !== 'READY_TO_BOWL' && gameState !== 'THROW_SEQUENCE') return;

        // Prevent default scrolling
        // e.preventDefault(); // Note: React synthetic events might not support this directly here, usually done in CSS touch-action: none;

        const touch = e.touches[0];
        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!touchStartRef.current || (gameState !== 'READY_TO_BOWL' && gameState !== 'THROW_SEQUENCE')) return;

        const touch = e.changedTouches[0];
        const endTime = Date.now();
        const start = touchStartRef.current;

        const dx = touch.clientX - start.x;
        const dy = touch.clientY - start.y;
        const dt = endTime - start.time;

        // Swipe must be upward (negative dy) and fast enough
        if (dy < -50 && dt < 1000) {
            // Calculate Power (Speed)
            // Fast swipe (100ms) = High Power 1.5, Slow swipe (600ms+) = Low Power 0.5
            const speedFactor = Math.min(1.5, Math.max(0.5, 600 / dt));

            // Calculate Angle (Accuracy)
            // dx of 0 = Straight (0deg). dx of +/- 100px = +/- 5deg
            const maxAngle = 8; // Max degrees deflection
            const screenWidth = window.innerWidth;
            const angleBias = Math.max(-maxAngle, Math.min(maxAngle, (dx / (screenWidth / 3)) * maxAngle));

            // Trigger Throw
            if (onSwipeThrow) {
                onSwipeThrow(speedFactor, angleBias);
            }
        }

        touchStartRef.current = null;
    };

    return <canvas
        ref={canvasRef}
        className="game-canvas-element"
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }} // Crucial for preventing scroll
    />;
};

export default GameCanvas;
