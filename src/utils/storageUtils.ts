/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { UserInventory } from '../types';

const STORAGE_KEY = 'STRIKE_KING_DATA';

const DEFAULT_INVENTORY: UserInventory = {
    money: 0,
    items: []
};

export function saveProgress(inventory: UserInventory) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
        console.error("Failed to save progress", e);
    }
}

export function loadProgress(): UserInventory {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to load progress", e);
    }
    return DEFAULT_INVENTORY;
}
