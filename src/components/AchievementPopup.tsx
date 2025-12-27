/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Achievement, TIER_COLORS } from '../data/progression';

interface AchievementPopupProps {
    achievement: Achievement | null;
    onDismiss: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onDismiss, 500);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onDismiss]);

    if (!achievement) return null;

    const tierStyle = TIER_COLORS[achievement.tier];

    return (
        <div className={`fixed top-8 right-8 z-[90] transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div
                className="relative p-6 rounded-2xl border-2 backdrop-blur-xl shadow-2xl min-w-[320px]"
                style={{
                    backgroundColor: `${tierStyle.bg}ee`,
                    borderColor: tierStyle.border,
                    boxShadow: `0 0 40px ${tierStyle.glow}, inset 0 0 20px ${tierStyle.glow}`
                }}
            >
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                </div>

                {/* Achievement Badge */}
                <div className="flex items-start gap-4 relative">
                    <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl border-2 shadow-lg"
                        style={{
                            backgroundColor: `${tierStyle.bg}`,
                            borderColor: tierStyle.border,
                            boxShadow: `0 0 15px ${tierStyle.glow}`
                        }}
                    >
                        {achievement.icon}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="text-[8px] font-['Press_Start_2P'] uppercase tracking-widest px-2 py-0.5 rounded"
                                style={{
                                    backgroundColor: tierStyle.border,
                                    color: tierStyle.bg
                                }}
                            >
                                {achievement.tier}
                            </span>
                            <span className="text-[8px] font-['Press_Start_2P'] text-white/60">UNLOCKED!</span>
                        </div>

                        <h3
                            className="text-sm font-['Press_Start_2P'] mb-1"
                            style={{ color: tierStyle.text }}
                        >
                            {achievement.name}
                        </h3>

                        <p className="text-[8px] font-['Press_Start_2P'] text-white/70 mb-3">
                            {achievement.description}
                        </p>

                        {/* Rewards */}
                        <div className="flex gap-3">
                            <div className="px-2 py-1 bg-yellow-600/40 rounded border border-yellow-500/30">
                                <span className="text-[8px] font-['Press_Start_2P'] text-yellow-300">
                                    +{achievement.xpReward} XP
                                </span>
                            </div>
                            <div className="px-2 py-1 bg-emerald-600/40 rounded border border-emerald-500/30">
                                <span className="text-[8px] font-['Press_Start_2P'] text-emerald-300">
                                    +${achievement.moneyReward}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Close hint */}
                <div className="absolute bottom-2 right-4 text-[6px] font-['Press_Start_2P'] text-white/30">
                    AUTO-DISMISS
                </div>
            </div>
        </div>
    );
};

export default AchievementPopup;
