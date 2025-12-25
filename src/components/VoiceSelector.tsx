
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { VoicePersona } from '../types';
import { PERSONAS } from '../utils/personas';

interface VoiceSelectorProps {
    selectedPersonaId: string;
    onSelect: (personaId: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedPersonaId, onSelect }) => {
    return (
        <div className="voice-selector mb-4 w-full max-w-lg">
            <h3 className="text-yellow-400 text-xs uppercase tracking-widest mb-2 text-center text-shadow-sm font-['Press_Start_2P']">Select Announcer</h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {PERSONAS.map(persona => (
                    <button
                        key={persona.id}
                        onClick={() => onSelect(persona.id)}
                        className={`
                            px-2 py-2 text-left border-2 transition-all duration-200 font-['Press_Start_2P']
                            ${selectedPersonaId === persona.id 
                                ? 'bg-red-500 border-white text-white shadow-[2px_2px_0px_#000]' 
                                : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'}
                        `}
                    >
                        <div className="text-[9px] font-bold">{persona.name}</div>
                        <div className="text-[7px] opacity-70 mt-1 line-clamp-1">{persona.description}</div>
                    </button>
                ))}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a202c; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f56565; }
            `}</style>
        </div>
    );
};

export default VoiceSelector;
