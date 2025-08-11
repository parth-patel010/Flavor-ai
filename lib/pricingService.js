// Pricing Service for ingredient cost calculations
export class PricingService {
    constructor() {
        this.basePrices = {
            meat: {
                'pork': 8.99, // per lb
                'chicken': 6.99, // per lb
                'beef': 12.99, // per lb
                'lamb': 15.99, // per lb
                'fish': 9.99, // per lb
                'shrimp': 12.99, // per lb
                'default': 10.99
            },
            vegetable: {
                'carrot': 1.49, // per lb
                'celery': 1.99, // per bunch
                'onion': 0.99, // per lb
                'tomato': 2.99, // per lb
                'lettuce': 1.99, // per head
                'spinach': 2.49, // per bag
                'broccoli': 2.99, // per lb
                'default': 2.49
            },
            spice: {
                'ginger': 3.99, // per lb
                'garlic': 2.99, // per lb
                'salt': 1.99, // per lb
                'pepper': 4.99, // per lb
                'cumin': 5.99, // per lb
                'paprika': 4.99, // per lb
                'oregano': 3.99, // per oz
                'default': 3.99
            },
            condiment: {
                'soy sauce': 2.99, // per bottle
                'oil': 4.99, // per bottle
                'vinegar': 2.99, // per bottle
                'ketchup': 1.99, // per bottle
                'mustard': 1.99, // per bottle
                'mayo': 2.99, // per jar
                'default': 2.99
            },
            grain: {
                'flour': 2.99, // per lb
                'rice': 3.99, // per lb
                'pasta': 2.49, // per lb
                'bread': 3.99, // per loaf
                'default': 3.49
            },
            other: {
                'default': 2.99
            }
        };

        this.measurementConversions = {
            'lb': 1,
            'pound': 1,
            'oz': 0.0625,
            'ounce': 0.0625,
            'g': 0.00220462,
            'gram': 0.00220462,
            'kg': 2.20462,
            'kilogram': 2.20462,
            'cup': 0.5,
            'tbsp': 0.0625,
            'tablespoon': 0.0625,
            'tsp': 0.0208333,
            'teaspoon': 0.0208333,
            'piece': 0.25,
            'clove': 0.1,
            'bottle': 16,
            'packet': 0.5,
            'bunch': 0.5
        };
    }

    // Calculate ingredient cost based on name, measure, and category
    calculateIngredientCost(ingredientName, measure, category) {
        const name = ingredientName.toLowerCase();
        const measureLower = measure.toLowerCase();

        // Find the best price match
        let price = this.findBestPrice(name, category);

        // Parse measurement and convert to standard units
        const standardAmount = this.parseMeasurement(measureLower);

        // Calculate cost
        const cost = price * standardAmount;

        return Math.round(cost * 100) / 100; // Round to 2 decimal places
    }

    // Find the best price for an ingredient
    findBestPrice(ingredientName, category) {
        const categoryPrices = this.basePrices[category] || this.basePrices.other;

        // Try exact match first
        for (const [key, price] of Object.entries(categoryPrices)) {
            if (ingredientName.includes(key)) {
                return price;
            }
        }

        // Try partial matches
        for (const [key, price] of Object.entries(categoryPrices)) {
            if (key.includes(ingredientName) || ingredientName.includes(key)) {
                return price;
            }
        }

        // Return default price for category
        return categoryPrices.default || this.basePrices.other.default;
    }

    // Parse measurement string and convert to standard units (pounds)
    parseMeasurement(measure) {
        const measureLower = measure.toLowerCase().trim();

        // Extract number and unit
        const match = measureLower.match(/^([\d.]+)\s*([a-zA-Z]+)/);

        if (!match) {
            // If no number found, assume 1 unit
            return this.measurementConversions[measureLower] || 0.25;
        }

        const amount = parseFloat(match[1]);
        const unit = match[2];

        // Convert to standard units
        const conversionFactor = this.measurementConversions[unit] || 0.25;

        return amount * conversionFactor;
    }

    // Get estimated cost for a recipe
    calculateRecipeCost(ingredients) {
        let totalCost = 0;
        const ingredientCosts = [];

        for (const ingredient of ingredients) {
            const cost = this.calculateIngredientCost(
                ingredient.name,
                ingredient.measure,
                ingredient.category
            );

            ingredientCosts.push({
                ...ingredient,
                estimatedCost: cost
            });

            totalCost += cost;
        }

        return {
            totalCost: Math.round(totalCost * 100) / 100,
            ingredientCosts,
            costPerServing: Math.round((totalCost / 4) * 100) / 100 // Assuming 4 servings
        };
    }

    // Get price suggestions for ingredients
    getPriceSuggestions(ingredientName, category) {
        const suggestions = [];
        const categoryPrices = this.basePrices[category] || this.basePrices.other;

        for (const [key, price] of Object.entries(categoryPrices)) {
            if (key !== 'default' && (ingredientName.toLowerCase().includes(key) || key.includes(ingredientName.toLowerCase()))) {
                suggestions.push({
                    name: key,
                    price: price,
                    unit: 'per lb'
                });
            }
        }

        return suggestions.slice(0, 3); // Return top 3 suggestions
    }

    // Update base prices (for admin use)
    updateBasePrice(category, ingredient, price) {
        if (this.basePrices[category]) {
            this.basePrices[category][ingredient] = price;
        }
    }
}

// Create singleton instance
export const pricingService = new PricingService();
