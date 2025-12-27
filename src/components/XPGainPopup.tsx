/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface XPGainPopupProps {
    xpGained: number;
    moneyGained: number;
    streakName?: string;
    streakMultiplier?: number;
    streakColor?: string;
    isVisible: boolean;
}

const XPGainPopup: React.FC<XPGainPopupProps> = ({
    xpGained,
    moneyGained,
    streakName,
    streakMultiplier,
    streakColor,
    isVisible
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible && (xpGained > 0 || moneyGained > 0)) {
            setShow(true);
            const timer = setTimeout(() => setShow(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [isVisible, xpGained, moneyGained]);

    if (!show) return null;

    return (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] pointer-events-none flex flex-col items-center gap-3 animate-slide-up">
            {/* Streak Indicator */}
            {streakName && (
                <div
                    className="px-6 py-3 rounded-xl border-2 animate-pulse shadow-2xl"
                    style={{
                        backgroundColor: `${streakColor}30`,
                        borderColor: streakColor,
                        boxShadow: `0 0 30px ${streakColor}`
                    }}
                >
                    <span
                        className="text-xl font-['Press_Start_2P'] font-bold"
                        style={{ color: streakColor }}
                    >
                        🔥 {streakName} 🔥
                    </span>
                    {streakMultiplier && streakMultiplier > 1 && (
                        <span className="block text-center text-[10px] font-['Press_Start_2P'] text-white/80 mt-1">
                            {streakMultiplier}x XP BONUS!
                        </span>
                    )}
                </div>
            )}

            {/* XP Gain */}
            <div className="flex items-center gap-4">
                {xpGained > 0 && (
                    <div className="px-4 py-2 bg-yellow-600/80 backdrop-blur-md rounded-lg border border-yellow-400/50 shadow-lg shadow-yellow-500/30 animate-bounce">
                        <span className="text-lg font-['Press_Start_2P'] text-yellow-100">
                            +{xpGained} XP
                        </span>
                    </div>
                )}

                {moneyGained > 0 && (
                    <div className="px-4 py-2 bg-emerald-600/80 backdrop-blur-md rounded-lg border border-emerald-400/50 shadow-lg shadow-emerald-500/30 animate-bounce" style={{ animationDelay: '0.1s' }}>
                        <span className="text-lg font-['Press_Start_2P'] text-emerald-100">
                            +${moneyGained}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default XPGainPopup;
