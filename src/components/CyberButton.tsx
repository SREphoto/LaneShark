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
        sm: "px-3 py-1.5 text-[8px] border-2",
        md: "px-5 py-2.5 text-[10px] border-4",
        lg: "px-8 py-4 text-sm border-4"
    };

    const variantStyles = {
        primary: "bg-blue-900 border-blue-400 text-white shadow-[4px_4px_0_#000]",
        secondary: "bg-purple-900 border-purple-400 text-white shadow-[4px_4px_0_#000]",
        success: "bg-emerald-900 border-emerald-400 text-white shadow-[4px_4px_0_#000]",
        danger: "bg-red-900 border-red-400 text-white shadow-[4px_4px_0_#000]",
        gold: "bg-yellow-900 border-yellow-400 text-white shadow-[4px_4px_0_#000]",
        glass: "bg-gray-900 border-gray-400 text-white shadow-[4px_4px_0_#000]"
    };

    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (buttonRef.current && glowColor) {
            buttonRef.current.style.setProperty('--glow-color', `${glowColor}40`);
            buttonRef.current.style.setProperty('--border-color', `${glowColor}80`);
            buttonRef.current.style.boxShadow = '0 0 20px var(--glow-color)';
            buttonRef.current.style.borderColor = 'var(--border-color)';
        } else if (buttonRef.current) {
            buttonRef.current.style.removeProperty('--glow-color');
            buttonRef.current.style.removeProperty('--border-color');
            buttonRef.current.style.boxShadow = '';
            buttonRef.current.style.borderColor = '';
        }
    }, [glowColor, variant]);

    return (
        <button
            ref={buttonRef}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
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
