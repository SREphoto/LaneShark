/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AvatarGeneratorProps {
    onAvatarGenerated: (base64Image: string) => void;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({ onAvatarGenerated }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateAvatar = async () => {
        if (!selectedImage) return;

        setIsGenerating(true);
        setError(null);

        try {
            // API Key Check for gemini-3-pro-image-preview
            if (!window.aistudio?.hasSelectedApiKey) {
               // Fallback / Safety if the window object isn't ready
               console.warn("window.aistudio not found");
            } else {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if(!hasKey) {
                    await window.aistudio.openSelectKey();
                }
            }

            // Create new instance with latest key
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Extract base64 data (remove header)
            const base64Data = selectedImage.split(',')[1];
            const mimeType = selectedImage.split(';')[0].split(':')[1];

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: {
                    parts: [
                        { 
                            inlineData: { 
                                mimeType: mimeType, 
                                data: base64Data 
                            } 
                        },
                        { 
                            text: "Transform this person's face into a cool 16-bit retro arcade video game character portrait. Keep the facial features recognizable but stylized in pixel art. Colorful neon bowling alley background. Head and shoulders only." 
                        }
                    ]
                },
                config: {
                    imageConfig: {
                        aspectRatio: "1:1",
                        imageSize: "1K"
                    }
                }
            });

            // Extract image from response
            let generatedImage = null;
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        generatedImage = `data:image/png;base64,${part.inlineData.data}`;
                        break;
                    }
                }
            }

            if (generatedImage) {
                onAvatarGenerated(generatedImage);
                setSelectedImage(null); // Clear selection to show result
            } else {
                setError("Failed to generate image. Please try again.");
            }

        } catch (e: any) {
            console.error("Avatar Gen Error:", e);
            const errStr = e.toString();
            
            if (errStr.includes("403") || errStr.includes("PERMISSION_DENIED")) {
                setError("Permission Denied. Please select a valid API key.");
                if (window.aistudio) await window.aistudio.openSelectKey();
            } else if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
                setError("Quota Exceeded. Please select a paid API key (Gemini 3 Pro).");
                if (window.aistudio) await window.aistudio.openSelectKey();
            } else if (errStr.includes("Requested entity was not found")) {
                setError("Key Error. Please select a valid API key.");
                if (window.aistudio) await window.aistudio.openSelectKey();
            } else {
                setError("Error generating avatar. Make sure you have a valid paid API key selected.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-gray-800 p-4 border-2 border-blue-500 mb-4 w-full">
            <h3 className="text-sm text-yellow-400 font-['Press_Start_2P'] mb-2">AI AVATAR CREATOR</h3>
            <p className="text-[10px] text-gray-400 mb-2">Upload a selfie to generate a custom pixel-art bowler!</p>
            
            {!selectedImage && (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-700 text-white text-xs py-2 border border-blue-400 hover:bg-blue-600 font-['Press_Start_2P']"
                >
                    UPLOAD PHOTO
                </button>
            )}

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />

            {selectedImage && (
                <div className="flex flex-col items-center mt-2">
                    <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover border-2 border-white mb-2" />
                    
                    {isGenerating ? (
                        <div className="text-yellow-400 text-xs animate-pulse font-['Press_Start_2P']">GENERATING...</div>
                    ) : (
                        <div className="flex gap-2 w-full">
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="flex-1 bg-gray-600 text-white text-[10px] py-2 border border-gray-400"
                            >
                                CANCEL
                            </button>
                            <button 
                                onClick={generateAvatar}
                                className="flex-1 bg-green-600 text-white text-[10px] py-2 border border-green-400 hover:bg-green-500"
                            >
                                GENERATE
                            </button>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-2 text-red-400 text-[10px]">{error}</div>
            )}
             <div className="mt-2 text-[9px] text-gray-500">
                Requires Paid API Key (Gemini 3 Pro)
            </div>
        </div>
    );
};

export default AvatarGenerator;