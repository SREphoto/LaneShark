/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { GameState } from '../types';

interface CharacterPreviewProps {
    equippedOutfitId?: string;
    width?: number;
    height?: number;
    scale?: number;
}

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
    equippedOutfitId,
    width = 200,
    height = 300,
    scale = 2.5
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const time = Date.now();

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height * 0.7);
            ctx.scale(scale, scale);

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(0, 10, 25, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Character drawing logic (mirrored from GameCanvas)
            const animY = Math.abs(Math.sin(Date.now() / 300)) * 3;
            ctx.translate(0, -animY);

            // Legs
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath(); ctx.roundRect(-15, -20, 10, 20, 4); ctx.fill();
            ctx.beginPath(); ctx.roundRect(5, -20, 10, 20, 4); ctx.fill();

            // Outfit
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
                primaryColor = `hsl(${(Date.now() / 10) % 360}, 70%, 50%)`; accentColor = '#ffffff'; detailType = 'STRIPES';
            } else if (equippedOutfitId === 'space_suit') {
                primaryColor = '#dfe6e9'; accentColor = '#0984e3'; detailType = 'SPACE';
            } else if (equippedOutfitId === 'tuxedo') {
                primaryColor = '#2d3436'; accentColor = '#ffffff'; detailType = 'TUX';
            }

            // Torso
            ctx.fillStyle = primaryColor;
            ctx.beginPath(); ctx.roundRect(-22, -65, 44, 45, 10); ctx.fill();

            // Details
            if (detailType === 'STRIPES') {
                ctx.fillStyle = accentColor;
                ctx.fillRect(-2, -65, 4, 45);
            } else if (detailType === 'NEON') {
                ctx.strokeStyle = accentColor; ctx.lineWidth = 2; ctx.strokeRect(-18, -60, 36, 35);
            } else if (detailType === 'ARMOR') {
                ctx.fillStyle = accentColor; ctx.fillRect(-22, -65, 44, 10); ctx.fillRect(-5, -65, 10, 45);
            } else if (detailType === 'TUX') {
                ctx.fillStyle = accentColor;
                ctx.beginPath(); ctx.moveTo(0, -65); ctx.lineTo(-15, -65); ctx.lineTo(0, -42); ctx.lineTo(15, -65); ctx.closePath(); ctx.fill();
            }

            // Arms
            ctx.strokeStyle = primaryColor; ctx.lineWidth = 12; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(-24, -55); ctx.lineTo(-35, -30); ctx.moveTo(24, -55); ctx.lineTo(35, -30); ctx.stroke();

            // Head
            ctx.fillStyle = '#ffdbac';
            ctx.beginPath(); ctx.arc(0, -82, 18, 0, Math.PI * 2); ctx.fill();

            // Eyes
            ctx.fillStyle = '#2d3436';
            ctx.beginPath(); ctx.arc(-7, -82, 2.5, 0, Math.PI * 2); ctx.arc(7, -82, 2.5, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
            requestAnimationFrame(draw);
        };

        const animId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animId);
    }, [equippedOutfitId, scale]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="drop-shadow-2xl"
        />
    );
};

export default CharacterPreview;
