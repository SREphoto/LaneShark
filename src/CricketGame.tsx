/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

import { useGameAssets } from './hooks/useGameAssets';
import { useGameEngine } from './hooks/useGameEngine';
import { TUTORIAL_STEPS } from './constants';
import { GameMode, CpuPersonality, PlayerProfile } from './types';
import { loadProgress, saveProgress } from './utils/storageUtils';
import { SHOP_ITEMS } from './data/shopItems';

import Scorecard from './components/Scorecard';
import GameCanvas from './components/GameCanvas';
import ImpactMessage from './components/ImpactMessage';
import MessageDisplay from './components/MessageDisplay';
import BallControls from './components/BallControls';
import Shop from './components/Shop';
import StatisticsScreen from './components/StatisticsScreen';
import TutorialOverlay from './components/TutorialOverlay';
import SplashScreen from './components/SplashScreen';
import ModeSelect from './components/ModeSelect';
import PlayerCreator from './components/PlayerCreator';
import LevelUpModal from './components/LevelUpModal';

/**
 * LaneShark Bowling - Premium Evolution
 */
function LaneSharkGame() {
    const assets = useGameAssets();

    // User Inventory State (Main Player)
    const [inventory, setInventory] = useState(loadProgress());

    // UI State
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [showBallSettings, setShowBallSettings] = useState(false);

    const game = useGameEngine({
        assets
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
            if (game.players[0] && game.players[0].id === 1) {
                game.players[0].inventory = newInv;
            }
        }
    };

    const handleEquipItem = (itemId: string) => {
        if (inventory.profile) {
            const item = SHOP_ITEMS.find(i => i.id === itemId);
            if (!item) return;

            let updatedProfile = { ...inventory.profile };

            if (item.category === 'CLOTHING') {
                updatedProfile.equippedOutfitId = updatedProfile.equippedOutfitId === itemId ? undefined : itemId;
            } else if (item.category === 'BALL') {
                updatedProfile.equippedBallId = updatedProfile.equippedBallId === itemId ? undefined : itemId;
            }

            const newInv = { ...inventory, profile: updatedProfile };
            setInventory(newInv);
            saveProgress(newInv);
            if (game.players[0] && game.players[0].id === 1) {
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
    const isThrowing = game.currentGameState === 'THROW_SEQUENCE';
    const showTutorial = game.currentGameState === 'TUTORIAL' && game.tutorialStep >= 0;

    // Global Interaction Handler for Throw Sequence
    useEffect(() => {
        const handleInteraction = (e?: KeyboardEvent) => {
            if (e && e.code !== 'Space') return;
            if (isThrowing) {
                game.nextThrowStep();
            }
        };

        window.addEventListener('keydown', handleInteraction);
        return () => window.removeEventListener('keydown', handleInteraction);
    }, [isThrowing, game.nextThrowStep]);

    return (
        <div
            className="immersive-container bg-[#0a0a0c]"
            onClick={() => {
                if (isThrowing) {
                    game.nextThrowStep();
                }
            }}
        >
            {game.currentGameState === 'SPLASH' && (
                <SplashScreen
                    onComplete={handleSplashScreenComplete}
                    playSound={() => {
                        assets.splashSoundRef.current?.play().catch(() => { });
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
                <div className="animate-fade-in h-full">
                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8 z-50">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-['Press_Start_2P'] gradient-text tracking-tighter">LANESHARK</h1>
                            <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 tracking-[0.2em] mt-1 ml-1">OFFICIAL CHAMPIONSHIP</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-['Press_Start_2P'] text-emerald-400 mb-1">${inventory.money.toLocaleString()}</span>
                                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 shadow-emerald-glow" style={{ width: '100%' }} />
                                </div>
                            </div>
                            <button
                                onClick={() => setIsShopOpen(true)}
                                className="btn-glass p-3 rounded-xl border border-white/20 hover:scale-110 transition-transform"
                                title="PRO SHOP"
                            >
                                🎳
                            </button>
                        </div>
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
                        <div className="absolute top-24 right-6 flex flex-col items-center z-50 animate-slide-in-right">
                            <div className="p-1 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-xl">
                                {inventory.profile.avatarImage ? (
                                    <img
                                        src={inventory.profile.avatarImage}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-xl border-2 border-white/50 object-cover bg-gray-900"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-xl border-2 border-white/50 bg-gray-800 flex items-center justify-center text-[8px] text-gray-500 font-['Press_Start_2P']">
                                        NO IMG
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col items-center">
                                <div className="px-4 py-1.5 glass-panel rounded-full border border-white/10 mb-2">
                                    <span className="text-[9px] font-['Press_Start_2P'] text-white">
                                        {inventory.profile.name}
                                    </span>
                                </div>
                                <div className="px-3 py-1 bg-yellow-600/40 border border-yellow-500/50 rounded-lg">
                                    <span className="text-[7px] font-['Press_Start_2P'] text-yellow-200">
                                        LEVEL {inventory.profile.level}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

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
                </div>
            )}

            {game.currentGameState !== 'SPLASH' && game.currentGameState !== 'MENU' && game.currentGameState !== 'PLAYER_CREATOR' && (
                <div className="h-full w-full relative overflow-hidden">
                    {/* Game HUD */}
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between px-6 z-50">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => game.setCurrentGameState('MENU')}
                                className="group flex items-center gap-2 px-4 py-1.5 bg-red-950/40 border border-red-500/30 rounded-lg hover:bg-red-900 transition-all"
                            >
                                <span className="text-red-500 group-hover:scale-125 transition-transform">⬅</span>
                                <span className="text-[8px] font-['Press_Start_2P'] text-red-200">EXIT</span>
                            </button>

                            <div className="flex flex-col">
                                <h1 className="text-lg font-['Press_Start_2P'] gradient-text shadow-glow-effect">LANESHARK</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="px-6 py-2 glass-panel border border-emerald-500/30">
                                <span className="text-[10px] font-['Press_Start_2P'] text-emerald-400">
                                    ${inventory.money.toLocaleString()}
                                </span>
                            </div>

                            {isBowlReady && !currentPlayer?.isCpu && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowBallSettings(!showBallSettings)}
                                        className={`px-4 py-2 border-2 rounded-lg font-['Press_Start_2P'] text-[8px] transition-all ${showBallSettings
                                            ? 'bg-yellow-600 border-white text-white shadow-gold-glow'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        SETTINGS
                                    </button>
                                    <button
                                        onClick={() => setIsShopOpen(true)}
                                        className="btn-primary px-4 py-2 rounded-lg font-['Press_Start_2P'] text-[8px] border-2 border-white/20"
                                    >
                                        SHOP
                                    </button>
                                </div>
                            )}
                        </div>
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
                        aimOscillation={game.aimOscillation}
                        powerOscillation={game.powerOscillation}
                        throwStep={game.throwStep}
                        showAimLine={game.throwStep === 'AIM' || (currentPlayer?.isCpu && isBowlReady)}
                    />

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
                        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBallSettings(false)} />
                            <div className="relative animate-scale-in">
                                <BallControls
                                    spin={game.userSpin}
                                    weight={game.userWeight}
                                    material={game.userMaterial}
                                    laneCondition={game.laneCondition}
                                    inventory={inventory}
                                    onSpinChange={game.setUserSpin}
                                    onWeightChange={game.setUserWeight}
                                    onMaterialChange={game.setUserMaterial}
                                    onLaneConditionChange={game.setLaneCondition}
                                    onClose={() => setShowBallSettings(false)}
                                />
                            </div>
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
                                openFrames: game.players[0].frames.filter(f => !f.isStrike && !f.isSpare && f.rolls.length === 2 && f.rolls[0] + f.rolls[1] < 10).length,
                                totalPins: game.players[0].rolls.reduce((a, b) => a + b, 0),
                                accuracy: (game.players[0].rolls.filter(r => r > 0).length / Math.max(1, game.players[0].rolls.length)) * 100
                            }}
                            profile={game.players[0].profile}
                            onClose={() => game.setCurrentGameState('MENU')}
                        />
                    )}

                    <div className="absolute top-28 left-6 w-72 flex flex-col z-40 pointer-events-none space-y-4">
                        <div className="pointer-events-auto">
                            <MessageDisplay message={game.message} />
                        </div>

                        {currentPlayer?.isCpu && (
                            <div className="pointer-events-auto glass-panel p-4 border-red-500/40 animate-pulse bg-red-950/20">
                                <div className="text-red-400 font-['Press_Start_2P'] text-[8px] mb-2 uppercase">CPU TURN: {currentPlayer.name}</div>
                                <div className="text-gray-400 font-['Press_Start_2P'] text-[6px] leading-relaxed italic">"{currentPlayer.cpuProfile?.description}"</div>
                            </div>
                        )}

                        {isBowlReady && !currentPlayer?.isCpu && (
                            <div className="pointer-events-auto glass-panel p-3 border-yellow-500/20 animate-fade-in group hover:scale-105 transition-all cursor-pointer" onClick={() => game.startThrowSequence()}>
                                <div className="text-yellow-500 font-['Press_Start_2P'] text-[7px] tracking-widest text-center">
                                    CLICK TO BOWL
                                </div>
                            </div>
                        )}

                        {isThrowing && (
                            <div className="pointer-events-none glass-panel p-3 border-blue-500/40 animate-pulse bg-blue-950/20">
                                <div className="text-blue-400 font-['Press_Start_2P'] text-[7px] tracking-widest text-center">
                                    SPACE / CLICK TO LOCK
                                </div>
                            </div>
                        )}
                    </div>

                    {currentPlayer && (
                        <Scorecard frames={currentPlayer.frames} />
                    )}

                    <ImpactMessage message={game.impactEffectText} isVisible={game.showImpactEffect} />
                </div>
            )}
        </div>
    );
}

const LaneSharkGameRoot = () => <LaneSharkGame />;
export default LaneSharkGameRoot;
