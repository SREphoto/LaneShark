/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ImpactMessageProps {
  message: string;
  isVisible: boolean;
}

const ImpactMessage: React.FC<ImpactMessageProps> = ({ message, isVisible }) => {
  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="flex flex-col items-center animate-bounce">
      <div className="relative border-4 border-white bg-black p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
        <h1 className="text-8xl md:text-9xl font-['Press_Start_2P'] text-yellow-500 tracking-tighter">
          STRIKE!
        </h1>
      </div>
      <div className="flex gap-4 mt-8">
        <span className="text-5xl">⚡</span>
        <span className="text-6xl">🎳</span>
        <span className="text-5xl">⚡</span>
      </div>
    </div>
  );
};

export default ImpactMessage;
