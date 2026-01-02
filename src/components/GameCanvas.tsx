/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Ball, Pin, GameState, Particle, Spectator, BallMaterial } from '../types';
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
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    canvasRef, ball, pins, trail, particles, gameState, ballImage,
    spectators = [], laneCondition = 'NORMAL', equippedOutfitId,
    equippedItems = [], aimOscillation = 0, powerOscillation = 0.8,
    throwStep = 'POSITION', screenShake = 0, onClickBowler,
    availableBalls = ['PLASTIC', 'URETHANE', 'RESIN'], onSelectBall
}) => {

    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const gameLoopIdRef = useRef<number | null>(null);

    // High-Fidelity Wood Texture (Cached)
    const woodPattern = useMemo(() => {
        if (typeof document === 'undefined') return null;
        const c = document.createElement('canvas');
        c.width = LANE_WIDTH;
        c.height = 1024;
        const ctx = c.getContext('2d');
        if (!ctx) return null;

        // Base Wood
        const woodGradient = ctx.createLinearGradient(0, 0, c.width, 0);
        woodGradient.addColorStop(0, '#eaccad');
        woodGradient.addColorStop(0.2, '#d6a87c');
        woodGradient.addColorStop(0.5, '#cba274');
        woodGradient.addColorStop(0.8, '#d6a87c');
        woodGradient.addColorStop(1, '#eaccad');
        ctx.fillStyle = woodGradient;
        ctx.fillRect(0, 0, c.width, c.height);

        // Boards
        const boardWidth = c.width / 7; // Fewer boards for wider single lane
        for (let i = 0; i < 7; i++) {
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.03)';
                ctx.fillRect(i * boardWidth, 0, boardWidth, c.height);
            }
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(i * boardWidth, 0, 1, c.height);
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
        const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 100, width / 2, height / 2, width);
        bgGrad.addColorStop(0, '#1a1c29');
        bgGrad.addColorStop(1, '#050505');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        const time = Date.now() / 3000;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 4; i++) {
            const angle = (Math.sin(time + i) * 0.1);
            const x = width / 2 + (i - 1.5) * 400;
            ctx.save();
            ctx.translate(x, -50);
            ctx.rotate(angle);
            const beamGrad = ctx.createLinearGradient(0, 0, 0, height);
            beamGrad.addColorStop(0, `hsla(${210 + i * 20}, 70%, 50%, 0.1)`);
            beamGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = beamGrad;
            ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(60, 0); ctx.lineTo(200, height); ctx.lineTo(-200, height); ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    };

    const drawPin = (ctx: CanvasRenderingContext2D, pin: Pin) => {
        ctx.save();
        ctx.translate(pin.x, pin.y);
        ctx.rotate(pin.angle);
        ctx.globalAlpha = pin.isDown ? 0.3 : 1.0;

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, -PIN_RADIUS, PIN_RADIUS * 0.6, 0, Math.PI * 2); // Head
        ctx.arc(0, 0, PIN_RADIUS, 0, Math.PI * 2); // Body
        ctx.fill();

        ctx.fillStyle = '#e53e3e';
        ctx.fillRect(-PIN_RADIUS, -PIN_RADIUS * 1.2, PIN_RADIUS * 2, 4);
        ctx.restore();
    };

    const drawBowler = (ctx: CanvasRenderingContext2D, x: number, y: number, isHoldingBall: boolean, gameState: GameState, angle: number) => {
        const time = Date.now();
        const animY = (gameState === 'ROLLING') ? Math.abs(Math.sin(time / 100)) * 10 : 0;

        ctx.save();
        ctx.translate(x, y - animY);
        ctx.scale(1.5, 1.5); // Bigger Bowler
        ctx.rotate(angle * Math.PI / 180 * 0.1); // Small lean

        // Simple Pixel Bowler
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-8, 0, 6, 15); ctx.fillRect(2, 0, 6, 15); // Legs
        ctx.fillStyle = '#4834d4'; ctx.fillRect(-12, -25, 24, 25); // Body
        ctx.fillStyle = '#ffdbac'; ctx.fillRect(-8, -45, 16, 20); // Head
        ctx.fillStyle = '#000'; ctx.fillRect(-8, -45, 16, 5); // Hair

        if (isHoldingBall) {
            ctx.fillStyle = BALL_COLOR; ctx.beginPath(); ctx.arc(15, -15, 10, 0, Math.PI * 2); ctx.fill();
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
            const Wood = ctx.createPattern(woodPattern!, 'repeat')!;

            // Gutters
            ctx.fillStyle = '#111';
            ctx.fillRect(lx - 25, 0, 25, CANVAS_HEIGHT);
            ctx.fillRect(lx + LANE_WIDTH, 0, 25, CANVAS_HEIGHT);

            // Lane
            ctx.fillStyle = Wood;
            ctx.fillRect(lx, 0, LANE_WIDTH, CANVAS_HEIGHT);

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

            // Gameplay
            pins.forEach(p => drawPin(ctx, p));

            if (trail.length > 2) {
                ctx.save(); ctx.globalCompositeOperation = 'screen';
                ctx.beginPath(); trail.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
                ctx.strokeStyle = '#0fbcf9'; ctx.lineWidth = 8; ctx.stroke();
                ctx.restore();
            }

            if (gameState === 'ROLLING' || gameState === 'PIN_SETTLEMENT' || gameState === 'BALL_RETURN') {
                ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(ball.angle * Math.PI / 180);
                if (ballImage) ctx.drawImage(ballImage, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
                else { ctx.fillStyle = BALL_COLOR; ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill(); }
                ctx.restore();
            }

            particles.forEach(p => {
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
            });

            if (gameState === 'THROW_SEQUENCE' || gameState === 'READY_TO_BOWL') {
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
    }, [ball, pins, trail, particles, gameState, ballImage, spectators, laneCondition, aimOscillation, powerOscillation, throwStep, screenShake, woodPattern]);

    return <canvas ref={canvasRef} className="game-canvas-element" onClick={handleCanvasClick} />;
};

export default GameCanvas;
