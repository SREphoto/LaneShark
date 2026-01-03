/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'gold' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    icon?: string;
    glowColor?: string;
}

const CyberButton: React.FC<CyberButtonProps> = ({
    variant = 'primary',
    size = 'md',
    label,
    icon,
    className = '',
    glowColor,
    ...props
}) => {
    const baseStyles = "relative inline-flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 font-['Press_Start_2P'] uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group";

    const sizeStyles = {
        sm: "px-3 py-1.5 text-[8px] rounded-lg",
        md: "px-5 py-2.5 text-[10px] rounded-xl",
        lg: "px-8 py-4 text-sm rounded-2xl"
    };

    const variantStyles = {
        primary: "bg-blue-600/20 border border-blue-500/50 text-blue-200 hover:bg-blue-600/40 hover:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
        secondary: "bg-purple-600/20 border border-purple-500/50 text-purple-200 hover:bg-purple-600/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
        success: "bg-emerald-600/20 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/40 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        danger: "bg-red-600/20 border border-red-500/50 text-red-200 hover:bg-red-600/40 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
        gold: "bg-yellow-600/20 border border-yellow-500/50 text-yellow-200 hover:bg-yellow-600/40 hover:border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
        glass: "bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/30"
    };

    return (
        <button
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            style={{
                boxShadow: glowColor ? `0 0 20px ${glowColor}40` : undefined,
                borderColor: glowColor ? `${glowColor}80` : undefined
            }}
            {...props}
        >
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-white/5 -translate-y-full animate-scanline-fast" />
            </div>

            {/* Content */}
            {icon && <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>}
            {label && <span className="relative z-10">{label}</span>}

            {/* Shine */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
        </button>
    );
};

export default CyberButton;
