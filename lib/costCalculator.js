// Core cost calculation logic for Recipe Cost Calculator
// Handles ingredient cost calculations, unit conversions, and budget planning

// Fallback ingredient price database (average prices in USD)
const FALLBACK_PRICES = {
    // Proteins
    'chicken breast': { price: 3.99, unit: 'lb', category: 'protein' },
    'ground beef': { price: 4.99, unit: 'lb', category: 'protein' },
    'salmon': { price: 12.99, unit: 'lb', category: 'protein' },
    'eggs': { price: 3.99, unit: 'dozen', category: 'protein' },
    'tofu': { price: 2.99, unit: 'lb', category: 'protein' },

    // Vegetables
    'onion': { price: 1.49, unit: 'lb', category: 'vegetable' },
    'garlic': { price: 0.99, unit: 'head', category: 'vegetable' },
    'tomato': { price: 2.99, unit: 'lb', category: 'vegetable' },
    'bell pepper': { price: 1.99, unit: 'lb', category: 'vegetable' },
    'carrot': { price: 1.29, unit: 'lb', category: 'vegetable' },
    'broccoli': { price: 2.49, unit: 'lb', category: 'vegetable' },
    'spinach': { price: 2.99, unit: 'lb', category: 'vegetable' },
    'lettuce': { price: 1.99, unit: 'head', category: 'vegetable' },

    // Grains
    'rice': { price: 1.99, unit: 'lb', category: 'grain' },
    'pasta': { price: 1.49, unit: 'lb', category: 'grain' },
    'bread': { price: 2.99, unit: 'loaf', category: 'grain' },
    'flour': { price: 1.99, unit: 'lb', category: 'grain' },

    // Dairy
    'milk': { price: 3.99, unit: 'gallon', category: 'dairy' },
    'cheese': { price: 4.99, unit: 'lb', category: 'dairy' },
    'butter': { price: 3.99, unit: 'lb', category: 'dairy' },
    'yogurt': { price: 4.99, unit: '32oz', category: 'dairy' },

    // Spices & Herbs
    'salt': { price: 0.99, unit: 'lb', category: 'spice' },
    'black pepper': { price: 2.99, unit: 'oz', category: 'spice' },
    'olive oil': { price: 8.99, unit: '16oz', category: 'oil' },
    'vegetable oil': { price: 3.99, unit: '32oz', category: 'oil' },

    // Fruits
    'banana': { price: 0.59, unit: 'lb', category: 'fruit' },
    'apple': { price: 1.99, unit: 'lb', category: 'fruit' },
    'orange': { price: 1.49, unit: 'lb', category: 'fruit' },
    'lemon': { price: 0.79, unit: 'each', category: 'fruit' },
    'lime': { price: 0.79, unit: 'each', category: 'fruit' }
};

// Unit conversion factors
const UNIT_CONVERSIONS = {
    // Weight conversions
    'g': { to: 'lb', factor: 0.00220462 },
    'kg': { to: 'lb', factor: 2.20462 },
    'oz': { to: 'lb', factor: 0.0625 },
    'lb': { to: 'lb', factor: 1 },

    // Volume conversions
    'ml': { to: 'cup', factor: 0.00422675 },
    'l': { to: 'cup', factor: 4.22675 },
    'tsp': { to: 'cup', factor: 0.0208333 },
    'tbsp': { to: 'cup', factor: 0.0625 },
    'cup': { to: 'cup', factor: 1 },
    'pint': { to: 'cup', factor: 2 },
    'quart': { to: 'cup', factor: 4 },
    'gallon': { to: 'cup', factor: 16 }
};

// Common measurement patterns
const MEASUREMENT_PATTERNS = [
    // Weight patterns
    { regex: /(\d+(?:\.\d+)?)\s*(g|kg|oz|lb|grams?|kilograms?|ounces?|pounds?)/i, type: 'weight' },
    // Volume patterns
    { regex: /(\d+(?:\.\d+)?)\s*(ml|l|tsp|tbsp|cup|pint|quart|gallon|milliliters?|liters?|teaspoons?|tablespoons?|cups?|pints?|quarts?|gallons?)/i, type: 'volume' },
    // Count patterns
    { regex: /(\d+)\s*(piece|pieces|slice|slices|clove|cloves|head|heads|bunch|bunches|can|cans|jar|jars|pack|packs)/i, type: 'count' },
    // Fraction patterns
    { regex: /(\d+\/\d+)\s*(cup|cups|tsp|tbsp|oz|lb)/i, type: 'fraction' }
];

/**
 * Parse ingredient measurement and quantity
 * @param {string} measure - The measurement string (e.g., "2 cups", "1 lb")
 * @returns {object} Parsed measurement with quantity and unit
 */
export function parseMeasurement(measure) {
    if (!measure) return { quantity: 1, unit: 'piece', type: 'count' };

    const measureStr = measure.trim().toLowerCase();

    // Try to match with patterns
    for (const pattern of MEASUREMENT_PATTERNS) {
        const match = measureStr.match(pattern.regex);
        if (match) {
            let quantity = match[1];
            let unit = match[2];

            // Handle fractions
            if (pattern.type === 'fraction') {
                const [num, denom] = quantity.split('/');
                quantity = parseFloat(num) / parseFloat(denom);
                unit = match[3];
            } else {
                quantity = parseFloat(quantity);
            }

            // Normalize unit names
            unit = normalizeUnit(unit);

            return { quantity, unit, type: pattern.type };
        }
    }

    // Default fallback
    return { quantity: 1, unit: 'piece', type: 'count' };
}

/**
 * Normalize unit names to standard format
 * @param {string} unit - Raw unit string
 * @returns {string} Normalized unit
 */
function normalizeUnit(unit) {
    const unitMap = {
        // Weight
        'grams': 'g', 'gram': 'g', 'kilograms': 'kg', 'kilogram': 'kg',
        'ounces': 'oz', 'ounce': 'oz', 'pounds': 'lb', 'pound': 'lb',
        // Volume
        'milliliters': 'ml', 'milliliter': 'ml', 'liters': 'l', 'liter': 'l',
        'teaspoons': 'tsp', 'teaspoon': 'tsp', 'tablespoons': 'tbsp', 'tablespoon': 'tbsp',
        'cups': 'cup', 'pint': 'pint', 'pints': 'pint', 'quart': 'quart', 'quarts': 'quart',
        'gallons': 'gallon', 'gallon': 'gallon'
    };

    return unitMap[unit.toLowerCase()] || unit.toLowerCase();
}

/**
 * Convert measurement to standard unit for pricing
 * @param {object} measurement - Parsed measurement object
 * @returns {object} Converted measurement
 */
export function convertToStandardUnit(measurement) {
    const { quantity, unit, type } = measurement;

    if (type === 'weight' && UNIT_CONVERSIONS[unit]) {
        const conversion = UNIT_CONVERSIONS[unit];
        return {
            quantity: quantity * conversion.factor,
            unit: conversion.to,
            type: 'weight'
        };
    }

    if (type === 'volume' && UNIT_CONVERSIONS[unit]) {
        const conversion = UNIT_CONVERSIONS[unit];
        return {
            quantity: quantity * conversion.factor,
            unit: conversion.to,
            type: 'volume'
        };
    }

    return measurement;
}

/**
 * Find ingredient price from database
 * @param {string} ingredientName - Name of the ingredient
 * @returns {object|null} Price information or null if not found
 */
export function findIngredientPrice(ingredientName) {
    if (!ingredientName) return null;

    const normalizedName = ingredientName.toLowerCase().trim();

    // Direct match
    if (FALLBACK_PRICES[normalizedName]) {
        return FALLBACK_PRICES[normalizedName];
    }

    // Partial match
    for (const [key, value] of Object.entries(FALLBACK_PRICES)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
            return value;
        }
    }

    // Category-based fallback
    const categoryFallbacks = {
        'protein': { price: 6.99, unit: 'lb', category: 'protein' },
        'vegetable': { price: 2.49, unit: 'lb', category: 'vegetable' },
        'grain': { price: 2.99, unit: 'lb', category: 'grain' },
        'dairy': { price: 4.99, unit: 'lb', category: 'dairy' },
        'fruit': { price: 2.99, unit: 'lb', category: 'fruit' },
        'spice': { price: 1.99, unit: 'oz', category: 'spice' },
        'oil': { price: 6.99, unit: '16oz', category: 'oil' }
    };

    // Try to guess category from ingredient name
    if (normalizedName.includes('meat') || normalizedName.includes('chicken') || normalizedName.includes('beef')) {
        return categoryFallbacks.protein;
    }
    if (normalizedName.includes('vegetable') || normalizedName.includes('onion') || normalizedName.includes('carrot')) {
        return categoryFallbacks.vegetable;
    }
    if (normalizedName.includes('rice') || normalizedName.includes('pasta') || normalizedName.includes('bread')) {
        return categoryFallbacks.grain;
    }

    // Default fallback
    return { price: 2.99, unit: 'piece', category: 'other' };
}

/**
 * Calculate cost for a single ingredient
 * @param {string} ingredientName - Name of the ingredient
 * @param {string} measure - Measurement string
 * @returns {object} Cost calculation result
 */
export function calculateIngredientCost(ingredientName, measure) {
    const measurement = parseMeasurement(measure);
    const convertedMeasurement = convertToStandardUnit(measurement);
    const priceInfo = findIngredientPrice(ingredientName);

    if (!priceInfo) {
        return {
            ingredient: ingredientName,
            measure: measure,
            cost: 0,
            pricePerUnit: 0,
            unit: 'unknown',
            category: 'unknown',
            error: 'Price not found'
        };
    }

    // Calculate cost based on unit compatibility
    let cost = 0;
    let finalUnit = priceInfo.unit;

    if (convertedMeasurement.type === 'weight' && priceInfo.unit.includes('lb')) {
        // Weight-based pricing
        cost = (convertedMeasurement.quantity * priceInfo.price);
        finalUnit = 'lb';
    } else if (convertedMeasurement.type === 'volume' && priceInfo.unit.includes('cup')) {
        // Volume-based pricing
        cost = (convertedMeasurement.quantity * priceInfo.price);
        finalUnit = 'cup';
    } else if (convertedMeasurement.type === 'count') {
        // Count-based pricing (e.g., per piece, per dozen)
        if (priceInfo.unit === 'dozen') {
            cost = (convertedMeasurement.quantity / 12) * priceInfo.price;
        } else {
            cost = convertedMeasurement.quantity * priceInfo.price;
        }
        finalUnit = priceInfo.unit;
    } else {
        // Fallback: estimate cost based on quantity
        cost = convertedMeasurement.quantity * priceInfo.price * 0.1; // Conservative estimate
    }

    return {
        ingredient: ingredientName,
        measure: measure,
        cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
        pricePerUnit: priceInfo.price,
        unit: finalUnit,
        category: priceInfo.category,
        error: null
    };
}

/**
 * Calculate total recipe cost
 * @param {Array} ingredients - Array of ingredient objects with name and measure
 * @returns {object} Total cost breakdown
 */
export function calculateRecipeCost(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) {
        return { totalCost: 0, ingredients: [], error: 'Invalid ingredients data' };
    }

    const calculatedIngredients = ingredients.map(ing => {
        if (typeof ing === 'string') {
            // Handle string format: "2 cups flour"
            const parts = ing.trim().split(' ');
            if (parts.length >= 3) {
                const measure = parts.slice(0, 2).join(' ');
                const name = parts.slice(2).join(' ');
                return calculateIngredientCost(name, measure);
            } else {
                return calculateIngredientCost(ing, '1 piece');
            }
        } else if (ing.measure && ing.name) {
            // Handle object format: { measure: "2 cups", name: "flour" }
            return calculateIngredientCost(ing.name, ing.measure);
        } else {
            return calculateIngredientCost(ing.name || ing, ing.measure || '1 piece');
        }
    });

    const totalCost = calculatedIngredients.reduce((sum, ing) => sum + ing.cost, 0);

    // Calculate cost per serving (assuming 4 servings as default)
    const costPerServing = totalCost / 4;

    // Categorize costs
    const costByCategory = calculatedIngredients.reduce((acc, ing) => {
        if (!acc[ing.category]) acc[ing.category] = 0;
        acc[ing.category] += ing.cost;
        return acc;
    }, {});

    return {
        totalCost: Math.round(totalCost * 100) / 100,
        costPerServing: Math.round(costPerServing * 100) / 100,
        ingredients: calculatedIngredients,
        costByCategory,
        servingCount: 4,
        error: null
    };
}

/**
 * Calculate budget savings compared to eating out
 * @param {number} recipeCost - Cost of homemade recipe
 * @param {number} servings - Number of servings
 * @returns {object} Savings calculation
 */
export function calculateSavings(recipeCost, servings = 4) {
    const averageRestaurantCost = 15; // Average cost per person eating out
    const totalRestaurantCost = averageRestaurantCost * servings;
    const savings = totalRestaurantCost - recipeCost;
    const savingsPercentage = (savings / totalRestaurantCost) * 100;

    return {
        restaurantCost: totalRestaurantCost,
        homemadeCost: recipeCost,
        savings: Math.round(savings * 100) / 100,
        savingsPercentage: Math.round(savingsPercentage * 100) / 100,
        costPerPerson: Math.round(recipeCost / servings * 100) / 100
    };
}

/**
 * Generate shopping list with estimated costs
 * @param {Array} ingredients - Array of calculated ingredients
 * @returns {Array} Shopping list items with costs
 */
export function generateShoppingList(ingredients) {
    return ingredients.map(ing => ({
        name: ing.ingredient,
        measure: ing.measure,
        estimatedCost: ing.cost,
        category: ing.category,
        unit: ing.unit
    }));
}

/**
 * Check if recipe fits within budget
 * @param {number} recipeCost - Total recipe cost
 * @param {number} budget - User's budget limit
 * @returns {object} Budget status
 */
export function checkBudgetFit(recipeCost, budget) {
    const isWithinBudget = recipeCost <= budget;
    const remainingBudget = budget - recipeCost;
    const budgetPercentage = (recipeCost / budget) * 100;

    return {
        isWithinBudget,
        remainingBudget: Math.round(remainingBudget * 100) / 100,
        budgetPercentage: Math.round(budgetPercentage * 100) / 100,
        status: isWithinBudget ? 'within-budget' : 'over-budget'
    };
}
