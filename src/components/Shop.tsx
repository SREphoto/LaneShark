
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { SHOP_ITEMS } from '../data/shopItems';
import { UserInventory } from '../types';

interface ShopProps {
    inventory: UserInventory;
    onBuy: (itemId: string, cost: number) => void;
    onEquip: (itemId: string) => void;
    onCheatMoney?: () => void;
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ inventory, onBuy, onEquip, onCheatMoney, onClose }) => {
    return (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-center text-white p-4 font-['Press_Start_2P']">
            <div className="w-full max-w-2xl border-4 border-yellow-500 bg-gray-800 p-6 shadow-2xl relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-red-500 text-xl hover:text-white"
                >
                    X
                </button>
                
                <h2 className="text-2xl text-yellow-400 text-center mb-2 text-shadow">PRO SHOP</h2>
                <div className="flex justify-center items-center gap-4 mb-6">
                    <div className="text-center text-green-400">
                        BANK: ${inventory.money}
                    </div>
                    {onCheatMoney && (
                        <button 
                            onClick={onCheatMoney}
                            className="bg-purple-600 text-white text-[7px] px-2 py-1 border border-white hover:bg-purple-500 animate-pulse"
                        >
                            + CHEAT $1000
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-shop-scrollbar">
                    {SHOP_ITEMS.map(item => {
                        const isOwned = inventory.items.includes(item.id);
                        const canAfford = inventory.money >= item.price;
                        const isEquipped = inventory.profile?.equippedOutfitId === item.id;
                        const isClothing = item.category === 'CLOTHING';

                        return (
                            <div key={item.id} className={`border-2 p-3 flex flex-col justify-between ${isOwned ? 'border-green-600 bg-gray-900 opacity-90 shadow-inner' : 'border-gray-500 bg-gray-700'}`}>
                                <div>
                                    <h3 className="text-sm text-yellow-200 mb-1">{item.name}</h3>
                                    <p className="text-[10px] text-gray-400 mb-2">{item.description}</p>
                                    <p className="text-[10px] text-blue-300 mb-2">{item.effectDescription}</p>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-yellow-400">${item.price}</span>
                                    {isOwned ? (
                                        isClothing ? (
                                            <button 
                                                onClick={() => onEquip(item.id)}
                                                disabled={isEquipped}
                                                className={`text-xs px-3 py-1 border-2 ${isEquipped ? 'bg-gray-500 border-gray-400 text-white cursor-default' : 'bg-blue-600 border-white hover:bg-blue-500 shadow-[2px_2px_0px_#000]'}`}
                                            >
                                                {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                                            </button>
                                        ) : (
                                            <span className="text-green-500 text-[10px] font-bold">OWNED</span>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => onBuy(item.id, item.price)}
                                            disabled={!canAfford}
                                            className={`text-xs px-3 py-1 border-2 ${canAfford ? 'bg-green-600 border-green-400 hover:bg-green-500 shadow-[2px_2px_0px_#000]' : 'bg-gray-600 border-gray-500 cursor-not-allowed'}`}
                                        >
                                            BUY
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-6 text-center">
                    <button onClick={onClose} className="bg-red-600 text-white border-2 border-white px-6 py-2 hover:bg-red-500 shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                        EXIT SHOP
                    </button>
                </div>
            </div>
            <style>{`
                .custom-shop-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-shop-scrollbar::-webkit-scrollbar-track { background: #1a202c; }
                .custom-shop-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border: 1px solid white; }
            `}</style>
        </div>
    );
};

export default Shop;
