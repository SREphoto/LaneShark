/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { CANVAS_WIDTH, LANE_WIDTH, LANE_LEFT_EDGE } from '../constants';

interface MobileControlsProps {
    onMove: (dir: 'LEFT' | 'RIGHT') => void;
    onRoll: (power: number, accuracy: number) => void;
    setBallPosition: (x: number) => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onMove, onRoll, setBallPosition }) => {
    const [phase, setPhase] = useState(0); 
    const [powerVal, setPowerVal] = useState(0);
    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    
    const animateMeter = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;
        if (phase === 1) {
            const cycle = 1200; // Slightly faster cycle for more urgency
            const progress = (elapsed % cycle) / cycle; 
            const val = progress < 0.5 ? progress * 2 : 2 - (progress * 2);
            setPowerVal(val * 100);
            requestRef.current = requestAnimationFrame(animateMeter);
        }
    };

    useEffect(() => {
        if (phase === 1) {
            startTimeRef.current = 0;
            requestRef.current = requestAnimationFrame(animateMeter);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [phase]);

    const handleAction = () => {
        if (phase === 0) {
            setPhase(1);
        } else if (phase === 1) {
            setPhase(2);
            cancelAnimationFrame(requestRef.current);
            onRoll(powerVal / 100, 0);
            setTimeout(() => {
                setPhase(0);
                setPowerVal(0);
            }, 1000);
        }
    };

    return (
        <div className="mobile-controls-container">
            <div className="position-slider-container">
                <div className="position-slider-label font-['Press_Start_2P'] text-[8px]">DRAG TO POSITION</div>
                <input 
                    type="range" min="0" max="100" defaultValue="50"
                    onChange={(e) => setBallPosition(LANE_LEFT_EDGE + (LANE_WIDTH * (parseFloat(e.target.value) / 100)))}
                    className="position-slider"
                />
            </div>

            {phase > 0 && (
                <div className="meter-container animate-pulse">
                    <div className="meter-bar" style={{ 
                        width: `${powerVal}%`,
                        background: `linear-gradient(90deg, #3182ce 0%, #38a169 50%, #e53e3e 100%)` 
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-[10px] font-['Press_Start_2P'] text-shadow">POWER: {Math.floor(powerVal)}%</span>
                    </div>
                </div>
            )}

            <button className={`mobile-action-btn ${phase === 1 ? 'bg-yellow-500 animate-pulse' : ''}`} onClick={handleAction}>
                {phase === 0 ? "START ROLL" : phase === 1 ? "RELEASE!" : "ROLLING"}
            </button>
        </div>
    );
};

export default MobileControls;
