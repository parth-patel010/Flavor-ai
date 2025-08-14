// Grocery price data management for Recipe Cost Calculator
// Handles API integration and fallback pricing data

// Configuration for grocery store APIs
const API_CONFIG = {
    // Walmart API (example - would need actual API key)
    walmart: {
        baseUrl: 'https://api.walmart.com/v3/items/search',
        apiKey: process.env.WALMART_API_KEY || '',
        enabled: false // Disabled by default until API key is provided
    },
    // Kroger API (example - would need actual API key)
    kroger: {
        baseUrl: 'https://api.kroger.com/v1/products',
        apiKey: process.env.KROGER_API_KEY || '',
        enabled: false // Disabled by default until API key is provided
    },
    // Local grocery store API (example)
    local: {
        baseUrl: process.env.LOCAL_GROCERY_API_URL || '',
        apiKey: process.env.LOCAL_GROCERY_API_KEY || '',
        enabled: false // Disabled by default until API key is provided
    }
};

// Enhanced fallback price database with regional variations
const REGIONAL_PRICES = {
    'US-East': {
        'chicken breast': { price: 3.99, unit: 'lb', category: 'protein', store: 'average' },
        'ground beef': { price: 4.99, unit: 'lb', category: 'protein', store: 'average' },
        'salmon': { price: 12.99, unit: 'lb', category: 'protein', store: 'average' },
        'eggs': { price: 3.99, unit: 'dozen', category: 'protein', store: 'average' },
        'milk': { price: 3.99, unit: 'gallon', category: 'dairy', store: 'average' },
        'bread': { price: 2.99, unit: 'loaf', category: 'grain', store: 'average' },
        'rice': { price: 1.99, unit: 'lb', category: 'grain', store: 'average' },
        'onion': { price: 1.49, unit: 'lb', category: 'vegetable', store: 'average' },
        'tomato': { price: 2.99, unit: 'lb', category: 'vegetable', store: 'average' },
        'banana': { price: 0.59, unit: 'lb', category: 'fruit', store: 'average' },
        'apple': { price: 1.99, unit: 'lb', category: 'fruit', store: 'average' }
    },
    'US-West': {
        'chicken breast': { price: 4.49, unit: 'lb', category: 'protein', store: 'average' },
        'ground beef': { price: 5.49, unit: 'lb', category: 'protein', store: 'average' },
        'salmon': { price: 14.99, unit: 'lb', category: 'protein', store: 'average' },
        'eggs': { price: 4.49, unit: 'dozen', category: 'protein', store: 'average' },
        'milk': { price: 4.49, unit: 'gallon', category: 'dairy', store: 'average' },
        'bread': { price: 3.49, unit: 'loaf', category: 'grain', store: 'average' },
        'rice': { price: 2.49, unit: 'lb', category: 'grain', store: 'average' },
        'onion': { price: 1.79, unit: 'lb', category: 'vegetable', store: 'average' },
        'tomato': { price: 3.49, unit: 'lb', category: 'vegetable', store: 'average' },
        'banana': { price: 0.69, unit: 'lb', category: 'fruit', store: 'average' },
        'apple': { price: 2.49, unit: 'lb', category: 'fruit', store: 'average' }
    },
    'US-Midwest': {
        'chicken breast': { price: 3.49, unit: 'lb', category: 'protein', store: 'average' },
        'ground beef': { price: 4.49, unit: 'lb', category: 'protein', store: 'average' },
        'salmon': { price: 11.99, unit: 'lb', category: 'protein', store: 'average' },
        'eggs': { price: 3.49, unit: 'dozen', category: 'protein', store: 'average' },
        'milk': { price: 3.49, unit: 'gallon', category: 'dairy', store: 'average' },
        'bread': { price: 2.49, unit: 'loaf', category: 'grain', store: 'average' },
        'rice': { price: 1.79, unit: 'lb', category: 'grain', store: 'average' },
        'onion': { price: 1.29, unit: 'lb', category: 'vegetable', store: 'average' },
        'tomato': { price: 2.49, unit: 'lb', category: 'vegetable', store: 'average' },
        'banana': { price: 0.49, unit: 'lb', category: 'fruit', store: 'average' },
        'apple': { price: 1.79, unit: 'lb', category: 'fruit', store: 'average' }
    },
    'US-South': {
        'chicken breast': { price: 3.79, unit: 'lb', category: 'protein', store: 'average' },
        'ground beef': { price: 4.79, unit: 'lb', category: 'protein', store: 'average' },
        'salmon': { price: 12.49, unit: 'lb', category: 'protein', store: 'average' },
        'eggs': { price: 3.79, unit: 'dozen', category: 'protein', store: 'average' },
        'milk': { price: 3.79, unit: 'gallon', category: 'dairy', store: 'average' },
        'bread': { price: 2.79, unit: 'loaf', category: 'grain', store: 'average' },
        'rice': { price: 1.99, unit: 'lb', category: 'grain', store: 'average' },
        'onion': { price: 1.39, unit: 'lb', category: 'vegetable', store: 'average' },
        'tomato': { price: 2.79, unit: 'lb', category: 'vegetable', store: 'average' },
        'banana': { price: 0.59, unit: 'lb', category: 'fruit', store: 'average' },
        'apple': { price: 1.99, unit: 'lb', category: 'fruit', store: 'average' }
    }
};

// Store-specific pricing (example data)
const STORE_PRICES = {
    'walmart': {
        'chicken breast': { price: 3.49, unit: 'lb', category: 'protein', store: 'walmart' },
        'ground beef': { price: 4.49, unit: 'lb', category: 'protein', store: 'walmart' },
        'milk': { price: 3.49, unit: 'gallon', category: 'dairy', store: 'walmart' },
        'bread': { price: 2.49, unit: 'loaf', category: 'grain', store: 'walmart' }
    },
    'kroger': {
        'chicken breast': { price: 4.19, unit: 'lb', category: 'protein', store: 'kroger' },
        'ground beef': { price: 5.19, unit: 'lb', category: 'protein', store: 'kroger' },
        'milk': { price: 4.19, unit: 'gallon', category: 'dairy', store: 'kroger' },
        'bread': { price: 3.19, unit: 'loaf', category: 'grain', store: 'kroger' }
    },
    'target': {
        'chicken breast': { price: 3.99, unit: 'lb', category: 'protein', store: 'target' },
        'ground beef': { price: 4.99, unit: 'lb', category: 'protein', store: 'target' },
        'milk': { price: 3.99, unit: 'gallon', category: 'dairy', store: 'target' },
        'bread': { price: 2.99, unit: 'loaf', category: 'grain', store: 'target' }
    }
};

// Price history tracking
let priceHistory = {};

/**
 * Get user's region based on browser location or stored preference
 * @returns {string} Region identifier
 */
export function getUserRegion() {
    // Check localStorage first
    const storedRegion = localStorage.getItem('userRegion');
    if (storedRegion) return storedRegion;

    // Default to US-East if no region is set
    return 'US-East';
}

/**
 * Set user's preferred region
 * @param {string} region - Region identifier
 */
export function setUserRegion(region) {
    if (REGIONAL_PRICES[region]) {
        localStorage.setItem('userRegion', region);
        return true;
    }
    return false;
}

/**
 * Get available regions
 * @returns {Array} List of available regions
 */
export function getAvailableRegions() {
    return Object.keys(REGIONAL_PRICES);
}

/**
 * Get ingredient price from regional database
 * @param {string} ingredientName - Name of the ingredient
 * @param {string} region - Region identifier (optional, defaults to user's region)
 * @returns {object|null} Price information or null if not found
 */
export function getRegionalPrice(ingredientName, region = null) {
    const userRegion = region || getUserRegion();
    const regionalPrices = REGIONAL_PRICES[userRegion];

    if (!regionalPrices) return null;

    const normalizedName = ingredientName.toLowerCase().trim();

    // Direct match
    if (regionalPrices[normalizedName]) {
        return regionalPrices[normalizedName];
    }

    // Partial match
    for (const [key, value] of Object.entries(regionalPrices)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return value;
        }
    }

    return null;
}

/**
 * Get ingredient price from store-specific database
 * @param {string} ingredientName - Name of the ingredient
 * @param {string} store - Store name
 * @returns {object|null} Price information or null if not found
 */
export function getStorePrice(ingredientName, store) {
    const storePrices = STORE_PRICES[store.toLowerCase()];
    if (!storePrices) return null;

    const normalizedName = ingredientName.toLowerCase().trim();

    // Direct match
    if (storePrices[normalizedName]) {
        return storePrices[normalizedName];
    }

    // Partial match
    for (const [key, value] of Object.entries(storePrices)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return value;
        }
    }

    return null;
}

/**
 * Get best available price for an ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @param {string} preferredStore - Preferred store (optional)
 * @returns {object} Best available price information
 */
export function getBestPrice(ingredientName, preferredStore = null) {
    const normalizedName = ingredientName.toLowerCase().trim();

    // Try store-specific price first if preferred store is specified
    if (preferredStore) {
        const storePrice = getStorePrice(ingredientName, preferredStore);
        if (storePrice) {
            return {
                ...storePrice,
                source: 'store',
                store: preferredStore
            };
        }
    }

    // Try regional price
    const regionalPrice = getRegionalPrice(ingredientName);
    if (regionalPrice) {
        return {
            ...regionalPrice,
            source: 'regional',
            store: 'average'
        };
    }

    // Fallback to generic pricing
    return {
        price: 2.99,
        unit: 'piece',
        category: 'other',
        source: 'fallback',
        store: 'generic'
    };
}

/**
 * Search for ingredient prices across multiple sources
 * @param {string} ingredientName - Name of the ingredient
 * @returns {Array} Array of available prices from different sources
 */
export function searchIngredientPrices(ingredientName) {
    const normalizedName = ingredientName.toLowerCase().trim();
    const results = [];

    // Search regional prices
    const regions = getAvailableRegions();
    regions.forEach(region => {
        const price = REGIONAL_PRICES[region][normalizedName];
        if (price) {
            results.push({
                ...price,
                source: 'regional',
                region: region
            });
        }
    });

    // Search store prices
    Object.entries(STORE_PRICES).forEach(([store, prices]) => {
        const price = prices[normalizedName];
        if (price) {
            results.push({
                ...price,
                source: 'store',
                store: store
            });
        }
    });

    return results;
}

/**
 * Update price history for an ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @param {object} priceData - Price information
 */
export function updatePriceHistory(ingredientName, priceData) {
    if (!priceHistory[ingredientName]) {
        priceHistory[ingredientName] = [];
    }

    const historyEntry = {
        ...priceData,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
    };

    priceHistory[ingredientName].push(historyEntry);

    // Keep only last 30 entries
    if (priceHistory[ingredientName].length > 30) {
        priceHistory[ingredientName] = priceHistory[ingredientName].slice(-30);
    }

    // Store in localStorage
    try {
        localStorage.setItem('priceHistory', JSON.stringify(priceHistory));
    } catch (error) {
        console.warn('Could not save price history to localStorage:', error);
    }
}

/**
 * Get price history for an ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @returns {Array} Price history array
 */
export function getPriceHistory(ingredientName) {
    return priceHistory[ingredientName] || [];
}

/**
 * Get price trend for an ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @returns {object} Price trend information
 */
export function getPriceTrend(ingredientName) {
    const history = getPriceHistory(ingredientName);
    if (history.length < 2) {
        return { trend: 'stable', change: 0, changePercentage: 0 };
    }

    const recent = history[history.length - 1].price;
    const older = history[0].price;
    const change = recent - older;
    const changePercentage = (change / older) * 100;

    let trend = 'stable';
    if (changePercentage > 5) trend = 'increasing';
    else if (changePercentage < -5) trend = 'decreasing';

    return {
        trend,
        change: Math.round(change * 100) / 100,
        changePercentage: Math.round(changePercentage * 100) / 100
    };
}

/**
 * Initialize price history from localStorage
 */
export function initializePriceHistory() {
    try {
        const stored = localStorage.getItem('priceHistory');
        if (stored) {
            priceHistory = JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Could not load price history from localStorage:', error);
        priceHistory = {};
    }
}

/**
 * Clear price history
 */
export function clearPriceHistory() {
    priceHistory = {};
    try {
        localStorage.removeItem('priceHistory');
    } catch (error) {
        console.warn('Could not clear price history from localStorage:', error);
    }
}

/**
 * Export price data for external use
 * @returns {object} Exportable price data
 */
export function exportPriceData() {
    return {
        regionalPrices: REGIONAL_PRICES,
        storePrices: STORE_PRICES,
        priceHistory: priceHistory,
        userRegion: getUserRegion(),
        availableRegions: getAvailableRegions()
    };
}

// Initialize price history when module is loaded
if (typeof window !== 'undefined') {
    initializePriceHistory();
}

