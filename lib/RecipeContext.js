"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { recipeService } from './recipeService';
import { pricingService } from './pricingService';

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
    const [currentRecipe, setCurrentRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [recipeName, setRecipeName] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [costPerServing, setCostPerServing] = useState(0);
    const [servings, setServings] = useState(4);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize recipe from URL or localStorage
    const initializeRecipe = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Try to parse from URL first
            let recipe = recipeService.parseRecipeFromURL();

            // If no URL recipe, try localStorage
            if (!recipe) {
                recipe = recipeService.loadFromLocalStorage();
            }

            if (recipe) {
                setCurrentRecipe(recipe);
                setIngredients(recipe.ingredients || []);
                setRecipeName(recipe.name || '');
                setServings(recipe.servings || 4);

                // Calculate costs
                await calculateRecipeCosts();
            }
        } catch (err) {
            setError('Failed to load recipe: ' + err.message);
            console.error('Error initializing recipe:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Calculate recipe costs
    const calculateRecipeCosts = useCallback(async () => {
        if (ingredients.length === 0) return;

        try {
            const costResult = pricingService.calculateRecipeCost(ingredients);

            setTotalCost(costResult.totalCost);
            setCostPerServing(costResult.costPerServing);

            // Update ingredients with costs
            const updatedIngredients = costResult.ingredientCosts;
            setIngredients(updatedIngredients);

            // Update recipe service
            recipeService.ingredients = updatedIngredients;
            recipeService.currentRecipe.totalCost = costResult.totalCost;
            recipeService.saveToLocalStorage();

        } catch (err) {
            setError('Failed to calculate costs: ' + err.message);
            console.error('Error calculating costs:', err);
        }
    }, []);

    // Add ingredient
    const addIngredient = useCallback((name, measure) => {
        const ingredient = recipeService.addIngredient(name, measure);
        setIngredients([...recipeService.getIngredients()]);
        calculateRecipeCosts();
        return ingredient;
    }, []);

    // Remove ingredient
    const removeIngredient = useCallback((index) => {
        recipeService.removeIngredient(index);
        setIngredients([...recipeService.getIngredients()]);
        calculateRecipeCosts();
    }, []);

    // Update ingredient
    const updateIngredient = useCallback((index, field, value) => {
        recipeService.updateIngredient(index, field, value);
        setIngredients([...recipeService.getIngredients()]);
        calculateRecipeCosts();
    }, []);

    // Update servings
    const updateServings = useCallback((newServings) => {
        setServings(newServings);
        if (currentRecipe) {
            currentRecipe.servings = newServings;
            recipeService.currentRecipe.servings = newServings;
            recipeService.saveToLocalStorage();
        }
    }, []);

    // Clear recipe
    const clearRecipe = useCallback(() => {
        recipeService.clearRecipe();
        setCurrentRecipe(null);
        setIngredients([]);
        setRecipeName('');
        setTotalCost(0);
        setCostPerServing(0);
        setServings(4);
        setError(null);
    }, []);

    // Check if recipe exists
    const hasRecipe = useCallback(() => {
        return recipeService.hasRecipe();
    }, []);

    // Get recipe summary
    const getRecipeSummary = useCallback(() => {
        if (!currentRecipe) return null;

        return {
            name: recipeName,
            totalCost: totalCost,
            costPerServing: costPerServing,
            servings: servings,
            ingredientCount: ingredients.length,
            savings: totalCost > 0 ? Math.round((25 - totalCost) * 100) / 100 : 0 // Compare to $25 eating out
        };
    }, []);

    // Initialize on mount
    useEffect(() => {
        initializeRecipe();
    }, [initializeRecipe]);

    // Recalculate costs when ingredients change
    useEffect(() => {
        if (ingredients.length > 0) {
            calculateRecipeCosts();
        }
    }, [ingredients]);

    const value = {
        // State
        currentRecipe,
        ingredients,
        recipeName,
        totalCost,
        costPerServing,
        servings,
        isLoading,
        error,

        // Actions
        addIngredient,
        removeIngredient,
        updateIngredient,
        updateServings,
        clearRecipe,
        hasRecipe,
        getRecipeSummary,
        calculateRecipeCosts,
        initializeRecipe
    };

    return (
        <RecipeContext.Provider value={value}>
            {children}
        </RecipeContext.Provider>
    );
}

export function useRecipe() {
    const context = useContext(RecipeContext);
    if (!context) {
        throw new Error('useRecipe must be used within a RecipeProvider');
    }
    return context;
}
