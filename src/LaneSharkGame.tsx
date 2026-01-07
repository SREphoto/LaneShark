/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { useGameAssets } from './hooks/useGameAssets';
import { useGameEngine } from './hooks/useGameEngine';
import { TUTORIAL_STEPS, WAGER_TARGET_SCORE } from './constants';
import { GameMode, CpuPersonality, PlayerProfile, BallMaterial, StageId } from './types';
import { loadProgress, saveProgress } from './utils/storageUtils';
import { SHOP_ITEMS } from './data/shopItems';
import { STAGES } from './data/stages';


import VerticalScoreboard from './components/VerticalScoreboard';
// import Scoreboard from './components/Scoreboard';
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
import AchievementPopup from './components/AchievementPopup';
import CelebrationOverlay from './components/CelebrationOverlay';
import CyberButton from './components/CyberButton';
import StageSelect from './components/StageSelect';



/**
 * LaneShark Bowling - Premium Evolution
 */
function LaneSharkGame() {
    const assets = useGameAssets();
    const xpBarRef = React.useRef<HTMLDivElement>(null);

    // User Inventory State (Main Player)
    const [inventory, setInventory] = useState(loadProgress());

    // UI State
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [showBallSettings, setShowBallSettings] = useState(false);
    const [showScorecard, setShowScorecard] = useState(true); // Open by default for visibility
    const [showProgressionPanel, setShowProgressionPanel] = useState(false);
    const [showStageSelect, setShowStageSelect] = useState(false);
    const [pendingGameConfig, setPendingGameConfig] = useState<{ mode: GameMode, cpu?: CpuPersonality, wager?: number } | null>(null);


    const game = useGameEngine({
        assets
    });

    // Fix: LaneSharkGame manages the ref, since useGameEngine does not expose it
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

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
        if (xpBarRef.current) {
            xpBarRef.current.style.width = `${game.xpProgress}%`;
        }
    }, [game.xpProgress]);

    useEffect(() => {
        if (game.players.length > 0 && game.players[0].id === 1) {
            const engineInv = game.players[0].inventory;
            if (engineInv.money !== inventory.money || engineInv.profile?.xp !== inventory.profile?.xp) {
                setInventory(engineInv);
                saveProgress(engineInv);
            }
        }
    }, [game.players, inventory.money, inventory.profile?.xp]);

    const { setCurrentGameState, setCelebration, setLastAchievement } = game;

    const handleSplashScreenComplete = useCallback(() => {
        if (inventory.profile) {
            setCurrentGameState('MENU');
        } else {
            setCurrentGameState('PLAYER_CREATOR');
        }
    }, [inventory.profile, setCurrentGameState]);

    const handleCelebrationComplete = useCallback(() => {
        setCelebration(null);
    }, [setCelebration]);

    const handleAchievementDismiss = useCallback(() => {
        setLastAchievement(null);
    }, [setLastAchievement]);

    const handlePlayerCreated = (profile: PlayerProfile) => {
        game.updateProfile(profile);
        setInventory(loadProgress());
        setCurrentGameState('MENU');
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

    const handleModeSelect = (mode: GameMode, cpu?: CpuPersonality, wager: number = 0) => {
        setPendingGameConfig({ mode, cpu, wager });
        setShowStageSelect(true);
    };

    const handleStageSelect = (stageId: StageId) => {
        if (pendingGameConfig) {
            game.setCurrentStage(stageId);
            game.setWager(pendingGameConfig.wager || 0);

            game.startGame(pendingGameConfig.mode, pendingGameConfig.cpu);
            setShowStageSelect(false);
            setPendingGameConfig(null);
        }
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

            {game.showLevelUp && game.players[0]?.profile && (
                <LevelUpModal
                    key={`levelup-${game.players[0].profile.level}`}
                    profile={game.players[0].profile}
                    onSave={handleLevelUpSave}
                />
            )}

            {game.currentGameState === 'MENU' && (
                <div className="animate-fade-in h-full flex flex-col pt-[32px]">

                    {/* Header */}
                    <div className="header-retro h-20 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-['Press_Start_2P'] gradient-text tracking-tighter">LANESHARK</h1>
                            <span className="text-[8px] font-['Press_Start_2P'] text-gray-500 tracking-[0.2em] mt-1 ml-1">OFFICIAL CHAMPIONSHIP</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-['Press_Start_2P'] text-emerald-400 mb-1 leading-none">${inventory.money.toLocaleString()}</span>
                                <div
                                    className="progress-bar-fill bg-emerald-500 shadow-emerald-glow w-full"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-[6px] font-['Press_Start_2P'] text-yellow-400">LVL {inventory.profile?.level || 1}</span>
                                    <div
                                        ref={xpBarRef}
                                        className="progress-bar-fill bg-yellow-400 shadow-gold-glow"
                                    />
                                </div>
                            </div>

                            <CyberButton
                                variant="secondary"
                                icon="📊"
                                onClick={(e) => { e.stopPropagation(); setShowProgressionPanel(true); }}
                                title="STATS & ACHIEVEMENTS"
                            />

                            <CyberButton
                                variant="gold"
                                label="SHOP"
                                icon="🛒"
                                onClick={(e) => { e.stopPropagation(); setIsShopOpen(true); }}
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
                        currentStage={game.currentStage}
                    />

                    {showStageSelect && (
                        <StageSelect
                            currentLevel={inventory.profile?.level || 1}
                            onSelect={handleStageSelect}
                            onClose={() => setShowStageSelect(false)}
                        />
                    )}

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

                    <ModeSelect onSelectMode={handleModeSelect} currentMoney={inventory.money} />

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
                <div className="h-full w-full relative overflow-hidden flex flex-col pt-[32px]">
                    {/* Game HUD */}
                    {/* Responsive HUD Overlay */}
                    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between">

                        {/* 1. Top Bar: Navigation, Title, Economy */}
                        <div className="header-retro h-24 bg-gradient-to-b from-black/90 via-black/40 to-transparent p-4 flex items-start justify-between">
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

                                <h1 className="hidden md:block text-xs font-['Press_Start_2P'] gradient-text shadow-glow-effect mb-2">LANESHARK</h1>

                            </div>

                            {/* Right Area: Control Buttons */}
                            <div className="flex items-center gap-2 z-50 pointer-events-auto">
                                <button
                                    onClick={() => setShowScorecard(!showScorecard)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl border backdrop-blur-md transition-all ${showScorecard ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/40 border-white/10 text-blue-400 hover:bg-black/60'}`}
                                >
                                    📋
                                </button>
                                <button
                                    onClick={() => setIsShopOpen(true)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-purple-900/40 to-black/40 text-purple-400 backdrop-blur-md transition-all hover:scale-105"
                                >
                                    🛒
                                </button>
                                <button
                                    onClick={() => setShowBallSettings(!showBallSettings)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-black/40 text-gray-400 backdrop-blur-md transition-all hover:bg-black/60"
                                >
                                    ⚙️
                                </button>
                            </div>
                        </div>

                        {/* BOTTOM CONTROL BAR - Status Message Here to avoid blocking pins at top */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none w-full max-w-md px-4 flex justify-center">
                            <MessageDisplay message={game.message} />
                        </div>

                        {/* Vertical Scoreboard Sidebar */}
                        <VerticalScoreboard
                            players={game.players}
                            currentPlayerIdx={game.currentPlayerIdx}
                            currentFrameIdx={currentPlayer ? currentPlayer.frames.length + 1 : 1}
                            isVisible={showScorecard}
                            onClose={() => setShowScorecard(false)}
                        />

                        <GameCanvas
                            canvasRef={canvasRef}
                            ball={game.ball}
                            pins={game.pins}
                            trail={game.trail}
                            particles={game.particles}
                            gameState={game.currentGameState}
                            ballImage={assets.ballImageRef.current}
                            spectators={game.spectators}
                            onSwipeThrow={(power, angle) => game.rollBall(power, angle)}
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
                            currentStage={game.currentStage}
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
                                    accuracy: (game.players[0].rolls.filter(r => r > 0).length / Math.max(1, game.players[0].rolls.length)) * 100,
                                    wagerAmount: game.lastWagerResult?.amount,
                                    wagerWon: game.lastWagerResult?.won
                                }}
                                profile={game.players[0].profile}
                                onClose={() => game.setCurrentGameState('MENU')}
                            />
                        )}



                        {currentPlayer && showScorecard && (
                            <Scorecard frames={currentPlayer.frames} />
                        )}

                        <ImpactMessage message={game.impactEffectText} isVisible={game.showImpactEffect} />

                        <CelebrationOverlay
                            type={game.celebration}
                            onComplete={handleCelebrationComplete}
                        />

                        {/* Achievement Notification */}
                        <AchievementPopup
                            achievement={game.lastAchievement}
                            onDismiss={handleAchievementDismiss}
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
