
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useMemo } from 'react';
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
    showAimLine?: boolean;
    aimOscillation?: number;
    powerOscillation?: number;
    throwStep?: string;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    canvasRef, ball, pins, trail, particles, gameState, ballImage, spectators = [], laneCondition = 'NORMAL', isZoomed = false, equippedOutfitId, showAimLine = false,
    aimOscillation = 0, powerOscillation = 0.8, throwStep = 'POSITION'
}) => {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const scuffs = useMemo(() => {
        const items = [];
        const laneX = (CANVAS_WIDTH - LANE_WIDTH) / 2;
        for (let i = 0; i < 60; i++) {
            items.push({
                x: laneX + Math.random() * LANE_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                w: 5 + Math.random() * 20,
                h: 1 + Math.random() * 2,
                opacity: 0.02 + Math.random() * 0.05
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
            ctxRef.current = canvas.getContext('2d');
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [canvasRef]);

    const drawBallReturn = (ctx: CanvasRenderingContext2D) => {
        const x = 30;
        const y = BALL_START_Y - 50;

        ctx.save();
        ctx.translate(x, y);

        // Machine Base
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(-22, 0, 44, 70);

        // Polished Hood
        const grad = ctx.createLinearGradient(-30, 0, 30, 0);
        grad.addColorStop(0, '#2d3436');
        grad.addColorStop(0.3, '#636e72');
        grad.addColorStop(0.5, '#dfe6e9');
        grad.addColorStop(0.7, '#636e72');
        grad.addColorStop(1, '#2d3436');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(-30, -25, 60, 50, 15);
        ctx.fill();

        // Highlights
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Void
        ctx.fillStyle = '#0f0c29';
        ctx.beginPath();
        ctx.ellipse(0, -5, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rails
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(12, 25); ctx.lineTo(12, 100);
        ctx.moveTo(-12, 25); ctx.lineTo(-12, 100);
        ctx.stroke();

        ctx.restore();
    };

    const drawBowler = (ctx: CanvasRenderingContext2D, x: number, y: number, isHoldingBall: boolean, gameState: GameState, angle: number) => {
        const isRolling = gameState === 'ROLLING';
        const time = Date.now();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle * (Math.PI / 180) * 0.2);

        // Shadow with soft blur
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        const animY = isRolling ? Math.abs(Math.sin(time / 100)) * 5 : 0;
        ctx.translate(0, -animY);

        // Legs with shading
        ctx.fillStyle = '#1a1a2e';
        const legMovement = isRolling ? Math.sin(time / 80) * 12 : 0;

        // Left Leg
        ctx.beginPath();
        ctx.roundRect(-15, -20, 10, 20, 4);
        ctx.fill();
        // Right Leg
        ctx.beginPath();
        ctx.roundRect(5, -20 + legMovement, 10, 20, 4);
        ctx.fill();

        // Outfit Colors & Styles
        let primaryColor = '#4834d4';
        let accentColor = '#686de0';
        let detailType: 'DEFAULT' | 'STRIPES' | 'NEON' | 'ARMOR' | 'TUX' | 'CHICKEN' | 'SPACE' = 'DEFAULT';

        if (equippedOutfitId === 'retro_shirt') {
            primaryColor = '#f9ca24'; accentColor = '#f0932b'; detailType = 'STRIPES';
        } else if (equippedOutfitId === 'neon_outfit') {
            primaryColor = '#000000'; accentColor = '#32ff7e'; detailType = 'NEON';
        } else if (equippedOutfitId === 'pro_jersey') {
            primaryColor = '#0984e3'; accentColor = '#74b9ff'; detailType = 'STRIPES';
        } else if (equippedOutfitId === 'chicken_suit') {
            primaryColor = '#ffffff'; accentColor = '#fffa65'; detailType = 'CHICKEN';
        } else if (equippedOutfitId === 'samurai_armor') {
            primaryColor = '#d63031'; accentColor = '#2d3436'; detailType = 'ARMOR';
        } else if (equippedOutfitId === 'disco_outfit') {
            primaryColor = `hsl(${(time / 10) % 360}, 70%, 50%)`; accentColor = '#ffffff'; detailType = 'STRIPES';
        } else if (equippedOutfitId === 'space_suit') {
            primaryColor = '#dfe6e9'; accentColor = '#0984e3'; detailType = 'SPACE';
        } else if (equippedOutfitId === 'tuxedo') {
            primaryColor = '#2d3436'; accentColor = '#ffffff'; detailType = 'TUX';
        }

        // Torso Rendering
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(-22, -65, 44, 45, 10);
        ctx.fill();

        // Shading on torso
        const torsoGrad = ctx.createLinearGradient(-22, 0, 22, 0);
        torsoGrad.addColorStop(0, 'rgba(0,0,0,0.2)');
        torsoGrad.addColorStop(0.5, 'transparent');
        torsoGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
        ctx.fillStyle = torsoGrad;
        ctx.fill();

        // Specific Detail Overlays
        if (detailType === 'STRIPES') {
            ctx.fillStyle = accentColor;
            ctx.fillRect(-2, -65, 4, 45);
            ctx.fillRect(-22, -45, 44, 4);
        } else if (detailType === 'NEON') {
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = accentColor;
            ctx.strokeRect(-18, -60, 36, 35);
            ctx.shadowBlur = 0;
        } else if (detailType === 'ARMOR') {
            ctx.fillStyle = accentColor;
            ctx.fillRect(-22, -65, 44, 10); // Shoulders
            ctx.fillRect(-5, -65, 10, 45);  // Plating
        } else if (detailType === 'TUX') {
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.moveTo(0, -65); ctx.lineTo(-15, -65); ctx.lineTo(0, -35); ctx.lineTo(15, -65); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.moveTo(-3, -62); ctx.lineTo(3, -62); ctx.lineTo(0, -58); ctx.closePath(); ctx.fill(); // Bowtie
        } else if (detailType === 'CHICKEN') {
            ctx.fillStyle = '#fffa65';
            ctx.beginPath(); ctx.arc(0, -45, 25, 0, Math.PI * 2); ctx.fill(); // Round body
        }

        // Arms with complex rotation
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';

        const armAngle = isHoldingBall ? Math.PI * 0.2 : (isRolling ? Math.sin(time / 100) * 0.5 : -Math.PI * 0.4);

        ctx.save();
        ctx.translate(-22, -55);
        ctx.rotate(armAngle);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(22, -55);
        ctx.rotate(-armAngle);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.stroke();
        ctx.restore();

        // Head and Face
        ctx.fillStyle = '#ffdbac';
        ctx.beginPath();
        ctx.arc(0, -82, 18, 0, Math.PI * 2);
        ctx.fill();

        // Shading on face
        const faceGrad = ctx.createRadialGradient(-5, -87, 2, 0, -82, 18);
        faceGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
        faceGrad.addColorStop(0, 'transparent');
        ctx.fillStyle = faceGrad;
        ctx.fill();

        // Hair / Helmet
        if (detailType === 'SPACE') {
            ctx.fillStyle = 'rgba(0, 168, 255, 0.4)';
            ctx.beginPath(); ctx.arc(0, -82, 22, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        } else if (detailType === 'CHICKEN') {
            ctx.fillStyle = '#f0932b';
            ctx.beginPath(); ctx.moveTo(-5, -100); ctx.lineTo(0, -115); ctx.lineTo(5, -100); ctx.fill(); // Cockscomb
        } else {
            ctx.fillStyle = '#2d3436';
            ctx.beginPath(); ctx.arc(0, -88, 18, Math.PI, Math.PI * 2); ctx.fill();
        }

        // Eyes
        ctx.fillStyle = '#2d3436';
        const blink = Math.sin(time / 500) > 0.98 ? 0.1 : 1;
        ctx.save();
        ctx.scale(1, blink);
        ctx.beginPath();
        ctx.arc(-7, -82 / blink, 2.5, 0, Math.PI * 2);
        ctx.arc(7, -82 / blink, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    };

    const drawImpactBurst = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(Date.now() / 30);

        // Glow
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
        grad.addColorStop(0, 'rgba(255, 255, 0, 1)');
        grad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();

        // Spikes
        ctx.fillStyle = '#fff'; ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            ctx.rotate(Math.PI / 6);
            ctx.lineTo(35, 0);
            ctx.lineTo(15, 8);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
    };

    const drawNeonSign = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) => {
        ctx.save();
        ctx.font = 'bold 28px "Press Start 2P"';
        ctx.textAlign = 'center';

        // Deep Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);

        // White Core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px "Press Start 2P"';
        ctx.fillText(text, x, y);

        ctx.restore();
    };

    useEffect(() => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGrad.addColorStop(0, '#0f0c29');
        bgGrad.addColorStop(0.5, '#302b63');
        bgGrad.addColorStop(1, '#24243e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const offsetX = (canvas.width - CANVAS_WIDTH) / 2;
        const offsetY = (canvas.height - CANVAS_HEIGHT) / 2;

        ctx.save(); ctx.translate(offsetX, offsetY);

        // Atmosphere Lights
        const time = Date.now() / 2000;
        ctx.save();
        const light1 = ctx.createLinearGradient(0, 0, 400, 1200);
        light1.addColorStop(0, `hsla(${Math.sin(time) * 40 + 280}, 80%, 50%, 0.07)`);
        light1.addColorStop(1, 'transparent');
        ctx.fillStyle = light1;
        ctx.fillRect(0, 0, 400, 1200);
        ctx.restore();

        drawNeonSign(ctx, 100, 100, 'STRIKE', '#ff00ff');
        drawNeonSign(ctx, 300, 100, 'KING', '#00ffff');

        if (isZoomed) {
            const zoomCx = CANVAS_WIDTH / 2; const zoomCy = HEAD_PIN_Y; const scale = 1.8;
            ctx.translate(zoomCx, zoomCy); ctx.scale(scale, scale); ctx.translate(-zoomCx, -zoomCy);
        }

        // Pin Deck Area
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, CANVAS_WIDTH, HEAD_PIN_Y + 70);

        // Pin Machine
        const machineGrad = ctx.createLinearGradient(50, 20, 350, 20);
        machineGrad.addColorStop(0, '#2d3436');
        machineGrad.addColorStop(0.5, '#636e72');
        machineGrad.addColorStop(1, '#2d3436');
        ctx.fillStyle = machineGrad;
        ctx.beginPath(); ctx.roundRect(50, 20, 300, 45, 10); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; ctx.stroke();

        // Display Text
        ctx.fillStyle = '#00ff00'; ctx.font = '9px "Press Start 2P"';
        ctx.shadowBlur = 5; ctx.shadowColor = '#00ff00';
        ctx.fillText("BOWL-O-MATIC ULTRA", 110, 47);
        ctx.shadowBlur = 0;

        // Spectators
        spectators.forEach(spec => {
            ctx.save(); ctx.translate(spec.x, spec.y);
            let jumpY = 0;
            if (spec.state === 'CHEER') jumpY = Math.abs(Math.sin(Date.now() / 150 + spec.animOffset)) * 15;
            else if (spec.state === 'BOO') jumpY = Math.sin(Date.now() / 300 + spec.animOffset) * 3;

            ctx.translate(0, -jumpY);

            // Body
            ctx.fillStyle = spec.color;
            ctx.beginPath(); ctx.roundRect(-12, 5, 24, 20, 5); ctx.fill();

            // Head
            ctx.fillStyle = '#ffdbac';
            ctx.beginPath(); ctx.arc(0, -2, 10, 0, Math.PI * 2); ctx.fill();

            if (spec.state === 'CHEER') {
                ctx.fillStyle = '#ffdbac'; const clapPos = Math.sin(Date.now() / 50) * 8;
                ctx.beginPath(); ctx.arc(-15, 8 + clapPos, 4, 0, Math.PI * 2); ctx.arc(15, 8 + clapPos, 4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        });

        const laneX = (CANVAS_WIDTH - LANE_WIDTH) / 2;
        const rightGutterX = laneX + LANE_WIDTH;

        // Gutters with depth
        const gutGradL = ctx.createLinearGradient(laneX - GUTTER_WIDTH, 0, laneX, 0);
        gutGradL.addColorStop(0, '#000'); gutGradL.addColorStop(0.8, '#1a1a1a'); gutGradL.addColorStop(1, '#000');
        ctx.fillStyle = gutGradL; ctx.fillRect(laneX - GUTTER_WIDTH, 0, GUTTER_WIDTH, CANVAS_HEIGHT);

        const gutGradR = ctx.createLinearGradient(rightGutterX, 0, rightGutterX + GUTTER_WIDTH, 0);
        gutGradR.addColorStop(0, '#000'); gutGradR.addColorStop(0.2, '#1a1a1a'); gutGradR.addColorStop(1, '#000');
        ctx.fillStyle = gutGradR; ctx.fillRect(rightGutterX, 0, GUTTER_WIDTH, CANVAS_HEIGHT);

        // Lane - Premium Wood Texture
        const woodGrad = ctx.createLinearGradient(laneX, 0, rightGutterX, 0);
        woodGrad.addColorStop(0, '#d2a679');
        woodGrad.addColorStop(0.5, '#eec082');
        woodGrad.addColorStop(1, '#d2a679');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);

        // Grain Lines
        ctx.strokeStyle = 'rgba(80,40,0,0.08)'; ctx.lineWidth = 1;
        for (let i = 1; i < 15; i++) {
            const bx = laneX + (LANE_WIDTH / 15) * i;
            ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, CANVAS_HEIGHT); ctx.stroke();
        }

        // Lane Reflections (Glassy)
        const reflectGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        reflectGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
        reflectGrad.addColorStop(0.2, 'rgba(255,255,255,0.05)');
        reflectGrad.addColorStop(1, 'rgba(255,255,255,0.1)');
        ctx.fillStyle = reflectGrad;
        ctx.fillRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);

        // Scuffs
        ctx.save(); scuffs.forEach(s => { ctx.fillStyle = `rgba(0,0,0,${s.opacity})`; ctx.fillRect(s.x, s.y, s.w, s.h); }); ctx.restore();

        // Lane Borders
        ctx.strokeStyle = '#3d2b1f'; ctx.lineWidth = 4; ctx.strokeRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);

        drawBallReturn(ctx);

        // Aim Line
        if (showAimLine && (gameState === 'READY_TO_BOWL' || gameState === 'THROW_SEQUENCE')) {
            ctx.save();
            ctx.translate(ball.x, ball.y);
            ctx.rotate(ball.angle * (Math.PI / 180));

            // Gradient Pulse Aim Line
            const aimGrad = ctx.createLinearGradient(0, 0, 0, -600);
            aimGrad.addColorStop(0, '#ffffff');
            aimGrad.addColorStop(0.5, '#3b82f6');
            aimGrad.addColorStop(1, 'transparent');

            ctx.shadowBlur = 15;
            ctx.shadowColor = "#3b82f6";
            ctx.strokeStyle = aimGrad;
            ctx.lineWidth = 4;
            ctx.setLineDash([20, 15]);
            ctx.lineDashOffset = -Date.now() / 20;

            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -700); ctx.stroke();
            ctx.restore();
        }

        // Ball Trail
        if (trail.length > 1 && gameState === 'ROLLING') {
            ctx.save(); ctx.lineCap = 'round';
            for (let i = 0; i < trail.length - 1; i++) {
                const progress = i / trail.length;
                ctx.beginPath(); ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * progress})`; ctx.lineWidth = ball.radius * 0.9 * progress;
                ctx.moveTo(trail[i].x, trail[i].y); ctx.lineTo(trail[i + 1].x, trail[i + 1].y); ctx.stroke();
            }
            ctx.restore();
        }

        // Pins - 3D Effect
        pins.forEach(pin => {
            ctx.save(); ctx.translate(pin.x, pin.y); ctx.rotate(pin.angle);
            ctx.globalAlpha = pin.isDown ? 0.4 : 1.0;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 8, PIN_RADIUS, 6, 0, 0, Math.PI * 2); ctx.fill();

            // Body Gradient
            const pGrad = ctx.createRadialGradient(-PIN_RADIUS * 0.3, -PIN_RADIUS * 0.3, 2, 0, 0, PIN_RADIUS);
            pGrad.addColorStop(0, '#ffffff');
            pGrad.addColorStop(1, '#d1ccc0');

            ctx.beginPath(); ctx.arc(0, 0, PIN_RADIUS, 0, Math.PI * 2); ctx.fillStyle = pGrad; ctx.fill();

            // Stripe
            ctx.beginPath(); ctx.arc(0, 0, PIN_RADIUS * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = PIN_STRIPE_COLOR; ctx.fill();
            ctx.beginPath(); ctx.arc(0, 0, PIN_RADIUS * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = pGrad; ctx.fill();

            ctx.restore();
        });

        // Ball - 3D Effect
        if (!['SPLASH', 'MENU', 'PLAYER_CREATOR'].includes(gameState)) {
            if (gameState === 'READY_TO_BOWL' || gameState === 'THROW_SEQUENCE') {
                drawBowler(ctx, ball.x, ball.y + 35, true, gameState, ball.angle);
            } else if (gameState === 'ROLLING' && ball.y > BALL_START_Y - 200) {
                drawBowler(ctx, ball.x, BALL_START_Y + 35, false, gameState, ball.angle);
            }

            ctx.save();
            ctx.translate(ball.x, ball.y);

            // Shadow
            ctx.save(); ctx.translate(0, 10); ctx.scale(1, 0.5);
            ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(0, 0, ball.radius * 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            if (ballImage.complete && ballImage.naturalWidth > 0) {
                ctx.drawImage(ballImage, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
            } else {
                // High Fidelity Ball Gradient
                const bGrad = ctx.createRadialGradient(-ball.radius * 0.4, -ball.radius * 0.4, 2, 0, 0, ball.radius);
                bGrad.addColorStop(0, '#60a5fa');
                bGrad.addColorStop(0.7, '#1d4ed8');
                bGrad.addColorStop(1, '#1e3a8a');
                ctx.fillStyle = bGrad;
                ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fill();

                // Glossy Highlight
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath(); ctx.ellipse(-ball.radius * 0.3, -ball.radius * 0.3, ball.radius * 0.4, ball.radius * 0.2, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }

        // Throw Sequence Overlays
        if (gameState === 'THROW_SEQUENCE') {
            ctx.save();
            ctx.translate(ball.x, ball.y);

            // Aim Indicator
            if (throwStep === 'AIM') {
                const aimAngle = aimOscillation * Math.PI * 0.25; // Max 45 degrees
                ctx.save();
                ctx.rotate(aimAngle);

                // Glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#3b82f6';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.setLineDash([5, 5]);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -100);
                ctx.stroke();

                // Tip
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(0, -110);
                ctx.lineTo(-8, -100);
                ctx.lineTo(8, -100);
                ctx.fill();
                ctx.restore();
            }

            // Power Indicator
            if (throwStep === 'POWER') {
                const barHeight = powerOscillation * 100;
                const barWidth = 15;
                ctx.save();
                ctx.translate(40, -50);

                // Background
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.beginPath();
                ctx.roundRect(0, 0, barWidth, 100, 5);
                ctx.fill();

                // Fill
                const pGrad = ctx.createLinearGradient(0, 100, 0, 0);
                pGrad.addColorStop(0, '#22c55e');
                pGrad.addColorStop(0.5, '#eab308');
                pGrad.addColorStop(1, '#ef4444');

                ctx.fillStyle = pGrad;
                ctx.beginPath();
                ctx.roundRect(0, 100 - barHeight, barWidth, barHeight, 5);
                ctx.fill();

                // Label
                ctx.fillStyle = '#fff';
                ctx.font = '8px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText("PWR", barWidth / 2, 115);

                ctx.restore();
            }

            ctx.restore();
        }

        ctx.restore();
    }, [ball, pins, trail, particles, gameState, ballImage, spectators, laneCondition, isZoomed, scuffs, equippedOutfitId, showAimLine, aimOscillation, powerOscillation, throwStep]);

    return <canvas ref={canvasRef} />;
};

export default GameCanvas;
