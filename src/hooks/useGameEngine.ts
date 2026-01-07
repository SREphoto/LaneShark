
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ThrowStep, Ball, Pin, GameContextForCommentary, AssetsLoaded, Particle, BowlingFrame, LaneCondition, BallMaterial, GameStatistics, Spectator, Player, GameMode, CpuPersonality, PlayerProfile, UserInventory, StageId, Stage, LifetimeStats } from '../types';
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, LANE_WIDTH, BALL_RADIUS, PIN_RADIUS,
    BALL_START_Y, HEAD_PIN_Y, PIN_COLLISION_RADIUS,
    PIN_DAMPING, PIN_PIN_COLLISION_RADIUS, IMPACT_FACTOR, PIN_ROTATION_DAMPING, MAX_TRAIL_LENGTH,
    BALL_WEIGHT_HEAVY, BALL_WEIGHT_LIGHT, LANE_LEFT_EDGE, LANE_RIGHT_EDGE, WINNINGS_PER_POINT,
    MATERIAL_PROPS, LANE_PROPS, BALL_RETURN_WIDTH, MAX_SPIN, BASE_THROW_SPEED, XP_PER_PIN, XP_PER_STRIKE, XP_PER_SPARE, LEVELS, PIN_SPACING, WAGER_TARGET_SCORE
} from '../constants';
import { calculateBowlingScore, isGameOver } from '../utils/bowlingUtils';
import { saveProgress, loadProgress } from '../utils/storageUtils';

type UseGameEngineProps = {
    assets: {
        assetsLoaded: AssetsLoaded;
        pinHitSoundRef: React.RefObject<HTMLAudioElement>;
        strikeSoundRef: React.RefObject<HTMLAudioElement>;
        ballReturnSoundRef: React.RefObject<HTMLAudioElement>;
        clapSoundRef: React.RefObject<HTMLAudioElement>;
        awwSoundRef: React.RefObject<HTMLAudioElement>;
        cheerSoundRef: React.RefObject<HTMLAudioElement>;
        footstepsSoundRef: React.RefObject<HTMLAudioElement>;
    };
};

import { CelebrationType } from '../components/CelebrationOverlay';
import { ACHIEVEMENT_POPUP_DURATION } from '../constants';
import { ACHIEVEMENTS, DAILY_CHALLENGES, Achievement } from '../data/progression';

// ... (existing imports)

import { STAGES } from '../data/stages';

export function useGameEngine({ assets }: UseGameEngineProps) {
    const [currentGameState, setCurrentGameState] = useState<GameState>('SPLASH');
    const [currentStage, setCurrentStage] = useState<StageId>(STAGES[0].id);
    const [celebration, setCelebration] = useState<CelebrationType>(null);
    const [throwStep, setThrowStep] = useState<ThrowStep>('POSITION');
    const [wager, setWager] = useState<number>(0);
    const [lastWagerResult, setLastWagerResult] = useState<{ won: boolean, amount: number } | null>(null);
    const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);

    const [isCountingDown, setIsCountingDown] = useState(false);

    // Oscillating values for All-in-One throw
    const [aimOscillation, setAimOscillation] = useState(0); // -1 to 1
    const [powerOscillation, setPowerOscillation] = useState(0.8); // 0.2 to 1.5
    const [chargingDirection, setChargingDirection] = useState(1);
    const [aimDirection, setAimDirection] = useState(1);
    const [gameMode, setGameMode] = useState<GameMode>('SOLO');
    const [isMobile, setIsMobile] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const [message, setMessage] = useState("Loading...");
    const [impactEffectText, setImpactEffectText] = useState("");
    const [showImpactEffect, setShowImpactEffect] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [userWeight, setUserWeight] = useState(1.8);
    const [userSpin, setUserSpin] = useState(0);
    const [userMaterial, setUserMaterial] = useState<BallMaterial>('PLASTIC');
    const [laneCondition, setLaneCondition] = useState<LaneCondition>('NORMAL');
    const [tutorialStep, setTutorialStep] = useState<number>(-1);
    const [screenShake, setScreenShake] = useState(0);

    const currentPlayer = players[currentPlayerIdx];

    const rollBall = useCallback((powerFactor: number = 1.0, accuracyBias: number = 0.0) => {
        if (currentGameState !== 'THROW_SEQUENCE' && currentGameState !== 'READY_TO_BOWL') return;

        const finalPower = powerOscillation * powerFactor;
        const finalAngle = aimOscillation * 5 + accuracyBias; // Narrow arc: +/- 5 degrees

        setBall(prev => ({
            ...prev,
            angle: finalAngle,
            weight: userWeight * finalPower
        }));

        ballRef.current.angle = finalAngle;
        ballRef.current.weight = userWeight * finalPower;

        setCurrentGameState('ROLLING');
    }, [currentGameState, powerOscillation, aimOscillation, userWeight]);

    const nextThrowStep = useCallback(() => {
        if (throwStep === 'POSITION') {
            setThrowStep('AIM');
            setMessage("LOCK YOUR AIM");
        } else if (throwStep === 'AIM') {
            setThrowStep('POWER');
            setMessage("LOCK YOUR POWER");
        } else if (throwStep === 'POWER') {
            rollBall();
        }
    }, [throwStep, rollBall]);



    const ballRef = useRef<Ball>({
        x: CANVAS_WIDTH / 2, y: BALL_START_Y,
        radius: BALL_RADIUS, dx: 0, dy: 0,
        weight: 1.8, spin: 0, inGutter: false,
        material: 'PLASTIC', angle: 0
    });
    const pinsRef = useRef<Pin[]>([]);
    const trailRef = useRef<{ x: number, y: number, speed: number }[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const spectatorsRef = useRef<Spectator[]>([]);
    const pinsStandingBeforeThrowRef = useRef<number>(10);

    const [ball, setBall] = useState<Ball>(ballRef.current);
    const [pins, setPins] = useState<Pin[]>([]);
    const [trail, setTrail] = useState<{ x: number, y: number, speed: number }[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [spectators, setSpectators] = useState<Spectator[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameLoopIdRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            setIsMobile(/android|ipad|iphone|ipod/i.test(userAgent.toLowerCase()) || window.innerWidth < 800);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const specs: Spectator[] = [];
        const colors = ['#e53e3e', '#3182ce', '#38a169', '#d69e2e', '#805ad5', '#d35400', '#8e44ad', '#2980b9'];

        // Left Side Grandstand (Far Left)
        for (let i = 0; i < 6; i++) {
            specs.push({
                id: i,
                x: 0 + Math.random() * 20, // Far left
                y: 100 + i * 50 + Math.random() * 10, // Higher up / further away
                color: colors[i % colors.length],
                state: 'IDLE',
                animOffset: Math.random() * 100
            });
        }

        // Right Side Grandstand (Far Right)
        for (let i = 6; i < 12; i++) {
            specs.push({
                id: i,
                x: CANVAS_WIDTH - 20 + Math.random() * 20, // Far right
                y: 100 + (i - 6) * 50 + Math.random() * 10,
                color: colors[i % colors.length],
                state: 'IDLE',
                animOffset: Math.random() * 100
            });
        }

        spectatorsRef.current = specs;
        setSpectators(specs);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- WATCHDOG TIMER (Reliability) ---
    // Automatically recovers the game if it gets stuck in a transient state
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const transientStates = ['ROLLING', 'PIN_SETTLEMENT', 'BALL_RETURN'];
        const TIMEOUT_MS = 8000; // 8 seconds max for any animation

        if (transientStates.includes(currentGameState)) {
            timeoutId = setTimeout(() => {
                console.warn(`[WATCHDOG] Game stuck in ${currentGameState} for ${TIMEOUT_MS}ms. Forcing reset.`);

                // Force Recovery Logic
                if (currentGameState === 'ROLLING') {
                    // Ball probably stuck or fell off world
                    setBall(prev => ({ ...prev, inGutter: true, dx: 0 }));
                    // Let the existing loop handle gutter reset next frame, or force it:
                    triggerEvent('gutter');
                    setTimeout(() => setCurrentGameState('PIN_SETTLEMENT'), 100);
                } else {
                    // Animation stuck -> just go to ready
                    setMessage("SYSTEM RECOVERED");
                    setIsZoomed(false);
                    setBall(prev => ({ ...prev, x: CANVAS_WIDTH / 2, y: BALL_START_Y, dx: 0, dy: 0, angle: 0 }));
                    setCurrentGameState('READY_TO_BOWL');
                }
            }, TIMEOUT_MS);
        }

        return () => clearTimeout(timeoutId);
    }, [currentGameState, triggerEvent]);

    const triggerEvent = useCallback(async (event: string, contextExtra: Partial<GameContextForCommentary> = {}) => {
        const context: GameContextForCommentary = {
            event,
            playerName: currentPlayer?.name || 'Player',
            frame: currentPlayer?.frames.length || 1,
            totalScore: currentPlayer?.score || 0,
            ballSpin: ballRef.current.spin,
            ballWeight: ballRef.current.weight,
            ballMaterial: ballRef.current.material,
            laneCondition: laneCondition,
            ...contextExtra
        };

        const newSpecs = [...spectatorsRef.current];
        if (event === 'strike' || event === 'spare') {
            newSpecs.forEach(s => s.state = 'CHEER');
            assets.cheerSoundRef.current?.play().catch(() => { });
            assets.clapSoundRef.current?.play().catch(() => { });
            setImpactEffectText(event === 'strike' ? 'STRIKE!' : 'SPARE!');
            setShowImpactEffect(true);
            setScreenShake(event === 'strike' ? 20 : 10); // Shake it!
            setTimeout(() => setShowImpactEffect(false), 1000);
        } else if (event === 'gutter') {
            newSpecs.forEach(s => s.state = 'BOO');
            assets.awwSoundRef.current?.play().catch(() => { });
        } else if (event === 'throwOne') {
            newSpecs.forEach(s => s.state = Math.random() > 0.5 ? 'CHEER' : 'IDLE');
            if ((contextExtra.pinsKnocked || 0) > 7) {
                assets.clapSoundRef.current?.play().catch(() => { });
                setScreenShake(5); // Minor shake for good hits
            }
        }
        spectatorsRef.current = newSpecs;
        setSpectators(newSpecs);
    }, [currentPlayer, laneCondition, assets]);

    // --- WATCHDOG TIMER (Reliability) ---
    // Automatically recovers the game if it gets stuck in a transient state
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const transientStates = ['ROLLING', 'PIN_SETTLEMENT', 'BALL_RETURN'];
        const TIMEOUT_MS = 8000; // 8 seconds max for any animation

        if (transientStates.includes(currentGameState)) {
            timeoutId = setTimeout(() => {
                console.warn(`[WATCHDOG] Game stuck in ${currentGameState} for ${TIMEOUT_MS}ms. Forcing reset.`);

                // Force Recovery Logic
                if (currentGameState === 'ROLLING') {
                    // Ball probably stuck or fell off world
                    setBall(prev => ({ ...prev, inGutter: true, dx: 0 }));
                    // Let the existing loop handle gutter reset next frame, or force it:
                    triggerEvent('gutter');
                    setTimeout(() => setCurrentGameState('PIN_SETTLEMENT'), 100);
                } else {
                    // Animation stuck -> just go to ready
                    setMessage("SYSTEM RECOVERED");
                    setIsZoomed(false);
                    setBall(prev => ({ ...prev, x: CANVAS_WIDTH / 2, y: BALL_START_Y, dx: 0, dy: 0, angle: 0 }));
                    setCurrentGameState('READY_TO_BOWL');
                }
            }, TIMEOUT_MS);
        }

        return () => clearTimeout(timeoutId);
    }, [currentGameState, triggerEvent]);

    const spawnImpactParticles = (x: number, y: number, count: number = 10, color: string = '#fff') => {
        const newParticles: Particle[] = [];
        const colors = ['#ffffff', '#0fbcf9', '#f53b57', '#ffd32a', '#05c46b'];
        for (let i = 0; i < count; i++) {
            const pColor = color === '#fff' ? colors[Math.floor(Math.random() * colors.length)] : color;
            newParticles.push({
                x, y,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.5) * 16 - 5, // Upward bias
                life: 0.8 + Math.random() * 0.4,
                color: pColor
            });
        }
        particlesRef.current = [...particlesRef.current, ...newParticles];
    };

    const resetPins = useCallback(() => {
        const newPins: Pin[] = [];
        const startX = CANVAS_WIDTH / 2; // Single Lane Center
        const startY = HEAD_PIN_Y;
        const spacingX = PIN_SPACING / 2;
        const rowHeight = PIN_SPACING * Math.sin(Math.PI / 3);

        newPins.push({ id: 1, x: startX, y: startY, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 2, x: startX - spacingX, y: startY - rowHeight, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 3, x: startX + spacingX, y: startY - rowHeight, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 4, x: startX - spacingX * 2, y: startY - rowHeight * 2, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 5, x: startX, y: startY - rowHeight * 2, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 6, x: startX + spacingX * 2, y: startY - rowHeight * 2, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 7, x: startX - spacingX * 3, y: startY - rowHeight * 3, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 8, x: startX - spacingX, y: startY - rowHeight * 3, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 9, x: startX + spacingX, y: startY - rowHeight * 3, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });
        newPins.push({ id: 10, x: startX + spacingX * 3, y: startY - rowHeight * 3, isDown: false, vx: 0, vy: 0, angle: 0, va: 0, wobble: 0 });

        pinsRef.current = newPins;
        setPins(newPins);
        pinsStandingBeforeThrowRef.current = 10;
        setIsZoomed(false);
    }, []);

    const startThrowSequence = useCallback(() => {
        setCurrentGameState('THROW_SEQUENCE');
        setBall(prev => ({ ...prev, x: CANVAS_WIDTH / 2, y: BALL_START_Y, dx: 0, dy: 0, inGutter: false }));
        setTrail([]);
        setIsZoomed(false);
        setThrowStep('POSITION');
        setMessage("POSITION YOUR BALL");
    }, []);

    const resetBall = useCallback(() => {
        const playerProfile = players[currentPlayerIdx]?.profile;
        let startX = CANVAS_WIDTH / 2;
        if (playerProfile?.handedness === 'LEFT') startX += 40;
        else if (playerProfile?.handedness === 'RIGHT') startX -= 40;

        const newBall = {
            x: startX, y: BALL_START_Y,
            radius: BALL_RADIUS, dx: 0, dy: 0,
            weight: userWeight, spin: userSpin, inGutter: false,
            material: userMaterial, angle: 0
        };
        ballRef.current = newBall;
        trailRef.current = [];
        setBall(newBall);
        setTrail([]);
        setIsZoomed(false);
        startThrowSequence();
    }, [userWeight, userSpin, userMaterial, players, currentPlayerIdx, startThrowSequence]);

    const updatePhysics = useCallback(() => {
        const ball = ballRef.current;
        const pins = pinsRef.current;
        let soundPlayedThisFrame = false;

        // Screen Shake Decay
        if (screenShake > 0.1) {
            setScreenShake(prev => prev * 0.9);
        } else if (screenShake > 0) {
            setScreenShake(0);
        }

        if (currentGameState === 'ROLLING') {
            const laneParams = LANE_PROPS[laneCondition];
            const matParams = MATERIAL_PROPS[ball.material];
            const speedMod = BASE_THROW_SPEED + ((currentPlayer?.profile?.stats.strength || 1) * 0.2);

            const angleRad = ball.angle * (Math.PI / 180);
            const stage = STAGES.find(s => s.id === currentStage) || STAGES[0];
            const speedX = Math.sin(angleRad) * speedMod;
            const speedY = -Math.cos(angleRad) * speedMod * laneParams.friction * stage.friction;

            ball.y += speedY;
            ball.x += speedX;

            if (ball.y < 350) setIsZoomed(true);

            if (!ball.inGutter) {
                const stage = STAGES.find(s => s.id === currentStage) || STAGES[0];

                // SKID-SNAP LOGIC
                // Lane Length ~900px (1120 -> 200)
                const distTraveled = BALL_START_Y - ball.y;
                let zoneFactor = 1.0;

                if (distTraveled < 300) {
                    // HEADS (0-30ft): Deep Oil -> Skid
                    zoneFactor = 0.3;
                } else if (distTraveled < 600) {
                    // MID-LANE (30-45ft): Transition -> Hook starts to bite
                    // Smooth ramp from 0.3 to 1.2
                    const progress = (distTraveled - 300) / 300;
                    zoneFactor = 0.3 + (progress * 0.9);
                } else {
                    // BACKEND (45-60ft): Dry -> Snap
                    zoneFactor = 1.8;
                }

                // Base force increased (0.15 -> 0.25) to compensate for skid phase
                const hookForce = ball.spin * matParams.hookPotential * laneParams.hookModifier * stage.hookMult * 0.25 * zoneFactor;
                ball.angle += hookForce;

                if (ball.x < LANE_LEFT_EDGE + BALL_RADIUS / 2 || ball.x > LANE_RIGHT_EDGE - BALL_RADIUS / 2) {
                    ball.inGutter = true;
                    ball.x = ball.x < LANE_LEFT_EDGE + BALL_RADIUS / 2 ? LANE_LEFT_EDGE / 2 : LANE_RIGHT_EDGE + (CANVAS_WIDTH - LANE_RIGHT_EDGE) / 2;
                    ball.dx = 0;
                    setMessage("GUTTER!");
                    triggerEvent('gutter');
                }
            }
            const currentSpeed = Math.sqrt(speedX * speedX + speedY * speedY);
            trailRef.current.push({ x: ball.x, y: ball.y, speed: currentSpeed });
            if (trailRef.current.length > MAX_TRAIL_LENGTH) trailRef.current.shift();
        } else if (currentGameState === 'BALL_RETURN') {
            const returnTrackX = 20;
            const returnExitY = BALL_START_Y;

            // Phase 1: Move to left track (horizontal)
            if (ball.x > returnTrackX + 5) {
                ball.x += (returnTrackX - ball.x) * 0.1;
            } else {
                // Phase 2: In track, move down (vertical)
                ball.x = returnTrackX;
                ball.y += (returnExitY - ball.y) * 0.08 + 2;
            }
            setIsZoomed(false);
        } else if (currentGameState === 'THROW_SEQUENCE') {
            if (throwStep === 'AIM') {
                setAimOscillation(prev => {
                    let next = prev + aimDirection * 0.02;
                    if (next > 1 || next < -1) {
                        setAimDirection(-aimDirection);
                        next = Math.max(-1, Math.min(1, next));
                    }
                    return next;
                });
            } else if (throwStep === 'POWER') {
                setPowerOscillation(prev => {
                    let next = prev + chargingDirection * 0.03;
                    if (next > 1.5 || next < 0.2) {
                        setChargingDirection(-chargingDirection);
                        next = Math.max(0.2, Math.min(1.5, next));
                    }
                    return next;
                });
            } else if (throwStep === 'POSITION') {
                setBall(prev => {
                    let nextX = prev.x + (aimDirection * 3);
                    if (nextX > LANE_RIGHT_EDGE - BALL_RADIUS || nextX < LANE_LEFT_EDGE + BALL_RADIUS) {
                        setAimDirection(-aimDirection);
                        nextX = Math.max(LANE_LEFT_EDGE + BALL_RADIUS, Math.min(LANE_RIGHT_EDGE - BALL_RADIUS, nextX));
                    }
                    ballRef.current.x = nextX;
                    return { ...prev, x: nextX };
                });
            }
        }

        if (!ball.inGutter && currentGameState === 'ROLLING') {
            pins.forEach(pin => {
                if (pin.isDown && Math.abs(pin.vx) > 0.1) return;
                const dx = ball.x - pin.x;
                const dy = ball.y - pin.y;
                if (Math.sqrt(dx * dx + dy * dy) < PIN_COLLISION_RADIUS) {
                    pin.isDown = true;
                    const matRestitution = MATERIAL_PROPS[ball.material].restitution;

                    // Special item effects
                    let impactMult = 1.0;
                    if (players[0]?.inventory.items.includes('magma_ball')) impactMult = 1.15;
                    if (players[0]?.inventory.items.includes('titanium_beast')) impactMult = 1.25;

                    const force = 12 * ball.weight * (1 / matRestitution) * impactMult;
                    pin.vx = ((pin.x - ball.x) / PIN_COLLISION_RADIUS) * force;
                    pin.vy = ((pin.y - ball.y) / PIN_COLLISION_RADIUS) * force - 8;
                    pin.va = (Math.random() - 0.5) * 15.0 + (ball.spin * 20);

                    // Add Screenshake
                    setScreenShake(prev => Math.min(15, prev + force * 0.5));

                    spawnImpactParticles(pin.x, pin.y, 15, '#fff');
                    if (!soundPlayedThisFrame) {
                        try { assets.pinHitSoundRef.current?.play().catch(() => { }); } catch (e) { }
                        soundPlayedThisFrame = true;
                    }
                }
            });
        }

        for (let i = 0; i < pins.length; i++) {
            const p1 = pins[i];
            if (p1.isDown || Math.abs(p1.vx) > 0.1 || Math.abs(p1.vy) > 0.1) {
                p1.x += p1.vx; p1.y += p1.vy; p1.angle += p1.va;
                p1.vx *= PIN_DAMPING; p1.vy *= PIN_DAMPING; p1.va *= PIN_ROTATION_DAMPING;
                for (let j = 0; j < pins.length; j++) {
                    if (i === j) continue;
                    const p2 = pins[j];
                    const dx = p1.x - p2.x; const dy = p1.y - p2.y;
                    if (dx * dx + dy * dy < PIN_PIN_COLLISION_RADIUS * PIN_PIN_COLLISION_RADIUS) {
                        if (!p2.isDown) {
                            p2.isDown = true;
                            p2.vx = p1.vx * IMPACT_FACTOR + (Math.random() - 0.5);
                            p2.vy = p1.vy * IMPACT_FACTOR - 1;
                            p2.va = -p1.va * 0.5 + (Math.random() - 0.5);
                            spawnImpactParticles(p2.x, p2.y, 8, '#fef08a');
                            try { (assets.pinHitSoundRef.current?.cloneNode() as HTMLAudioElement).play().catch(() => { }); } catch (e) { }
                        }
                    }
                }
            }
        }

        const activeParticles = [];
        for (const p of particlesRef.current) {
            p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life -= 0.02;
            if (p.life > 0) activeParticles.push(p);
        }
        particlesRef.current = activeParticles;

        if (screenShake > 0) setScreenShake(prev => prev > 0.05 ? prev * 0.85 : 0);

        setBall({ ...ballRef.current });
        setPins([...pinsRef.current]);
        setTrail([...trailRef.current]);
        setParticles([...particlesRef.current]);
        setSpectators([...spectatorsRef.current]);
    }, [currentGameState, assets, laneCondition, currentPlayer, triggerEvent, throwStep, aimDirection, chargingDirection]);

    // CPU Logic Simulation
    useEffect(() => {
        if (currentGameState === 'READY_TO_BOWL' && currentPlayer?.isCpu) {
            const timer = setTimeout(() => {
                const cpu = currentPlayer.cpuProfile!;
                const jitter = (1 - cpu.difficulty) * 2;
                const targetX = 200 + (cpu.spinPreference * -100) + ((Math.random() - 0.5) * 40 * jitter);
                const targetAngle = (Math.random() - 0.5) * jitter * 5;
                const weight = cpu.powerPreference > 1.2 ? 2.5 : 1.8;
                const spin = cpu.spinPreference + ((Math.random() - 0.5) * jitter * 0.2);

                ballRef.current.x = Math.max(80, Math.min(320, targetX));
                ballRef.current.angle = targetAngle;
                ballRef.current.weight = weight;
                ballRef.current.spin = spin;

                setBall({ ...ballRef.current });
                setTimeout(() => rollBall(), 800);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [currentGameState, currentPlayer, rollBall]);

    useEffect(() => {
        if (['SPLASH', 'MENU', 'PLAYER_CREATOR', 'GAME_OVER'].includes(currentGameState)) return;
        const loop = () => {
            updatePhysics();
            if (currentGameState === 'ROLLING' && ballRef.current.y < -150) {
                setCurrentGameState('PIN_SETTLEMENT');
                setIsZoomed(false);
            } else {
                gameLoopIdRef.current = requestAnimationFrame(loop);
            }
        };
        gameLoopIdRef.current = requestAnimationFrame(loop);
        return () => { if (gameLoopIdRef.current) cancelAnimationFrame(gameLoopIdRef.current); };
    }, [currentGameState, updatePhysics]);

    useEffect(() => {
        if (currentGameState === 'PIN_SETTLEMENT') {
            const timer = setTimeout(() => {
                const knocked = pinsRef.current.filter(p => p.isDown).length;
                handleRollResult(knocked);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentGameState]);

    const handleRollResult = (knockedPins: number) => {
        if (!currentPlayer) return;
        const standingBefore = pinsStandingBeforeThrowRef.current;
        const remainingStanding = standingBefore - knockedPins;
        pinsStandingBeforeThrowRef.current = remainingStanding;

        let eventType = 'throwOne';
        let celebrationType: CelebrationType = null;

        // Split Detection Logic
        const isSplit = (() => {
            if (standingBefore === 10) return false; // First throw of frame was full set
            if (standingBefore <= 1) return false; // Need at least 2 pins

            // Check if head pin (Pin 1) is down (it's ID 0 in array usually, check IDs)
            // Pins are 1-based IDs in this game? Let's assume based on constants.
            // If we don't have direct access to pin IDs here without checking pinsRef,
            // we'll rely on remaining count for now or better yet, look at pinsRef.
            const standingPins = pinsRef.current.filter(p => !p.isDown);
            const hasHeadPin = standingPins.some(p => Math.abs(p.x - CANVAS_WIDTH / 2) < 5); // Head pin is center

            if (hasHeadPin) return false; // Not a split if head pin stands

            if (standingPins.length < 2) return false;

            // Simple gap check: Max distance between any two standing pins > threshold
            const xs = standingPins.map(p => p.x).sort((a, b) => a - b);
            const maxGap = xs[xs.length - 1] - xs[0];
            return maxGap > LANE_WIDTH * 0.5; // If pins are spread over 50% of lane width
        })();

        if (standingBefore === 10 && knockedPins === 10) {
            eventType = 'strike';
            setMessage("STRIKE!");
            celebrationType = 'STRIKE';
        } else if (standingBefore < 10 && remainingStanding === 0) {
            eventType = 'spare';
            setMessage("SPARE!");
            celebrationType = 'SPARE';
        } else if (knockedPins === 0) {
            eventType = 'gutter';
            celebrationType = 'GUTTER';
        } else {
            setMessage(`${knockedPins} PINS`);
            if (isSplit && remainingStanding > 0) {
                celebrationType = 'SPLIT';
                setMessage("SPLIT!");
            }
        }


        const newRolls = [...currentPlayer.rolls, knockedPins];
        const tempFrames = calculateBowlingScore(newRolls);
        const totalScore = tempFrames[tempFrames.length - 1]?.cumulativeScore || 0;
        const updatedPlayers = [...players];

        // --- Enhanced Reward Logic for Human P1 ---
        let p1 = updatedPlayers[0];
        if (p1 && p1.id === 1 && p1.profile) {
            // Track consecutive strikes for streak bonus
            if (eventType === 'strike') {
                p1.consecutiveStrikes = (p1.consecutiveStrikes || 0) + 1;
            } else {
                p1.consecutiveStrikes = 0;
            }

            // Base rewards
            let xpGain = knockedPins * XP_PER_PIN;
            let moneyGain = knockedPins * WINNINGS_PER_POINT;

            // Event bonuses
            if (eventType === 'strike') { xpGain += XP_PER_STRIKE; moneyGain += 50; }
            else if (eventType === 'spare') { xpGain += XP_PER_SPARE; moneyGain += 20; }

            // Streak Multiplier (for consecutive strikes)
            const streakCount = p1.consecutiveStrikes;
            let streakMultiplier = 1.0;
            let streakName = '';
            if (streakCount >= 2) {
                const streakData: Record<number, { name: string; mult: number }> = {
                    2: { name: 'Double!', mult: 1.5 },
                    3: { name: 'Turkey!', mult: 2.0 },
                    4: { name: 'Four-Bagger!', mult: 2.5 },
                    5: { name: 'Five-Bagger!', mult: 3.0 },
                    6: { name: 'Six-Pack!', mult: 3.5 },
                    7: { name: 'Lucky Seven!', mult: 4.0 },
                    8: { name: 'Octuple!', mult: 4.5 },
                    9: { name: 'Golden Nine!', mult: 5.0 },
                    10: { name: 'PERFECT TEN!', mult: 6.0 },
                    11: { name: 'LEGENDARY!', mult: 8.0 },
                    12: { name: 'PERFECT GAME!', mult: 10.0 }
                };
                const data = streakData[Math.min(streakCount, 12)];
                if (data) {
                    streakMultiplier = data.mult;
                    streakName = data.name;
                    setMessage(`🔥 ${data.name} 🔥`);
                    if (streakCount === 3) celebrationType = 'TURKEY';
                    if (streakCount === 12) celebrationType = 'PERFECT';
                }
            }

            // Apply multiplier
            xpGain = Math.floor(xpGain * streakMultiplier);
            moneyGain = Math.floor(moneyGain * streakMultiplier);

            // Stage Bonus
            const stage = STAGES.find(s => s.id === currentStage) || STAGES[0];
            const stageMult = 1.0 + (stage.unlockLevel * 0.1); // Higher stages = more rewards
            xpGain = Math.floor(xpGain * stageMult);
            moneyGain = Math.floor(moneyGain * stageMult);

            // Crowd Control stat bonus (+5% per point)
            const crowdBonus = 1 + ((p1.profile.stats?.crowdControl || 0) * 0.05);
            xpGain = Math.floor(xpGain * crowdBonus);
            moneyGain = Math.floor(moneyGain * crowdBonus);

            // Update profile
            p1.profile = { ...p1.profile, xp: (p1.profile.xp || 0) + xpGain };
            p1.inventory = { ...p1.inventory, money: (p1.inventory.money || 0) + moneyGain };

            // --- Progression Logic ---
            const today = new Date().toISOString().split('T')[0];
            const inv = p1.inventory;

            // 1. Lifetime Stats initialization & update
            if (!inv.lifetimeStats) {
                inv.lifetimeStats = { totalStrikes: 0, totalSpares: 0, totalPinsKnocked: 0, gamesPlayed: 0, highScore: 0, bestStreak: 0, perfectGames: 0 };
            }
            const lStats = inv.lifetimeStats;
            lStats.totalPinsKnocked += knockedPins;
            if (eventType === 'strike') lStats.totalStrikes++;
            if (eventType === 'spare') lStats.totalSpares++;
            if (p1.consecutiveStrikes > lStats.bestStreak) lStats.bestStreak = p1.consecutiveStrikes;

            // 2. Daily Progress initialization & update
            if (!inv.dailyProgress || inv.dailyProgress.date !== today) {
                inv.dailyProgress = {
                    date: today,
                    strikesToday: 0,
                    sparesToday: 0,
                    pinsToday: 0,
                    gamesToday: 0,
                    highScoreToday: 0,
                    completedChallenges: []
                };
            }
            const daily = inv.dailyProgress;
            daily.pinsToday += knockedPins;
            if (eventType === 'strike') daily.strikesToday++;
            if (eventType === 'spare') daily.sparesToday++;

            // Check Daily Challenges completion
            DAILY_CHALLENGES.forEach(challenge => {
                if (daily.completedChallenges.includes(challenge.id)) return;
                let currentProg = 0;
                if (challenge.type === 'STRIKES') currentProg = daily.strikesToday;
                else if (challenge.type === 'SPARES') currentProg = daily.sparesToday;
                else if (challenge.type === 'PINS') currentProg = daily.pinsToday;

                if (currentProg >= challenge.goal) {
                    daily.completedChallenges.push(challenge.id);
                    inv.money += challenge.moneyReward;
                    p1.profile!.xp += challenge.xpReward;
                    setMessage(`🏆 CHALLENGE: ${challenge.name} 🏆`);
                }
            });

            // 3. Achievement Check
            if (!inv.unlockedAchievements) inv.unlockedAchievements = [];
            ACHIEVEMENTS.forEach(ach => {
                if (inv.unlockedAchievements!.includes(ach.id)) return;
                let currentProg = 0;
                if (ach.type === 'STRIKES') currentProg = lStats.totalStrikes;
                else if (ach.type === 'SPARES') currentProg = lStats.totalSpares;
                else if (ach.type === 'TOTAL_PINS') currentProg = lStats.totalPinsKnocked;
                else if (ach.type === 'STREAK') currentProg = lStats.bestStreak;
                else if (ach.type === 'LEVEL') currentProg = p1.profile!.level;

                if (currentProg >= ach.requirement && ach.type !== 'GAMES_PLAYED' && ach.type !== 'HIGH_SCORE') {
                    inv.unlockedAchievements!.push(ach.id);
                    inv.money += ach.moneyReward;
                    p1.profile!.xp += ach.xpReward;
                    setLastAchievement(ach);
                }
            });

            p1.inventory.profile = { ...p1.profile };

            // Particle effects
            if (eventType === 'strike') spawnImpactParticles(CANVAS_WIDTH / 2, HEAD_PIN_Y, 80 + (p1.consecutiveStrikes * 10), '#ffd32a');
            else if (eventType === 'spare') spawnImpactParticles(CANVAS_WIDTH / 2, HEAD_PIN_Y, 40, '#0fbcf9');

            // Check Level Up
            const currentLevel = p1.profile.level;
            const nextXp = LEVELS[currentLevel] || 999999;
            if (p1.profile.xp >= nextXp) {
                p1.profile.level++;
                p1.profile.statPoints += 2;
                p1.inventory.profile = { ...p1.profile };
                setShowLevelUp(true);
            }
            saveProgress(p1.inventory);
        }


        if (celebrationType) {
            setCelebration(celebrationType);
        }

        if (currentPlayerIdx === 0) {
            // Human player (P1) - CRITICAL: Use the locally updated p1 object to preserve XP/Money gains
            updatedPlayers[0] = { ...p1, rolls: newRolls, frames: tempFrames, score: totalScore };
        } else {
            // CPU players
            updatedPlayers[currentPlayerIdx] = { ...currentPlayer, rolls: newRolls, frames: tempFrames, score: totalScore };
        }
        setPlayers(updatedPlayers);
        triggerEvent(eventType, { pinsKnocked: knockedPins, totalScore });

        setCurrentGameState('BALL_RETURN');
        assets.ballReturnSoundRef.current?.play().catch(() => { });

        setTimeout(() => {
            if (updatedPlayers.every(player => isGameOver(player.frames))) {
                const mainPlayer = updatedPlayers.find(pl => pl.id === 1);
                if (mainPlayer && mainPlayer.profile && wager > 0) {
                    const targetScore = WAGER_TARGET_SCORE;
                    const won = mainPlayer.score >= targetScore;
                    if (won) {
                        mainPlayer.inventory.money += wager * 2;
                        mainPlayer.profile.xp += 100;
                        setMessage("🔥 WAGER WON! 🔥");
                        setCelebration('WAGER_WIN');
                    } else {
                        setMessage("💸 WAGER LOST... 💸");
                        setCelebration('WAGER_LOSS');
                    }
                    setLastWagerResult({ won, amount: wager });
                }

                // Final Game Over Progression Check
                if (mainPlayer && mainPlayer.profile && mainPlayer.inventory) {
                    const inv = mainPlayer.inventory;
                    const today = new Date().toISOString().split('T')[0];

                    if (!inv.lifetimeStats) {
                        inv.lifetimeStats = { totalStrikes: 0, totalSpares: 0, totalPinsKnocked: 0, gamesPlayed: 0, highScore: 0, bestStreak: 0, perfectGames: 0 };
                    }
                    if (!inv.dailyProgress || inv.dailyProgress.date !== today) {
                        inv.dailyProgress = { date: today, strikesToday: 0, sparesToday: 0, pinsToday: 0, gamesToday: 0, highScoreToday: 0, completedChallenges: [] };
                    }
                    if (!inv.unlockedAchievements) {
                        inv.unlockedAchievements = [];
                    }

                    const stats = inv.lifetimeStats;
                    const daily = inv.dailyProgress;

                    stats.gamesPlayed++;
                    daily.gamesToday++;
                    if (mainPlayer.score > stats.highScore) stats.highScore = mainPlayer.score;
                    if (mainPlayer.score > daily.highScoreToday) daily.highScoreToday = mainPlayer.score;

                    // Daily Challenges for score/games
                    DAILY_CHALLENGES.forEach(challenge => {
                        if (daily.completedChallenges.includes(challenge.id)) return;
                        let currentProg = 0;
                        if (challenge.type === 'GAMES') currentProg = daily.gamesToday;
                        else if (challenge.type === 'SCORE') currentProg = daily.highScoreToday;

                        if (currentProg >= challenge.goal) {
                            daily.completedChallenges.push(challenge.id);
                            inv.money += challenge.moneyReward;
                            mainPlayer.profile!.xp += challenge.xpReward;
                        }
                    });

                    // Achievements for score/games
                    ACHIEVEMENTS.forEach(ach => {
                        if (inv.unlockedAchievements!.includes(ach.id)) return;
                        let currentProg = 0;
                        if (ach.type === 'GAMES_PLAYED') currentProg = stats.gamesPlayed;
                        else if (ach.type === 'HIGH_SCORE') currentProg = stats.highScore;

                        if (currentProg >= ach.requirement) {
                            inv.unlockedAchievements!.push(ach.id);
                            inv.money += ach.moneyReward;
                            mainPlayer.profile!.xp += ach.xpReward;
                            setLastAchievement(ach);
                            assets.cheerSoundRef.current?.play().catch(() => { });
                        }
                    });

                    saveProgress(inv);
                }

                setWager(0);
                setCurrentGameState('GAME_OVER');
                triggerEvent('gameOver', { totalScore });
            } else {
                const lastF = tempFrames.find(f => f.rolls.length > 0 && (f.frameNumber === 10 || f.rolls.length < 2));
                let nextIdx = (currentPlayerIdx + 1) % players.length;
                if (determinePinReset(newRolls)) {
                    resetPins();
                } else {
                    const standing = pinsRef.current.filter(p => !p.isDown);
                    standing.forEach(p => { p.vx = 0; p.vy = 0; p.va = 0; p.wobble = 0; p.isDown = false; });
                    pinsRef.current = standing;
                    setPins(standing);
                    nextIdx = currentPlayerIdx;
                }
                setCurrentPlayerIdx(nextIdx);
                resetBall();
                setCurrentGameState('READY_TO_BOWL');
            }
            spectatorsRef.current.forEach(s => s.state = 'IDLE');
            setSpectators([...spectatorsRef.current]);
        }, 1500);
    };

    const determinePinReset = (currentRolls: number[]): boolean => {
        const fs = calculateBowlingScore(currentRolls);
        const lastF = fs.reverse().find(f => f.rolls.length > 0);
        if (!lastF) return true;
        if (lastF.frameNumber < 10) return lastF.isStrike || lastF.rolls.length === 2;
        const r = lastF.rolls;
        return (r.length === 1 && r[0] === 10) || (r.length === 2 && (r[0] === 10 || r[0] + r[1] >= 10)) || r.length === 3 || (r.length === 2 && r[0] + r[1] < 10);
    };

    const initPlayers = useCallback((mode: GameMode, cpu?: CpuPersonality) => {
        const inventory = loadProgress();
        const p1: Player = {
            id: 1,
            name: inventory.profile?.name || 'PLAYER 1',
            isCpu: false,
            profile: inventory.profile,
            rolls: [],
            frames: [],
            score: 0,
            inventory: inventory,
            consecutiveStrikes: 0
        };

        const newPlayers: Player[] = [p1];

        if (mode === 'TWO_PLAYER') {
            newPlayers.push({
                id: 2,
                name: 'PLAYER 2',
                isCpu: false,
                rolls: [],
                frames: [],
                score: 0,
                inventory: { money: 0, items: [] },
                consecutiveStrikes: 0
            });
        } else if (mode === 'VS_CPU' && cpu) {
            newPlayers.push({
                id: 2,
                name: cpu.name.toUpperCase(),
                isCpu: true,
                cpuProfile: cpu,
                rolls: [],
                frames: [],
                score: 0,
                inventory: { money: 0, items: [] },
                consecutiveStrikes: 0
            });
        }

        setPlayers(newPlayers);
        setCurrentPlayerIdx(0);
        setGameMode(mode);
    }, []);

    const startGame = (mode: GameMode, cpu?: CpuPersonality) => {
        initPlayers(mode, cpu);

        // Subtract wager if applicable
        if (wager > 0) {
            setPlayers(prev => {
                const next = [...prev];
                if (next[0] && next[0].id === 1) {
                    next[0].inventory.money -= wager;
                    saveProgress(next[0].inventory);
                }
                return next;
            });
        }

        resetPins();
        resetBall();
        setLastWagerResult(null);
        setCurrentGameState(mode === 'SOLO' ? 'TUTORIAL' : 'READY_TO_BOWL');
        setTutorialStep(0);
        triggerEvent('gameStart');
    };



    const cheatMoney = useCallback(() => {
        const inv = loadProgress();
        inv.money += 1000;
        saveProgress(inv);
        // Refresh local player state
        setPlayers(prev => {
            const next = [...prev];
            if (next[0]) next[0].inventory = inv;
            return next;
        });
    }, []);

    // Calculate XP Progress for UI
    const scorePlayer = players[0];
    const currentXp = scorePlayer?.profile?.xp || 0;
    const currentLevel = scorePlayer?.profile?.level || 1;
    const nextLevelXp = LEVELS[currentLevel] || 999999;
    const prevLevelXp = LEVELS[currentLevel - 1] || 0;
    const xpProgress = Math.min(100, Math.max(0, ((currentXp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100));


    return {
        currentGameState, setCurrentGameState, throwStep, nextThrowStep, setThrowStep, gameMode, players, currentPlayerIdx, ball, pins, trail, particles, spectators, message, impactEffectText, showImpactEffect, showLevelUp, setShowLevelUp, isMobile, isZoomed,
        userWeight, userSpin, userMaterial, laneCondition, setUserWeight, setUserSpin, setUserMaterial, setLaneCondition,
        aimOscillation, powerOscillation, xpProgress, nextLevelXp,
        startGame, startThrowSequence, rollBall, cheatMoney,
        updateProfile: (p: PlayerProfile) => { const inv = loadProgress(); inv.profile = p; saveProgress(inv); },
        setBallPosition: (x: number) => {
            const limit = (CANVAS_WIDTH - LANE_WIDTH) / 2 + BALL_RADIUS;
            ballRef.current = { ...ballRef.current, x: Math.max(limit, Math.min(CANVAS_WIDTH - limit, x)) };
            setBall({ ...ballRef.current });
        },
        setBallAngle: (angle: number) => {
            ballRef.current = { ...ballRef.current, angle };
            setBall({ ...ballRef.current });
        },
        tutorialStep, advanceTutorial: () => setTutorialStep(prev => prev + 1), endTutorial: () => { setTutorialStep(-1); setCurrentGameState('READY_TO_BOWL'); },
        screenShake,
        canvasRef,
        celebration, setCelebration,
        currentStage, setCurrentStage,
        wager, setWager,
        lastWagerResult,
        lastAchievement, setLastAchievement
    };
}
