
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';

import { useGameAssets } from './hooks/useGameAssets';
import { useLiveCommentary } from './hooks/useLiveCommentary';
import { useGameEngine } from './hooks/useGameEngine';
import { PERSONAS } from './utils/personas';
import { TUTORIAL_STEPS, LANE_PROPS } from './constants';
import { GameMode, CpuPersonality, PlayerProfile } from './types';
import { loadProgress, saveProgress } from './utils/storageUtils';

import Scorecard from './components/Scorecard';
import GameCanvas from './components/GameCanvas';
import ImpactMessage from './components/ImpactMessage';
import MobileControls from './components/MobileControls';
import MessageDisplay from './components/MessageDisplay';
import VoiceSelector from './components/VoiceSelector';
import BallControls from './components/BallControls';
import ThrowSequence from './components/ThrowSequence';
import Shop from './components/Shop';
import StatisticsScreen from './components/StatisticsScreen';
import TutorialOverlay from './components/TutorialOverlay';
import SplashScreen from './components/SplashScreen';
import ModeSelect from './components/ModeSelect';
import PlayerCreator from './components/PlayerCreator';
import LevelUpModal from './components/LevelUpModal';

/**
 * Strike King Bowling Game
 */
function StrikeKingGame() {
    const assets = useGameAssets();
    const commentary = useLiveCommentary();
    
    // User Inventory State (Main Player)
    const [inventory, setInventory] = useState(loadProgress());
    
    // UI State
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [showBallSettings, setShowBallSettings] = useState(false);
    
    // Voice Selection
    const [selectedPersonaId, setSelectedPersonaId] = useState(PERSONAS[0].id);
    const selectedPersona = PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];

    const game = useGameEngine({ 
        assets, 
        commentary, 
        selectedPersona
    });
    
    const currentPlayer = game.players[game.currentPlayerIdx];

    // Persist inventory when it changes
    const handleBuyItem = (itemId: string, cost: number) => {
        if (inventory.money >= cost && !inventory.items.includes(itemId)) {
            const newInv = {
                ...inventory,
                money: inventory.money - cost,
                items: [...inventory.items, itemId]
            };
            setInventory(newInv);
            saveProgress(newInv);
            if(game.players[0] && game.players[0].id === 1) {
                game.players[0].inventory = newInv; 
            }
        }
    };

    const handleEquipItem = (itemId: string) => {
        if (inventory.profile) {
            const updatedProfile = { ...inventory.profile, equippedOutfitId: itemId };
            const newInv = { ...inventory, profile: updatedProfile };
            setInventory(newInv);
            saveProgress(newInv);
            if(game.players[0] && game.players[0].id === 1) {
                game.updateProfile(updatedProfile);
            }
        }
    };
    
    useEffect(() => {
        if (game.players.length > 0 && game.players[0].id === 1) {
             const engineInv = game.players[0].inventory;
             if (engineInv.money !== inventory.money || engineInv.profile?.xp !== inventory.profile?.xp) {
                 setInventory(engineInv);
                 saveProgress(engineInv);
             }
        }
    }, [game.players, inventory.money, inventory.profile?.xp]);

    const handleSplashScreenComplete = () => {
        if (inventory.profile) {
            game.setCurrentGameState('MENU');
        } else {
            game.setCurrentGameState('PLAYER_CREATOR');
        }
    };

    const handlePlayerCreated = (profile: PlayerProfile) => {
        game.updateProfile(profile);
        setInventory(loadProgress());
        game.setCurrentGameState('MENU');
    };
    
    const handleLevelUpSave = (updatedProfile: PlayerProfile) => {
        game.updateProfile(updatedProfile);
        game.setShowLevelUp(false);
        setInventory(loadProgress());
    };

    const handleModeSelect = (mode: GameMode, cpu?: CpuPersonality) => {
        game.startGame(mode, cpu);
    };

    const isBowlReady = game.currentGameState === 'READY_TO_BOWL';
    const showTutorial = game.currentGameState === 'TUTORIAL' && game.tutorialStep >= 0;

    return (
        <div className="immersive-container">
            {game.currentGameState === 'SPLASH' && (
                <SplashScreen 
                    onComplete={handleSplashScreenComplete} 
                    playSound={() => {
                        assets.splashSoundRef.current?.play().catch(() => {});
                    }}
                />
            )}
            
            {game.currentGameState === 'PLAYER_CREATOR' && (
                <PlayerCreator onComplete={handlePlayerCreated} />
            )}

            {game.showLevelUp && inventory.profile && (
                <LevelUpModal profile={inventory.profile} onSave={handleLevelUpSave} />
            )}

            {game.currentGameState === 'MENU' && (
                <>
                    <div className="absolute top-0 left-0 w-full h-14 bg-black border-b border-gray-700 flex items-center justify-between px-4 z-50">
                        <h1 className="text-yellow-400 font-['Press_Start_2P'] text-sm tracking-tighter">STRIKE KING!</h1>
                    </div>

                    <GameCanvas
                         canvasRef={game.canvasRef}
                         ball={game.ball}
                         pins={game.pins}
                         trail={game.trail}
                         particles={game.particles}
                         gameState={game.currentGameState}
                         ballImage={assets.ballImageRef.current}
                         spectators={game.spectators}
                         laneCondition={game.laneCondition}
                         equippedOutfitId={inventory.profile?.equippedOutfitId}
                    />
                    
                    {inventory.profile && (
                         <div className="absolute top-20 right-4 flex flex-col items-center z-50">
                             {inventory.profile.avatarImage ? (
                                 <img 
                                    src={inventory.profile.avatarImage} 
                                    alt="Player Avatar" 
                                    className="w-20 h-20 border-4 border-white shadow-lg bg-gray-900 object-cover"
                                 />
                             ) : (
                                 <div className="w-20 h-20 border-4 border-white bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                                     NO IMG
                                 </div>
                             )}
                             <div className="bg-black border-2 border-white px-2 mt-1 text-white font-['Press_Start_2P'] text-[10px]">
                                 {inventory.profile.name}
                             </div>
                             <div className="bg-yellow-600 border border-white px-2 mt-1 text-white font-['Press_Start_2P'] text-[8px]">
                                 LVL {inventory.profile.level}
                             </div>
                             <button 
                                onClick={() => setIsShopOpen(true)}
                                className="mt-2 bg-blue-600 border-2 border-white text-white px-2 py-1 font-['Press_Start_2P'] text-[8px] hover:bg-blue-500"
                             >
                                PRO SHOP
                             </button>
                         </div>
                    )}

                    <div className="absolute top-20 left-0 w-full flex justify-center z-40 pointer-events-none">
                        <div className="pointer-events-auto">
                            <VoiceSelector 
                                selectedPersonaId={selectedPersonaId}
                                onSelect={setSelectedPersonaId}
                            />
                        </div>
                    </div>

                    <ModeSelect onSelectMode={handleModeSelect} />
                    
                    {isShopOpen && (
                        <Shop 
                            inventory={inventory}
                            onBuy={handleBuyItem}
                            onEquip={handleEquipItem}
                            onCheatMoney={game.cheatMoney}
                            onClose={() => setIsShopOpen(false)}
                        />
                    )}
                </>
            )}

            {game.currentGameState !== 'SPLASH' && game.currentGameState !== 'MENU' && game.currentGameState !== 'PLAYER_CREATOR' && (
                <>
                    <div className="absolute top-0 left-0 w-full h-12 bg-gray-900/95 border-b-2 border-yellow-600 flex items-center justify-between px-3 z-50 shadow-lg">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => game.setCurrentGameState('MENU')}
                                className="px-2 py-1 bg-red-600 border border-white text-white font-['Press_Start_2P'] text-[7px] hover:bg-red-500"
                            >
                                QUIT
                            </button>
                            <h1 className="text-yellow-500 font-['Press_Start_2P'] text-[10px] md:text-xs tracking-wider">STRIKE KING</h1>
                            <div className="text-green-400 font-['Press_Start_2P'] text-[10px] border border-green-800 bg-black px-2 py-1">
                                ${inventory.money}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                             <div className="flex items-center mr-2 opacity-70">
                                <div className={`w-2 h-2 rounded-full ${commentary.commentaryStatus.includes('Ready') ? 'bg-green-500 animate-pulse' : 'bg-red-500'} mr-1`}></div>
                            </div>
                            {isBowlReady && !currentPlayer?.isCpu && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setShowBallSettings(!showBallSettings)}
                                        className={`px-3 py-1 border-2 font-['Press_Start_2P'] text-[8px] ${showBallSettings ? 'bg-yellow-600 border-white text-white shadow-sm' : 'bg-gray-800 border-gray-600 text-gray-300'}`}
                                    >
                                        SETUP
                                    </button>
                                    <button 
                                        onClick={() => setIsShopOpen(true)}
                                        className="px-3 py-1 bg-blue-700 border-2 border-white text-white font-['Press_Start_2P'] text-[8px] hover:bg-blue-600"
                                    >
                                        SHOP
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {isShopOpen && (
                        <Shop 
                            inventory={inventory}
                            onBuy={handleBuyItem}
                            onEquip={handleEquipItem}
                            onCheatMoney={game.cheatMoney}
                            onClose={() => setIsShopOpen(false)}
                        />
                    )}

                    {showBallSettings && (
                        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-[60]">
                            <BallControls 
                                spin={game.userSpin}
                                weight={game.userWeight}
                                material={game.userMaterial}
                                laneCondition={game.laneCondition}
                                inventory={inventory}
                                volume={game.commentaryVolume}
                                onSpinChange={game.setUserSpin}
                                onWeightChange={game.setUserWeight}
                                onMaterialChange={game.setUserMaterial}
                                onLaneConditionChange={game.setLaneCondition}
                                onVolumeChange={game.setCommentaryVolume}
                                onClose={() => setShowBallSettings(false)}
                            />
                        </div>
                    )}

                    {showTutorial && (
                        <TutorialOverlay 
                            step={game.tutorialStep}
                            onNext={() => {
                                if (game.tutorialStep < TUTORIAL_STEPS.length - 1) {
                                    game.advanceTutorial();
                                } else {
                                    game.endTutorial();
                                }
                            }}
                            onSkip={game.endTutorial}
                        />
                    )}

                    {game.currentGameState === 'GAME_OVER' && !game.showLevelUp && (
                         <StatisticsScreen 
                            stats={{
                                totalScore: game.players[0].score,
                                strikes: game.players[0].frames.filter(f => f.isStrike).length,
                                spares: game.players[0].frames.filter(f => f.isSpare).length,
                                gutters: game.players[0].rolls.filter(r => r === 0).length,
                                openFrames: game.players[0].frames.filter(f => !f.isStrike && !f.isSpare && f.rolls.length === 2 && f.rolls[0]+f.rolls[1] < 10).length,
                                totalPins: game.players[0].rolls.reduce((a, b) => a + b, 0),
                                accuracy: (game.players[0].rolls.filter(r => r > 0).length / Math.max(1, game.players[0].rolls.length)) * 100
                            }}
                            profile={game.players[0].profile}
                            onClose={() => game.setCurrentGameState('MENU')}
                         />
                    )}

                    {isBowlReady && !currentPlayer?.isCpu && game.throwStep && (
                         <ThrowSequence 
                            step={game.throwStep}
                            onNext={game.nextStep}
                            userWeight={game.userWeight}
                            userSpin={game.userSpin}
                            inventory={inventory}
                            onWeightChange={game.setUserWeight}
                            onSpinChange={game.setUserSpin}
                            onPositionMove={game.setBallPosition}
                            onAimMove={game.setBallAngle}
                            ballX={game.ball.x}
                            ballAngle={game.ball.angle}
                         />
                    )}

                    <div className="game-message-container" style={{ top: '60px' }}>
                        <MessageDisplay
                            message={game.message}
                            commentaryStatus={commentary.commentaryStatus} 
                        />
                        {currentPlayer?.isCpu && (
                            <div className="mt-2 p-2 bg-red-900 border-2 border-red-500 animate-pulse">
                                <div className="text-red-100 font-['Press_Start_2P'] text-[9px] mb-1">CPU TURN: {currentPlayer.name}</div>
                                <div className="text-red-400 font-['Press_Start_2P'] text-[7px]">{currentPlayer.cpuProfile?.description}</div>
                            </div>
                        )}
                        {isBowlReady && !currentPlayer?.isCpu && (
                            <div className="mt-2 text-yellow-400 font-['Press_Start_2P'] text-[8px] bg-black/50 p-2 shadow-sm border border-yellow-900/30">
                                COMPLETE ALL 6 STEPS TO BOWL!
                            </div>
                        )}
                    </div>

                    <GameCanvas
                        canvasRef={game.canvasRef}
                        ball={game.ball}
                        pins={game.pins}
                        trail={game.trail}
                        particles={game.particles}
                        gameState={game.currentGameState}
                        ballImage={assets.ballImageRef.current}
                        spectators={game.spectators}
                        laneCondition={game.laneCondition}
                        isZoomed={game.isZoomed}
                        equippedOutfitId={inventory.profile?.equippedOutfitId}
                        showAimLine={game.throwStep === 'AIM' || (currentPlayer?.isCpu && isBowlReady)}
                    />
                    
                    {currentPlayer && (
                        <Scorecard frames={currentPlayer.frames} />
                    )}

                    <ImpactMessage text={game.impactEffectText} visible={game.showImpactEffect} />
                </>
            )}
        </div>
    );
}

export default StrikeKingGame;
