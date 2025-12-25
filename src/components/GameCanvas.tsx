
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
    trail: {x: number, y: number, speed: number}[];
    particles: Particle[];
    gameState: GameState;
    ballImage: HTMLImageElement;
    spectators?: Spectator[];
    laneCondition?: 'NORMAL' | 'DRY' | 'OILY';
    isZoomed?: boolean;
    equippedOutfitId?: string;
    showAimLine?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    canvasRef, ball, pins, trail, particles, gameState, ballImage, spectators = [], laneCondition = 'NORMAL', isZoomed = false, equippedOutfitId, showAimLine = false
}) => {
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const scuffs = useMemo(() => {
        const items = [];
        const laneX = (CANVAS_WIDTH - LANE_WIDTH) / 2;
        for(let i=0; i<60; i++) {
            items.push({
                x: laneX + Math.random() * LANE_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                w: 5 + Math.random() * 20,
                h: 1 + Math.random() * 2,
                opacity: 0.03 + Math.random() * 0.08
            });
        }
        return items;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctxRef.current = canvas.getContext('2d');
    }, [canvasRef]);

    const drawBallReturn = (ctx: CanvasRenderingContext2D) => {
        const x = 30;
        const y = BALL_START_Y - 50;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#111';
        ctx.fillRect(-20, 0, 40, 60);
        const grad = ctx.createLinearGradient(-25, 0, 25, 0);
        grad.addColorStop(0, '#444'); grad.addColorStop(0.5, '#aaa'); grad.addColorStop(1, '#444');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(-25, -20, 50, 40, 10); ctx.fill();
        ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, -5, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(10, 20); ctx.lineTo(10, 80); ctx.moveTo(-10, 20); ctx.lineTo(-10, 80); ctx.stroke();
        ctx.restore();
    };

    const drawBowler = (ctx: CanvasRenderingContext2D, x: number, y: number, isHoldingBall: boolean, gameState: GameState, angle: number) => {
        const isRolling = gameState === 'ROLLING';
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle * (Math.PI / 180) * 0.2); 

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(0, 10, 30, 15, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#222';
        const legOffset = isRolling ? Math.sin(Date.now() / 100) * 8 : 0;
        ctx.fillRect(-12, -25, 9, 25); ctx.fillRect(4, -25 + legOffset, 9, 25);

        let shirtColor = '#444';
        if (equippedOutfitId === 'retro_shirt') shirtColor = '#f6e05e';
        else if (equippedOutfitId === 'neon_outfit') shirtColor = '#00ffff';
        else if (equippedOutfitId === 'pro_jersey') shirtColor = '#3182ce';
        else if (equippedOutfitId === 'chicken_suit') shirtColor = '#fff';

        ctx.fillStyle = shirtColor;
        ctx.beginPath(); ctx.roundRect(-20, -65, 40, 45, 6); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.stroke();

        ctx.strokeStyle = shirtColor; ctx.lineWidth = 11; ctx.lineCap = 'round';
        if (isHoldingBall) {
            ctx.beginPath(); ctx.moveTo(-20, -55); ctx.lineTo(-6, -30); ctx.moveTo(20, -55); ctx.lineTo(6, -30); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.moveTo(-20, -55); ctx.lineTo(-30, -20); ctx.moveTo(20, -55); ctx.lineTo(40, -90); ctx.stroke();
        }

        ctx.fillStyle = '#ffdbac'; ctx.beginPath(); ctx.arc(0, -78, 15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, -84, 15, Math.PI, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-5, -78, 2, 0, Math.PI * 2); ctx.arc(5, -78, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    const drawImpactBurst = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(Date.now() / 40); ctx.fillStyle = '#ffff00'; ctx.beginPath();
        for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.lineTo(25, 0); ctx.lineTo(10, 5); }
        ctx.closePath(); ctx.fill(); ctx.restore();
    };

    const drawNeonSign = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) => {
        ctx.save(); ctx.font = 'bold 24px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.shadowBlur = 15; ctx.shadowColor = color; ctx.fillStyle = color; ctx.fillText(text, x, y);
        ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.strokeText(text, x, y); ctx.restore();
    };

    useEffect(() => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.fillStyle = '#0a0a0c'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const offsetX = (canvas.width - CANVAS_WIDTH) / 2;
        const offsetY = (canvas.height - CANVAS_HEIGHT) / 2;

        ctx.save(); ctx.translate(offsetX, offsetY);
        const time = Date.now() / 1000;
        ctx.save();
        ctx.fillStyle = `hsla(${Math.sin(time) * 40 + 340}, 100%, 50%, 0.1)`;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(120, 0); ctx.lineTo(250, 1200); ctx.lineTo(0, 1200); ctx.fill();
        ctx.fillStyle = `hsla(${Math.cos(time) * 40 + 210}, 100%, 50%, 0.1)`;
        ctx.beginPath(); ctx.moveTo(400, 0); ctx.lineTo(280, 0); ctx.lineTo(150, 1200); ctx.lineTo(400, 1200); ctx.fill();
        ctx.restore();

        drawNeonSign(ctx, 100, 80, 'STRIKE', '#f06');
        drawNeonSign(ctx, 300, 80, 'KING', '#0cf');

        if (isZoomed) {
             const zoomCx = CANVAS_WIDTH / 2; const zoomCy = HEAD_PIN_Y; const scale = 2.0;
             ctx.translate(zoomCx, zoomCy); ctx.scale(scale, scale); ctx.translate(-zoomCx, -zoomCy);
        }

        ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, CANVAS_WIDTH, HEAD_PIN_Y + 50);
        ctx.fillStyle = '#111'; ctx.fillRect(50, 15, 300, 35); ctx.strokeStyle = '#444'; ctx.strokeRect(50, 15, 300, 35);
        ctx.fillStyle = '#f00'; ctx.font = '8px "Press Start 2P"'; ctx.fillText("BOWL-O-MATIC 3000", 110, 35);

        spectators.forEach(spec => {
            ctx.save(); ctx.translate(spec.x, spec.y);
            let jumpY = 0;
            if (spec.state === 'CHEER') jumpY = Math.abs(Math.sin(Date.now() / 140 + spec.animOffset)) * 12;
            else if (spec.state === 'BOO') jumpY = Math.sin(Date.now() / 280 + spec.animOffset) * 2;
            ctx.translate(0, -jumpY); ctx.fillStyle = spec.color; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-10, 10, 20, 16);
            if (spec.state === 'CHEER') {
                ctx.fillStyle = '#ffdbac'; const clapPos = Math.sin(Date.now() / 45) * 6;
                ctx.beginPath(); ctx.arc(-13, 11 + clapPos, 3, 0, Math.PI * 2); ctx.arc(13, 11 + clapPos, 3, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        });

        const laneX = (CANVAS_WIDTH - LANE_WIDTH) / 2;
        const rightGutterX = laneX + LANE_WIDTH;
        const gutGrad = ctx.createLinearGradient(laneX - GUTTER_WIDTH, 0, laneX, 0);
        gutGrad.addColorStop(0, '#000'); gutGrad.addColorStop(0.5, '#121212'); gutGrad.addColorStop(1, '#000');
        ctx.fillStyle = gutGrad; ctx.fillRect(laneX - GUTTER_WIDTH, 0, GUTTER_WIDTH, CANVAS_HEIGHT);
        const rGutGrad = ctx.createLinearGradient(rightGutterX, 0, rightGutterX + GUTTER_WIDTH, 0);
        rGutGrad.addColorStop(0, '#000'); rGutGrad.addColorStop(0.5, '#121212'); rGutGrad.addColorStop(1, '#000');
        ctx.fillStyle = rGutGrad; ctx.fillRect(rightGutterX, 0, GUTTER_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = LANE_COLOR; ctx.fillRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
        for (let i = 1; i < 10; i++) {
            const bx = laneX + (LANE_WIDTH / 10) * i;
            ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx, CANVAS_HEIGHT); ctx.stroke();
        }
        ctx.save(); scuffs.forEach(s => { ctx.fillStyle = `rgba(0,0,0,${s.opacity})`; ctx.fillRect(s.x, s.y, s.w, s.h); }); ctx.restore();
        ctx.strokeStyle = LANE_BORDER_COLOR; ctx.lineWidth = 3; ctx.strokeRect(laneX, 0, LANE_WIDTH, CANVAS_HEIGHT);
        drawBallReturn(ctx);

        // Enhanced Aim Line Visibility
        if (showAimLine && (gameState === 'READY_TO_BOWL' || gameState === 'THROW_SEQUENCE')) {
            ctx.save();
            ctx.translate(ball.x, ball.y);
            ctx.rotate(ball.angle * (Math.PI / 180));
            ctx.setLineDash([15, 10]);
            
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#3b82f6";
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 4; // Thicker line
            
            ctx.beginPath(); 
            ctx.moveTo(0, 0); 
            ctx.lineTo(0, -600); 
            ctx.stroke();
            
            // Central core line
            ctx.setLineDash([]);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        if (trail.length > 1 && gameState === 'ROLLING') {
            ctx.save(); ctx.lineCap = 'round';
            for (let i = 0; i < trail.length - 1; i++) {
                const p1 = trail[i]; const progress = i / trail.length;
                ctx.beginPath(); ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * progress})`; ctx.lineWidth = ball.radius * 0.8 * progress;
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(trail[i+1].x, trail[i+1].y); ctx.stroke();
            }
            ctx.restore();
        }

        pins.forEach(pin => {
            ctx.save(); ctx.translate(pin.x, pin.y); ctx.rotate(pin.angle); ctx.globalAlpha = pin.isDown ? 0.5 : 1.0;
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 5, PIN_RADIUS, 5, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, 0, PIN_RADIUS, 0, Math.PI * 2); ctx.fillStyle = PIN_COLOR; ctx.fill();
            ctx.beginPath(); ctx.arc(0, 0, PIN_RADIUS * 0.7, 0, Math.PI * 2); ctx.fillStyle = PIN_STRIPE_COLOR; ctx.fill();
            ctx.restore();
        });

        if (!['SPLASH', 'MENU'].includes(gameState)) {
            if (gameState === 'READY_TO_BOWL' || gameState === 'THROW_SEQUENCE') {
                drawBowler(ctx, ball.x, ball.y + 30, true, gameState, ball.angle);
            } else if (gameState === 'ROLLING' && ball.y > BALL_START_Y - 200) {
                drawBowler(ctx, ball.x, BALL_START_Y + 30, false, gameState, ball.angle);
            }
            const ballSpeedY = Math.abs(ball.dy) || (gameState === 'ROLLING' ? 18 : 0);
            const shadowBlur = ball.inGutter ? 25 : (15 + ballSpeedY * 0.2);
            ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = shadowBlur; ctx.shadowOffsetY = 8;
            ctx.translate(ball.x, ball.y);
            if (ballImage.complete && ballImage.naturalWidth > 0) {
                ctx.drawImage(ballImage, -ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
            } else {
                ctx.beginPath(); ctx.arc(0, 0, ball.radius, 0, Math.PI * 2); ctx.fillStyle = BALL_COLOR; ctx.fill();
            }
            ctx.restore();
        }

        particles.forEach(p => {
            ctx.save(); ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            if (p.life > 0.95) drawImpactBurst(ctx, p.x, p.y); ctx.restore();
        });

        ctx.restore();
    }, [ball, pins, trail, particles, gameState, ballImage, spectators, laneCondition, isZoomed, scuffs, equippedOutfitId, showAimLine]);

    return <canvas ref={canvasRef} />;
};

export default GameCanvas;
