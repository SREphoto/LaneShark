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
        <div
            className="px-6 py-4 glass-panel border-white/10 shadow-2xl animate-fade-in"
            aria-live="polite"
        >
            <div className="text-[10px] text-yellow-500 font-['Press_Start_2P'] uppercase tracking-[0.2em] mb-2 opacity-60">Status</div>
            <div className="text-xl font-['Press_Start_2P'] gradient-text-silver">
                {message}
            </div>
        </div>
    );
};

export default MessageDisplay;
