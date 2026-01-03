/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';

import { useGameAssets } from './hooks/useGameAssets';
import { useGameEngine } from './hooks/useGameEngine';
import { TUTORIAL_STEPS } from './constants';
import { GameMode, CpuPersonality, PlayerProfile, BallMaterial } from './types';
import { loadProgress, saveProgress } from './utils/storageUtils';
import { SHOP_ITEMS } from './data/shopItems';

import NewsTicker from './components/NewsTicker';
import Scoreboard from './components/Scoreboard';
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
import ProgressionPanel from './components/ProgressionPanel';
import CelebrationOverlay from './components/CelebrationOverlay';
import CyberButton from './components/CyberButton';



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
    const [showScorecard, setShowScorecard] = useState(false);
    const [showProgressionPanel, setShowProgressionPanel] = useState(false);


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
        // 1. Update Game Engine State
        game.updateProfile(updatedProfile);
        game.setShowLevelUp(false);

        // 2. Update Local Inventory State immediately (don't wait for engine sync)
        const newInv = { ...inventory, profile: updatedProfile };
        setInventory(newInv);

        // 3. Persist to Storage
        saveProgress(newInv);
    };

    const handleModeSelect = (mode: GameMode, cpu?: CpuPersonality) => {
        game.startGame(mode, cpu);
    };

    const isBowlReady = game.currentGameState === 'READY_TO_BOWL';
    const isThrowing = game.currentGameState === 'THROW_SEQUENCE';
    const showTutorial = game.currentGameState === 'TUTORIAL' && game.tutorialStep >= 0;

    const availableBalls = useMemo(() => {
        const balls = ['PLASTIC'];
        if (inventory.items.includes('urethane_ball')) balls.push('URETHANE');
        if (inventory.items.includes('resin_ball')) balls.push('RESIN');
        return balls as BallMaterial[];
    }, [inventory.items]);

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

            <div className="crt-overlay" />

            {game.currentGameState === 'PLAYER_CREATOR' && (
                <PlayerCreator onComplete={handlePlayerCreated} />
            )}

            {game.showLevelUp && inventory.profile && (
                <LevelUpModal profile={inventory.profile} onSave={handleLevelUpSave} />
            )}

            {game.currentGameState === 'MENU' && (
                <div className="animate-fade-in h-full">
                    <NewsTicker />
                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8 z-50">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-['Press_Start_2P'] gradient-text tracking-tighter">LANESHARK</h1>
                            <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 tracking-[0.2em] mt-1 ml-1">OFFICIAL CHAMPIONSHIP</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-['Press_Start_2P'] text-emerald-400 mb-1 leading-none">${inventory.money.toLocaleString()}</span>
                                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden mb-1 border border-white/5">
                                    <div className="h-full bg-emerald-500 shadow-emerald-glow" style={{ width: '100%' }} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[6px] font-['Press_Start_2P'] text-yellow-400">LVL {inventory.profile?.level || 1}</span>
                                    <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden border border-white/5" title={`XP: ${inventory.profile?.xp} / ${game.nextLevelXp}`}>
                                        <div
                                            className="h-full bg-yellow-400 shadow-gold-glow transition-all duration-1000"
                                            style={{ width: `${game.xpProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <CyberButton
                                variant="secondary"
                                icon="📊"
                                onClick={() => setShowProgressionPanel(true)}
                                title="STATS & ACHIEVEMENTS"
                            />

                            <CyberButton
                                variant="glass"
                                label="SHOP"
                                icon="🛒"
                                onClick={() => setIsShopOpen(true)}
                                title="PRO SHOP"
                            />
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
                        equippedItems={inventory.items}
                        screenShake={game.screenShake}
                        onClickBowler={() => handleModeSelect('SOLO')}
                        availableBalls={availableBalls}
                        onSelectBall={game.setUserMaterial}
                    />

                    {inventory.profile && (
                        <div className="absolute top-24 right-6 flex flex-col items-center z-50 animate-slide-in-right group">
                            <div className="p-1 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 shadow-xl cyber-border">
                                {inventory.profile.avatarImage ? (
                                    <img
                                        src={inventory.profile.avatarImage}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-xl border-2 border-white/50 object-cover bg-gray-900 group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-xl border-2 border-white/50 bg-gray-800 flex items-center justify-center text-[8px] text-gray-500 font-['Press_Start_2P']">
                                        NO IMG
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-col items-center">
                                <div className="px-4 py-2 glass-morphism rounded-xl border border-white/20 mb-2 group-hover:border-blue-400/50 transition-colors">
                                    <span className="text-[9px] font-['Press_Start_2P'] text-white tracking-widest leading-none">
                                        {inventory.profile.name}
                                    </span>
                                </div>
                                <div className="px-3 py-1.5 bg-yellow-600/30 border border-yellow-500/40 rounded-lg shadow-gold-glow">
                                    <span className="text-[7px] font-['Press_Start_2P'] text-yellow-100">
                                        RANK: PRO BOWLER
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

                    {showProgressionPanel && (
                        <ProgressionPanel
                            inventory={inventory}
                            onClose={() => setShowProgressionPanel(false)}
                        />
                    )}
                </div>

            )}

            {game.currentGameState !== 'SPLASH' && game.currentGameState !== 'MENU' && game.currentGameState !== 'PLAYER_CREATOR' && (
                <div className="h-full w-full relative overflow-hidden">
                    {/* Game HUD */}
                    {/* Responsive HUD Overlay */}
                    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between">

                        {/* 1. Top Bar: Navigation, Title, Economy */}
                        <div className="w-full bg-gradient-to-b from-black/90 via-black/40 to-transparent p-4 flex items-start justify-between pointer-events-auto">
                            {/* Left: Exit */}
                            <button
                                onClick={() => game.setCurrentGameState('MENU')}
                                className="group flex items-center gap-2 px-3 py-2 bg-red-950/40 border border-red-500/30 rounded-xl hover:bg-red-900 transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-md"
                            >
                                <span className="text-red-500 text-xs sm:text-base">⬅</span>
                                <span className="hidden sm:block text-[8px] font-['Press_Start_2P'] text-red-200">EXIT</span>
                            </button>

                            {/* Center: Title (Hidden on small mobile) & Messages */}
                            <div className="flex flex-col items-center flex-1 mx-4">
                                <NewsTicker />
                                <h1 className="hidden md:block text-xs font-['Press_Start_2P'] gradient-text shadow-glow-effect mb-2">LANESHARK</h1>

                                {/* Dynamic Message Area */}
                                <div className="pointer-events-none flex flex-col items-center gap-2 w-full max-w-md">
                                    <MessageDisplay message={game.message} />

                                    {isThrowing && (
                                        <div className="px-4 py-2 bg-blue-950/40 border border-blue-500/40 rounded-full animate-pulse backdrop-blur-md">
                                            <div className="text-blue-200 font-['Press_Start_2P'] text-[8px] tracking-widest text-center whitespace-nowrap">
                                                SPACE / TAP TO LOCK
                                            </div>
                                        </div>
                                    )}

                                    {currentPlayer?.isCpu && (
                                        <div className="px-4 py-2 bg-red-950/60 border border-red-500/40 rounded-lg animate-pulse backdrop-blur-md">
                                            <div className="text-red-300 font-['Press_Start_2P'] text-[7px] uppercase text-center mb-1">
                                                CPU: {currentPlayer.name}
                                            </div>
                                            <div className="text-gray-400 font-['Press_Start_2P'] text-[6px] italic text-center">
                                                "{currentPlayer.cpuProfile?.description}"
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Area: Score HUD & Navigation */}
                            <div className="flex flex-col items-end gap-6 flex-1 max-w-2xl">
                                <Scoreboard
                                    score={currentPlayer?.score || 0}
                                    frame={currentPlayer?.frames.length || 1}
                                    throwInFrame={currentPlayer?.rolls.length ? (currentPlayer.rolls.length % 2 === 0 ? 1 : 2) : 1}
                                />

                                {currentPlayer && !currentPlayer.isCpu && (
                                    <div className="flex gap-3 mt-2 pointer-events-auto">
                                        <CyberButton
                                            variant={showScorecard ? "success" : "glass"}
                                            icon="📋"
                                            onClick={() => setShowScorecard(!showScorecard)}
                                            title="Toggle Scorecard"
                                        />
                                        <CyberButton
                                            variant={showBallSettings ? "gold" : "glass"}
                                            icon="⚙️"
                                            onClick={() => setShowBallSettings(!showBallSettings)}
                                            title="Settings"
                                        />
                                        <CyberButton
                                            variant="secondary"
                                            icon="🛒"
                                            onClick={() => setIsShopOpen(true)}
                                            title="Shop"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 2. Bottom Area: Intentionally empty for bowler interaction and scorecard visibility */}
                            <div className="pointer-events-none h-24 w-full" />
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
                            screenShake={game.screenShake}
                            onClickBowler={() => {
                                if (isBowlReady && !currentPlayer?.isCpu) {
                                    game.startThrowSequence();
                                }
                            }}
                            availableBalls={availableBalls}
                            onSelectBall={game.setUserMaterial}
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



                        {currentPlayer && showScorecard && (
                            <Scorecard frames={currentPlayer.frames} />
                        )}

                        <ImpactMessage message={game.impactEffectText} isVisible={game.showImpactEffect} />

                        {/* Celebration Overlay */}
                        <CelebrationOverlay
                            type={game.celebration}
                            onComplete={() => game.setCelebration(null)}
                        />

                        {/* Level Up Modal - REMOVED DUPLICATE (Already rendered at top level) */}

                    </div>
                </div>

            )}
        </div>
    );
}

const LaneSharkGameRoot = () => <LaneSharkGame />;
export default LaneSharkGameRoot;
