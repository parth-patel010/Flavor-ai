// Recipe Service for handling recipe data and ingredient management
export class RecipeService {
    constructor() {
        this.currentRecipe = null;
        this.ingredients = [];
        this.recipeName = '';
    }

    // Parse recipe data from URL parameters
    parseRecipeFromURL() {
        if (typeof window === 'undefined') return null;

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const recipeName = urlParams.get('recipe');
            const ingredientsParam = urlParams.get('ingredients');

            if (!recipeName || !ingredientsParam) return null;

            const ingredients = JSON.parse(decodeURIComponent(ingredientsParam));

            if (!Array.isArray(ingredients)) return null;

            this.recipeName = recipeName;
            this.ingredients = ingredients.map(ing => ({
                name: ing.name || ing.ingredient || 'Unknown',
                measure: ing.measure || '1 piece',
                estimatedCost: 0,
                category: this.categorizeIngredient(ing.name || ing.ingredient)
            }));

            this.currentRecipe = {
                name: recipeName,
                ingredients: this.ingredients,
                totalCost: 0,
                servings: 4
            };

            // Store in localStorage for persistence
            this.saveToLocalStorage();

            return this.currentRecipe;
        } catch (error) {
            console.error('Error parsing recipe from URL:', error);
            return null;
        }
    }

    // Categorize ingredients for better pricing
    categorizeIngredient(ingredientName) {
        const name = ingredientName.toLowerCase();

        if (name.includes('meat') || name.includes('pork') || name.includes('chicken') || name.includes('beef')) {
            return 'meat';
        } else if (name.includes('vegetable') || name.includes('carrot') || name.includes('celery') || name.includes('onion')) {
            return 'vegetable';
        } else if (name.includes('spice') || name.includes('ginger') || name.includes('garlic') || name.includes('salt')) {
            return 'spice';
        } else if (name.includes('sauce') || name.includes('soy') || name.includes('oil')) {
            return 'condiment';
        } else if (name.includes('flour') || name.includes('dough') || name.includes('skin')) {
            return 'grain';
        } else {
            return 'other';
        }
    }

    // Get current recipe
    getCurrentRecipe() {
        return this.currentRecipe;
    }

    // Get ingredients
    getIngredients() {
        return this.ingredients;
    }

    // Add ingredient
    addIngredient(name, measure) {
        const ingredient = {
            name: name.trim(),
            measure: measure.trim(),
            estimatedCost: 0,
            category: this.categorizeIngredient(name)
        };

        this.ingredients.push(ingredient);
        this.updateTotalCost();
        this.saveToLocalStorage();

        return ingredient;
    }

    // Remove ingredient
    removeIngredient(index) {
        if (index >= 0 && index < this.ingredients.length) {
            this.ingredients.splice(index, 1);
            this.updateTotalCost();
            this.saveToLocalStorage();
        }
    }

    // Update ingredient
    updateIngredient(index, field, value) {
        if (index >= 0 && index < this.ingredients.length) {
            this.ingredients[index][field] = value;

            if (field === 'name') {
                this.ingredients[index].category = this.categorizeIngredient(value);
            }

            this.updateTotalCost();
            this.saveToLocalStorage();
        }
    }

    // Update total cost
    updateTotalCost() {
        this.currentRecipe.totalCost = this.ingredients.reduce((sum, ing) => sum + ing.estimatedCost, 0);
    }

    // Save to localStorage
    saveToLocalStorage() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentRecipe', JSON.stringify(this.currentRecipe));
            localStorage.setItem('recipeIngredients', JSON.stringify(this.ingredients));
        }
    }

    // Load from localStorage
    loadFromLocalStorage() {
        if (typeof window !== 'undefined') {
            try {
                const savedRecipe = localStorage.getItem('currentRecipe');
                const savedIngredients = localStorage.getItem('recipeIngredients');

                if (savedRecipe) {
                    this.currentRecipe = JSON.parse(savedRecipe);
                }

                if (savedIngredients) {
                    this.ingredients = JSON.parse(savedIngredients);
                }

                return this.currentRecipe;
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                return null;
            }
        }
        return null;
    }

    // Clear current recipe
    clearRecipe() {
        this.currentRecipe = null;
        this.ingredients = [];
        this.recipeName = '';

        if (typeof window !== 'undefined') {
            localStorage.removeItem('currentRecipe');
            localStorage.removeItem('recipeIngredients');
        }
    }

    // Check if recipe exists
    hasRecipe() {
        return this.currentRecipe !== null && this.ingredients.length > 0;
    }
}

// Create singleton instance
export const recipeService = new RecipeService();
