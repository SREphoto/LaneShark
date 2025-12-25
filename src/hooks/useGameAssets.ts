/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect, useRef } from 'react';
import { AssetsLoaded } from '../types';
import { SOUNDS } from '../constants';

export function useGameAssets() {
    const ballImageRef = useRef(new Image());
    const [assetsLoaded, setAssetsLoaded] = useState<AssetsLoaded>({ ball: false, all: false });

    const pinHitSoundRef = useRef<HTMLAudioElement | null>(null);
    const strikeSoundRef = useRef<HTMLAudioElement | null>(null);
    const ballReturnSoundRef = useRef<HTMLAudioElement | null>(null);
    const clapSoundRef = useRef<HTMLAudioElement | null>(null);
    const awwSoundRef = useRef<HTMLAudioElement | null>(null);
    const cheerSoundRef = useRef<HTMLAudioElement | null>(null);
    const splashSoundRef = useRef<HTMLAudioElement | null>(null);
    const footstepsSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload sounds
        const loadAudio = (src: string) => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            return audio;
        };

        pinHitSoundRef.current = loadAudio(SOUNDS.PIN_HIT);
        strikeSoundRef.current = loadAudio(SOUNDS.STRIKE);
        ballReturnSoundRef.current = loadAudio(SOUNDS.RETURN);
        clapSoundRef.current = loadAudio(SOUNDS.CLAP);
        awwSoundRef.current = loadAudio(SOUNDS.AWW);
        cheerSoundRef.current = loadAudio(SOUNDS.CHEER);
        splashSoundRef.current = loadAudio(SOUNDS.SPLASH_CHIME);
        footstepsSoundRef.current = loadAudio(SOUNDS.FOOTSTEPS);
        // Reduce footsteps volume
        if(footstepsSoundRef.current) footstepsSoundRef.current.volume = 0.5;

        ballImageRef.current.onload = () => setAssetsLoaded({ ball: true, all: true });
        ballImageRef.current.onerror = () => setAssetsLoaded({ ball: false, all: true }); 

        ballImageRef.current.src = 'https://storage.googleapis.com/gemini-95-icons/cricketball.png';
    }, []);

    return {
        assetsLoaded,
        ballImageRef,
        pinHitSoundRef,
        strikeSoundRef,
        ballReturnSoundRef,
        clapSoundRef,
        awwSoundRef,
        cheerSoundRef,
        splashSoundRef,
        footstepsSoundRef
    };
}
