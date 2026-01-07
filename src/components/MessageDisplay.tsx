/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MessageDisplayProps {
    message: string;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
    return (
    return (
        <div
            className="px-4 py-2 glass-panel border-white/10 shadow-lg animate-fade-in"
            aria-live="polite"
        >
            <div className="text-[8px] text-yellow-500 font-['Press_Start_2P'] uppercase tracking-[0.2em] mb-1 opacity-60">Status</div>
            <div className="text-sm font-['Press_Start_2P'] gradient-text-silver">
                {message}
            </div>
        </div>
    );
    );
};

export default MessageDisplay;
