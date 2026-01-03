/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const NEWS_ITEMS = [
    "🏆 CHAMPIONSHIP SEASON 2026 NOW LIVE!",
    "🔥 NEW RESIN BALLS AVAILABLE IN PRO SHOP",
    "👟 UPGRADE YOUR GEAR FOR MAXIMUM SPIN",
    "🦈 BEWARE THE LANE SHARK: KINGPIN CHALLENGE AWAITS",
    "📡 LIVE UPDATES FROM THE NATIONAL BOWLING CIRCUIT",
];

const NewsTicker: React.FC = () => {
    return (
        <div className="news-ticker-container">
            <div className="news-ticker-label">NEWS</div>
            <div className="news-ticker-scroll">
                <div className="news-ticker-content">
                    {NEWS_ITEMS.map((item, i) => (
                        <span key={i} className="news-item">{item}</span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {NEWS_ITEMS.map((item, i) => (
                        <span key={`loop-${i}`} className="news-item">{item}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
