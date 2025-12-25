
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { decodeUsed, decodeAudioDataUsed } from '../utils/audioUtils';
import { createPromptForLiveCommentary } from '../utils/commentaryUtils';
import { GameContextForCommentary, VoicePersona } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Custom hook to manage all Gemini Live API interactions for commentary.
 */
export function useLiveCommentary() {
    const [commentaryStatus, setCommentaryStatus] = useState('');
    const [volume, setVolume] = useState(0.8);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const liveSessionRef = useRef<any | null>(null);
    const isLiveSessionReadyRef = useRef(false);
    const nextStartTimeRef = useRef(0);
    const isAudioPlayingRef = useRef(false);
    
    const initAudioContext = useCallback(async () => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') return;
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            gainNodeRef.current = audioCtxRef.current.createGain();
            gainNodeRef.current.connect(audioCtxRef.current.destination);
        }
        if (audioCtxRef.current.state === 'suspended') {
            try { await audioCtxRef.current.resume(); } catch (e) { console.warn("AudioContext resume failed:", e); throw e; }
        }
    }, []);

    const updateVolume = useCallback((newVolume: number) => {
        setVolume(newVolume);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVolume;
        }
    }, []);

    const initLiveSession = useCallback(async (persona: VoicePersona) => {
        // Close existing session if any
        if (liveSessionRef.current) { 
            try { await liveSessionRef.current.close(); } catch (e) {} 
            liveSessionRef.current = null; 
            isLiveSessionReadyRef.current = false; 
        }

        try { await initAudioContext(); } catch (e: any) { setCommentaryStatus(`⚠️ Audio Err`); throw e; }

        nextStartTimeRef.current = audioCtxRef.current!.currentTime;
        isAudioPlayingRef.current = false;

        const modelName = 'gemini-2.5-flash-native-audio-preview-09-2025';

        try {
            setCommentaryStatus(`🔌 Connecting ${persona.name}...`);
            const session = await ai.live.connect({
                model: modelName,
                callbacks: {
                    onopen: () => { isLiveSessionReadyRef.current = true; setCommentaryStatus(`🎙️ ${persona.name} Ready`); },
                    onmessage: async (message: any) => {
                        const modelTurn = message.serverContent?.modelTurn;
                        if (modelTurn) {
                            const audioPart = modelTurn.parts.find((p: any) => p.inlineData?.mimeType?.startsWith('audio/'));
                            if (audioPart?.inlineData?.data && audioCtxRef.current?.state === 'running') {
                                if (!isAudioPlayingRef.current) {
                                     nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtxRef.current.currentTime);
                                }
                                isAudioPlayingRef.current = true;

                                const audioBytes = decodeUsed(audioPart.inlineData.data);
                                const audioBuffer = await decodeAudioDataUsed(audioBytes, audioCtxRef.current, 24000, 1);
                                const source = audioCtxRef.current.createBufferSource();
                                source.buffer = audioBuffer; 
                                source.connect(gainNodeRef.current!);

                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                
                                source.onended = () => { isAudioPlayingRef.current = false; };
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => { isLiveSessionReadyRef.current = false; setCommentaryStatus(`⚠️ Live Err`); },
                    onclose: () => { isLiveSessionReadyRef.current = false; setCommentaryStatus("🔌 Live Closed"); },
                },
                config: { 
                    systemInstruction: persona.systemInstruction, 
                    responseModalities: [Modality.AUDIO], 
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceName } } } 
                },
            });
            liveSessionRef.current = session;
        } catch (e: any) { console.error("Live connect error:", e); setCommentaryStatus(`⚠️ Live Connect Err`); throw e; }
    }, [initAudioContext]);

    const triggerDynamicCommentary = useCallback(async (context: GameContextForCommentary): Promise<boolean> => {
        if (!process.env.API_KEY || !liveSessionRef.current || !isLiveSessionReadyRef.current) { return false; }
        try {
            const promptText = await createPromptForLiveCommentary(context);
            if (promptText) {
                await liveSessionRef.current.sendRealtimeInput({ text: promptText });
                return true;
            }
            return false;
        } catch (error: any) {
            console.error("triggerDynamicCommentary: Error sending prompt:", error);
            return false;
        }
    }, []);

    return {
        commentaryStatus,
        volume,
        setVolume: updateVolume,
        initLiveSession,
        triggerDynamicCommentary
    };
}
