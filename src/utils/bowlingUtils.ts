/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { BowlingFrame } from '../types';

/**
 * Calculates standard bowling scores from a flat array of rolls.
 * Returns an array of 10 Frames with display info.
 */
export function calculateBowlingScore(rolls: number[]): BowlingFrame[] {
    const frames: BowlingFrame[] = [];
    let rollIndex = 0;
    let runningScore = 0;

    for (let f = 1; f <= 10; f++) {
        const frame: BowlingFrame = {
            frameNumber: f,
            rolls: [],
            score: null,
            isStrike: false,
            isSpare: false,
            cumulativeScore: null
        };

        if (rollIndex >= rolls.length) {
            frames.push(frame);
            continue;
        }

        // Logic for Frames 1-9
        if (f < 10) {
            const r1 = rolls[rollIndex];
            frame.rolls.push(r1);

            if (r1 === 10) {
                // Strike
                frame.isStrike = true;
                // Lookahead for score (Strike is 10 + next 2 rolls)
                if (rollIndex + 2 < rolls.length) {
                    const bonus1 = rolls[rollIndex + 1];
                    const bonus2 = rolls[rollIndex + 2];
                    const frameScore = 10 + bonus1 + bonus2;
                    runningScore += frameScore;
                    frame.score = frameScore;
                    frame.cumulativeScore = runningScore;
                }
                rollIndex++; // Advance 1 roll for strike
            } else {
                // Not a strike
                if (rollIndex + 1 < rolls.length) {
                    const r2 = rolls[rollIndex + 1];
                    frame.rolls.push(r2);
                    
                    if (r1 + r2 === 10) {
                        // Spare
                        frame.isSpare = true;
                        // Lookahead (Spare is 10 + next 1 roll)
                        if (rollIndex + 2 < rolls.length) {
                            const bonus = rolls[rollIndex + 2];
                            const frameScore = 10 + bonus;
                            runningScore += frameScore;
                            frame.score = frameScore;
                            frame.cumulativeScore = runningScore;
                        }
                    } else {
                        // Open Frame
                        const frameScore = r1 + r2;
                        runningScore += frameScore;
                        frame.score = frameScore;
                        frame.cumulativeScore = runningScore;
                    }
                    rollIndex += 2;
                } else {
                    // Frame incomplete (only 1 roll made so far)
                    rollIndex++; // Wait for next roll
                }
            }
        } 
        // Logic for Frame 10
        else {
            const r1 = rolls[rollIndex];
            frame.rolls.push(r1);
            
            // Check roll 2
            if (rollIndex + 1 < rolls.length) {
                const r2 = rolls[rollIndex + 1];
                frame.rolls.push(r2);

                // If Strike or Spare, check roll 3
                if (r1 === 10 || r1 + r2 === 10) {
                    if (rollIndex + 2 < rolls.length) {
                        const r3 = rolls[rollIndex + 2];
                        frame.rolls.push(r3);
                        
                        const frameScore = r1 + r2 + r3;
                        runningScore += frameScore;
                        frame.score = frameScore;
                        frame.cumulativeScore = runningScore;
                        rollIndex += 3;
                    }
                } else {
                    // Open frame in 10th
                    const frameScore = r1 + r2;
                    runningScore += frameScore;
                    frame.score = frameScore;
                    frame.cumulativeScore = runningScore;
                    rollIndex += 2;
                }
            }
        }

        frames.push(frame);
    }

    return frames;
}

export function isGameOver(frames: BowlingFrame[]): boolean {
    const f10 = frames[9];
    return f10 && f10.cumulativeScore !== null;
}
