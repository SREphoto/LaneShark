/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ScoreboardProps {
    score: number;
    frame: number;
    throwInFrame: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score, frame, throwInFrame }) => {
    return (
        <div className="scoreboard">
            <div className="score-item">
                <span className="score-label">FRAME</span>
                <span className="score-value">{frame}/10</span>
            </div>
             <div className="score-item">
                <span className="score-label">THROW</span>
                <span className="score-value">{throwInFrame}</span>
            </div>
            <div className="score-item">
                <span className="score-label">SCORE</span>
                <span className="score-value">{score}</span>
            </div>
        </div>
    );
};

export default Scoreboard;