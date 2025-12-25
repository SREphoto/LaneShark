/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GameContextForCommentary } from '../types';

export async function createPromptForLiveCommentary(context: GameContextForCommentary): Promise<string> {
    const {
        event,
        pinsKnocked = 0,
        frame = 1,
        totalScore = 0,
        ballSpin = 0,
        ballWeight = 1.8,
        ballMaterial = 'PLASTIC',
        laneCondition = 'NORMAL'
    } = context;

    let ballDesc = "";
    if (Math.abs(ballSpin) > 0.3) {
        ballDesc += ballSpin > 0 ? " with a massive right hook" : " with a wicked left hook";
    } else if (Math.abs(ballSpin) < 0.1) {
        ballDesc += " thrown straight as an arrow";
    }

    // Material & Lane Context
    let techDesc = "";
    if (laneCondition === 'DRY' && Math.abs(ballSpin) > 0.2) {
        techDesc += ` That ${ballMaterial} ball really bit into the dry lane.`;
    } else if (laneCondition === 'OILY' && Math.abs(ballSpin) > 0.2) {
        techDesc += ` The ${ballMaterial} ball is skidding on this oil, struggling to hook.`;
    } else {
        techDesc += ` Throwing ${ballMaterial} on a ${laneCondition} lane.`;
    }

    // Weight Context
    let weightDesc = "";
    if (ballWeight >= 2.4) {
        weightDesc = " That heavy ball absolutely crushed the pins with pure kinetic energy.";
    } else if (ballWeight <= 1.2) {
        weightDesc = " That light ball had to work hard, bouncing around the deck.";
    } else {
        weightDesc = " A balanced weight choice.";
    }

    let eventDescription = "";
    
    // Build a factual description of the event
    switch (event) {
        case "gameStart":
            eventDescription = `The game is starting. Frame 1. Ready to bowl on a ${laneCondition} lane.`;
            break;
        case "strike":
            eventDescription = `Event: STRIKE! All 10 pins smashed${ballDesc}!${techDesc}${weightDesc}`;
            break;
        case "spare":
            eventDescription = `Event: SPARE! Cleared the deck${ballDesc}.`;
            break;
        case "gutter":
            eventDescription = `Event: GUTTER BALL! The ball went into the gutter${ballDesc}. Zero pins.`;
            break;
        case "openFrame":
            eventDescription = `Event: Open frame. ${pinsKnocked} pins down total${ballDesc}.`;
            break;
        case "throwOne":
            eventDescription = `Event: First throw complete. ${pinsKnocked} pins knocked down${ballDesc}.${techDesc} ${weightDesc}`;
            break;
        case "gameOver":
            eventDescription = `Event: GAME OVER. Final Score: ${totalScore}.`;
            break;
        default:
            eventDescription = `The ball is rolling${ballDesc}.`;
            break;
    }

    let overallSituation = `Current Frame: ${frame}. Total Score: ${totalScore}.`;

    const finalPrompt = `${eventDescription} ${overallSituation}`.trim();
    
    console.log("Generated prompt for Live API:", finalPrompt);
    return finalPrompt;
}