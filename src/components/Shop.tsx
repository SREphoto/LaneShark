/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SHOP_ITEMS } from '../data/shopItems';
import { UserInventory, ShopCategory } from '../types';
import CharacterPreview from './CharacterPreview';

interface ShopProps {
    inventory: UserInventory;
    onBuy: (itemId: string, cost: number) => void;
    onEquip: (itemId: string) => void;
    onCheatMoney?: () => void;
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ inventory, onBuy, onEquip, onCheatMoney, onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [previewItemId, setPreviewItemId] = useState<string | null>(null);

    const categories: Array<ShopCategory | 'ALL'> = ['ALL', 'BALL', 'SHOES', 'CLOTHING', 'GEAR', 'ACCESSORY'];

    const categoryIcons = {
        'ALL': '🎯',
        'BALL': '🎳',
        'SHOES': '👟',
        'CLOTHING': '👕',
        'GEAR': '🧤',
        'ACCESSORY': '⭐'
    };

    const filteredItems = SHOP_ITEMS.filter(item => {
        const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const ownedCount = SHOP_ITEMS.filter(item => inventory.items.includes(item.id)).length;
    const totalCount = SHOP_ITEMS.length;
    const collectionProgress = Math.round((ownedCount / totalCount) * 100);

    const activePreviewId = previewItemId || inventory.profile?.equippedOutfitId;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in bg-black/80 backdrop-blur-xl pointer-events-auto">
            {/* Backdrop Click */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Shop layout: Character (Left) + Items (Right) */}
            <div className="relative w-full max-w-6xl h-[90vh] flex gap-4 animate-slide-up">

                {/* PREVIEW PANEL */}
                <div className="hidden lg:flex flex-col w-80 glass-panel p-6 border-white/10 shrink-0">
                    <h3 className="text-xl font-['Press_Start_2P'] gradient-text mb-8 text-center">PREVIEW</h3>

                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-3xl animate-pulse" />
                        <CharacterPreview equippedOutfitId={activePreviewId || undefined} width={250} height={400} scale={3} />

                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-['Press_Start_2P'] text-gray-400 mb-2">CURRENT STYLE</p>
                            <p className="text-xs font-['Press_Start_2P'] text-yellow-500">
                                {SHOP_ITEMS.find(i => i.id === activePreviewId)?.name || 'DEFAULT'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-[8px] font-['Press_Start_2P'] leading-relaxed text-gray-400">
                            * Previews show how you'll look in the arena. Equipping items grants stat bonuses.
                        </p>
                    </div>
                </div>

                {/* ITEMS PANEL */}
                <div className="flex-1 flex flex-col glass-panel overflow-hidden border-white/10">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 bg-black/20">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-['Press_Start_2P'] text-white mb-2">🏪 PRO SHOP</h2>
                                <p className="text-[10px] text-gray-400 font-['Press_Start_2P']">
                                    Collection: {ownedCount}/{totalCount} ({collectionProgress}%)
                                </p>
                            </div>
                            <button onClick={onClose} className="text-2xl text-red-500 hover:scale-110 transition-transform">✕</button>
                        </div>

                        {/* Money & Stats */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between px-6">
                                <span className="text-[8px] font-['Press_Start_2P'] text-emerald-400">BANK BALANCE:</span>
                                <span className="text-xl font-['Press_Start_2P'] gold-text">${inventory.money.toLocaleString()}</span>
                            </div>
                            {onCheatMoney && (
                                <button onClick={onCheatMoney} className="bg-purple-600 hover:bg-purple-500 px-4 py-3 rounded-xl text-[10px] font-['Press_Start_2P'] text-white transition-all shadow-purple-glow animate-pulse-glow">
                                    💰 +1K
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="px-6 py-4 flex gap-2 overflow-x-auto bg-black/10 shrink-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2.5 rounded-lg text-[9px] font-['Press_Start_2P'] transition-all shrink-0 ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border border-white/20'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                            >
                                {categoryIcons[cat]} {cat}
                            </button>
                        ))}
                    </div>

                    {/* Items Scroll Area */}
                    <div className="flex-1 p-6 overflow-y-auto custom-shop-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredItems.map(item => {
                                const isOwned = inventory.items.includes(item.id);
                                const isEquipped = inventory.profile?.equippedOutfitId === item.id || inventory.profile?.equippedBallId === item.id;
                                const canAfford = inventory.money >= item.price;
                                const isClothing = item.category === 'CLOTHING' || item.category === 'BALL';

                                return (
                                    <div
                                        key={item.id}
                                        onMouseEnter={() => item.category === 'CLOTHING' && setPreviewItemId(item.id)}
                                        onMouseLeave={() => setPreviewItemId(null)}
                                        className={`p-4 rounded-xl border-2 transition-all group ${isOwned ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5 hover:border-blue-500/40 hover:bg-white/10'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-[11px] font-['Press_Start_2P'] text-yellow-400 leading-tight group-hover:text-yellow-300">
                                                {item.name}
                                            </h3>
                                            {isEquipped && (
                                                <div className="flex items-center gap-1 bg-blue-600/20 border border-blue-500/50 px-2 py-1 rounded text-blue-300">
                                                    <span className="text-[8px] animate-pulse">●</span>
                                                    <span className="text-[7px] font-['Press_Start_2P']">EQUIPPED</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-[9px] font-['Press_Start_2P'] text-gray-500 mb-3 leading-relaxed h-10 overflow-hidden">
                                            {item.description}
                                        </p>

                                        <div className="p-2 bg-blue-900/20 border border-blue-500/20 rounded-lg mb-4">
                                            <p className="text-[8px] font-['Press_Start_2P'] text-blue-300">✨ {item.effectDescription}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-['Press_Start_2P'] gold-text">${item.price.toLocaleString()}</span>

                                            {isOwned ? (
                                                <button
                                                    onClick={() => onEquip(item.id)}
                                                    className={`px-3 py-2 rounded text-[8px] font-['Press_Start_2P'] transition-all ${isEquipped ? 'bg-red-900/40 text-red-400 hover:bg-red-800' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-glow'}`}
                                                >
                                                    {isEquipped ? 'UNEQUIP' : 'EQUIP'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onBuy(item.id, item.price)}
                                                    disabled={!canAfford}
                                                    className={`px-3 py-2 rounded text-[8px] font-['Press_Start_2P'] transition-all ${canAfford ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-glow' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                                                >
                                                    {canAfford ? 'BUY' : 'LOCKED'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-black/40 border-t border-white/10 flex justify-center">
                        <button onClick={onClose} className="btn-danger w-full max-w-xs py-3 text-[10px] font-['Press_Start_2P']">EXIT PRO SHOP</button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-shop-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-shop-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-shop-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); border-radius: 10px; }
                .custom-shop-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
            `}</style>
        </div>
    );
};

export default Shop;
