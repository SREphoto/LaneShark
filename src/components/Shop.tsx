
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SHOP_ITEMS } from '../data/shopItems';
import { UserInventory, ShopCategory } from '../types';

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

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80"
                style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                onClick={onClose}
            />

            {/* Shop Container */}
            <div className="relative w-full max-w-5xl h-[85vh] glass-panel animate-slide-up">
                {/* Header */}
                <div className="relative p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-3xl font-['Press_Start_2P'] gradient-text mb-2">
                                🏪 PRO SHOP
                            </h2>
                            <p className="text-xs text-gray-400 font-['Press_Start_2P']">
                                Collection: {ownedCount}/{totalCount} ({collectionProgress}%)
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-3xl hover:scale-110 transition-transform text-red-400 hover:text-red-300"
                            style={{ fontFamily: 'Press Start 2P' }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Money Display */}
                    <div className="flex items-center gap-4">
                        <div
                            className="flex-1 px-6 py-3 rounded-lg border-2 border-emerald-500/50 text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)'
                            }}
                        >
                            <div className="text-xs text-gray-400 mb-1 font-['Press_Start_2P']">YOUR BANK</div>
                            <div className="text-2xl gold-text font-['Press_Start_2P']">
                                ${inventory.money.toLocaleString()}
                            </div>
                        </div>

                        {onCheatMoney && (
                            <button
                                onClick={onCheatMoney}
                                className="px-4 py-3 rounded-lg border-2 border-purple-500 text-white text-xs font-['Press_Start_2P'] hover:bg-purple-500/20 transition-all animate-pulse-glow"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                                }}
                            >
                                💰 +$1000
                            </button>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="🔍 Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-white/20 bg-white/5 text-white placeholder-gray-500 font-['Press_Start_2P'] text-xs focus:border-purple-500 focus:outline-none transition-all"
                            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="px-6 py-4 border-b border-white/10 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-3 rounded-lg font-['Press_Start_2P'] text-xs transition-all ${selectedCategory === cat
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-white/30 shadow-lg'
                                        : 'bg-white/5 text-gray-400 border-2 border-white/10 hover:border-purple-500/50 hover:text-white'
                                    }`}
                                style={{
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)'
                                }}
                            >
                                {categoryIcons[cat]} {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items Grid */}
                <div className="p-6 overflow-y-auto custom-shop-scrollbar" style={{ height: 'calc(100% - 340px)' }}>
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-gray-400 font-['Press_Start_2P'] text-sm">No items found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map(item => {
                                const isOwned = inventory.items.includes(item.id);
                                const canAfford = inventory.money >= item.price;
                                const isEquipped = inventory.profile?.equippedOutfitId === item.id;
                                const isClothing = item.category === 'CLOTHING';

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border-2 transition-all ${isOwned
                                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                                : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                                            }`}
                                        style={{
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)'
                                        }}
                                    >
                                        {/* Item Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-['Press_Start_2P'] text-yellow-400 mb-2 leading-relaxed">
                                                    {item.name}
                                                </h3>
                                                {isOwned && (
                                                    <span className="inline-block px-2 py-1 bg-emerald-500 text-white text-[8px] font-['Press_Start_2P'] rounded">
                                                        ✓ OWNED
                                                    </span>
                                                )}
                                                {isEquipped && (
                                                    <span className="inline-block px-2 py-1 bg-purple-500 text-white text-[8px] font-['Press_Start_2P'] rounded ml-1">
                                                        ★ EQUIPPED
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-[10px] font-['Press_Start_2P'] text-gray-400 mb-2 leading-relaxed">
                                            {item.description}
                                        </p>

                                        {/* Effect */}
                                        <div className="mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                            <p className="text-[9px] font-['Press_Start_2P'] text-blue-300 leading-relaxed">
                                                ✨ {item.effectDescription}
                                            </p>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg gold-text font-['Press_Start_2P']">
                                                    ${item.price.toLocaleString()}
                                                </span>
                                            </div>

                                            {isOwned ? (
                                                isClothing ? (
                                                    <button
                                                        onClick={() => onEquip(item.id)}
                                                        disabled={isEquipped}
                                                        className={`px-4 py-2 rounded-lg text-[10px] font-['Press_Start_2P'] transition-all ${isEquipped
                                                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:scale-105'
                                                            }`}
                                                    >
                                                        {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                                                    </button>
                                                ) : (
                                                    <div className="text-emerald-400 text-xs font-['Press_Start_2P']">
                                                        ✓
                                                    </div>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => onBuy(item.id, item.price)}
                                                    disabled={!canAfford}
                                                    className={`px-4 py-2 rounded-lg text-[10px] font-['Press_Start_2P'] transition-all ${canAfford
                                                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg hover:scale-105'
                                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {canAfford ? 'BUY NOW' : 'TOO POOR'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10"
                    style={{
                        background: 'linear-gradient(to top, rgba(15, 12, 41, 0.95), rgba(15, 12, 41, 0.8))',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)'
                    }}
                >
                    <button
                        onClick={onClose}
                        className="w-full py-3 btn-danger text-sm font-['Press_Start_2P']"
                    >
                        EXIT SHOP
                    </button>
                </div>
            </div>

            <style>{`
                .custom-shop-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-shop-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 12, 41, 0.5);
                    border-radius: 4px;
                }
                .custom-shop-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .custom-shop-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                }
            `}</style>
        </div>
    );
};

export default Shop;
