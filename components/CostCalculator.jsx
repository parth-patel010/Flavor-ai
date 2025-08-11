"use client";

import { useState, useEffect } from 'react';
import {
    CalculatorIcon,
    CurrencyDollarIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    CogIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

// Cost Calculator Component
export default function CostCalculator({ recipeData = null, onClose = null }) {
    const [ingredients, setIngredients] = useState([]);
    const [servings, setServings] = useState(4);
    const [budget, setBudget] = useState('');
    const [region, setRegion] = useState('US-East');
    const [preferredStore, setPreferredStore] = useState('');
    const [calculationResult, setCalculationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [recipeLoaded, setRecipeLoaded] = useState(false);

    // Get recipe name from URL if available
    const getRecipeName = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('recipe');
        }
        return null;
    };

    // Initialize with recipe data if provided
    useEffect(() => {
        if (recipeData && recipeData.ingredients) {
            const formattedIngredients = recipeData.ingredients.map(ing => ({
                name: ing.name || ing.ingredient || ing,
                measure: ing.measure || '1 piece'
            }));
            setIngredients(formattedIngredients);
        }
    }, [recipeData]);

    // Check for URL parameters for recipe data
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const recipeName = urlParams.get('recipe');
            const ingredientsParam = urlParams.get('ingredients');

            if (recipeName && ingredientsParam) {
                try {
                    const parsedIngredients = JSON.parse(decodeURIComponent(ingredientsParam));
                    if (Array.isArray(parsedIngredients)) {
                        const formattedIngredients = parsedIngredients.map(ing => ({
                            name: ing.name || ing.ingredient || ing,
                            measure: ing.measure || '1 piece'
                        }));
                        setIngredients(formattedIngredients);
                        setRecipeLoaded(true);

                        // Show success message briefly
                        setTimeout(() => setRecipeLoaded(false), 5000);
                    }
                } catch (error) {
                    console.warn('Could not parse ingredients from URL:', error);
                }
            }

            // Check for sample ingredients from localStorage
            const sampleIngredients = localStorage.getItem('sampleIngredients');
            if (sampleIngredients && ingredients.length === 0) {
                try {
                    const parsed = JSON.parse(sampleIngredients);
                    if (Array.isArray(parsed)) {
                        setIngredients(parsed);
                        // Clear the sample ingredients after loading
                        localStorage.removeItem('sampleIngredients');
                    }
                } catch (error) {
                    console.warn('Could not parse sample ingredients:', error);
                    localStorage.removeItem('sampleIngredients');
                }
            }
        }
    }, [ingredients.length]);

    // Load user preferences from localStorage
    useEffect(() => {
        const savedBudget = localStorage.getItem('userBudget');
        const savedRegion = localStorage.getItem('userRegion');
        const savedStore = localStorage.getItem('preferredStore');

        if (savedBudget) setBudget(savedBudget);
        if (savedRegion) setRegion(savedRegion);
        if (savedStore) setPreferredStore(savedStore);
    }, []);

    // Save user preferences to localStorage
    const savePreferences = () => {
        if (budget) localStorage.setItem('userBudget', budget);
        if (region) localStorage.setItem('userRegion', region);
        if (preferredStore) localStorage.setItem('preferredStore', preferredStore);
    };

    // Add new ingredient
    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', measure: '' }]);
    };

    // Remove ingredient
    const removeIngredient = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    // Update ingredient
    const updateIngredient = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    // Calculate recipe cost
    const calculateCost = async () => {
        if (ingredients.length === 0) {
            setError('Please add at least one ingredient');
            return;
        }

        // Validate ingredients
        const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.measure.trim());
        if (validIngredients.length === 0) {
            setError('Please provide both name and measure for all ingredients');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/calculate-recipe-cost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredients: validIngredients,
                    servings: parseInt(servings),
                    budget: budget ? parseFloat(budget) : null,
                    region: region,
                    preferredStore: preferredStore || null
                }),
            });

            const result = await response.json();

            if (result.success) {
                setCalculationResult(result);
                setShowResults(true);
                savePreferences();
            } else {
                setError(result.error || 'Failed to calculate recipe cost');
            }
        } catch (err) {
            setError('Failed to connect to the server. Please try again.');
            console.error('Error calculating cost:', err);
        } finally {
            setLoading(false);
        }
    };

    // Quick ingredient templates
    const quickIngredients = [
        { name: 'chicken breast', measure: '1 lb' },
        { name: 'rice', measure: '2 cups' },
        { name: 'onion', measure: '1 medium' },
        { name: 'garlic', measure: '3 cloves' },
        { name: 'olive oil', measure: '2 tbsp' },
        { name: 'salt', measure: '1 tsp' },
        { name: 'black pepper', measure: '1/2 tsp' }
    ];

    const addQuickIngredient = (ingredient) => {
        setIngredients([...ingredients, { ...ingredient }]);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-base-100">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <CalculatorIcon className="h-12 w-12 text-primary" />
                    <h1 className="text-4xl font-bold text-primary">Recipe Cost Calculator</h1>
                </div>
                {getRecipeName() && (
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold text-secondary">
                            Calculating costs for: <span className="text-primary">"{getRecipeName()}"</span>
                        </h2>
                    </div>
                )}
                <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                    Calculate the cost of your recipe ingredients, plan your budget, and generate shopping lists with estimated costs.
                </p>
            </div>

            {/* Success Notification */}
            {recipeLoaded && (
                <div className="alert alert-success mb-6 max-w-2xl mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">Recipe Loaded Successfully!</h3>
                        <div className="text-xs">
                            {getRecipeName() ? `"${getRecipeName()}" has been loaded with ${ingredients.length} ingredients.` : `Recipe has been loaded with ${ingredients.length} ingredients.`}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input Form */}
                <div className="space-y-6">
                    {/* Settings Panel */}
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="card-title text-xl">
                                    <CogIcon className="h-6 w-6" />
                                    Calculator Settings
                                </h2>
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="btn btn-sm btn-outline"
                                >
                                    {showSettings ? 'Hide' : 'Show'} Settings
                                </button>
                            </div>

                            {showSettings && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Region</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full"
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                        >
                                            <option value="US-East">US East</option>
                                            <option value="US-West">US West</option>
                                            <option value="US-Midwest">US Midwest</option>
                                            <option value="US-South">US South</option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Preferred Store</span>
                                        </label>
                                        <select
                                            className="select select-bordered w-full"
                                            value={preferredStore}
                                            onChange={(e) => setPreferredStore(e.target.value)}
                                        >
                                            <option value="">Any Store</option>
                                            <option value="walmart">Walmart</option>
                                            <option value="kroger">Kroger</option>
                                            <option value="target">Target</option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Budget Limit ($)</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Enter your budget"
                                            className="input input-bordered w-full"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Servings</span>
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Number of servings"
                                            className="input input-bordered w-full"
                                            value={servings}
                                            onChange={(e) => setServings(e.target.value)}
                                            min="1"
                                            max="20"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ingredients Input */}
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-4">
                                <ShoppingCartIcon className="h-6 w-6" />
                                Recipe Ingredients
                            </h2>

                            {/* Quick Add Buttons */}
                            <div className="mb-4">
                                <p className="text-sm text-base-content/70 mb-2">Quick add common ingredients:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickIngredients.map((ing, index) => (
                                        <button
                                            key={index}
                                            onClick={() => addQuickIngredient(ing)}
                                            className="btn btn-xs btn-outline btn-primary"
                                        >
                                            {ing.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ingredients List */}
                            <div className="space-y-3">
                                {ingredients.map((ingredient, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <input
                                            type="text"
                                            placeholder="Ingredient name"
                                            className="input input-bordered flex-1"
                                            value={ingredient.name}
                                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Measure (e.g., 2 cups)"
                                            className="input input-bordered w-32"
                                            value={ingredient.measure}
                                            onChange={(e) => updateIngredient(index, 'measure', e.target.value)}
                                        />
                                        <button
                                            onClick={() => removeIngredient(index)}
                                            className="btn btn-square btn-sm btn-error"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addIngredient}
                                className="btn btn-outline btn-primary w-full mt-4"
                            >
                                + Add Ingredient
                            </button>
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <button
                        onClick={calculateCost}
                        disabled={loading || ingredients.length === 0}
                        className="btn btn-primary btn-lg w-full"
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner"></span>
                                Calculating...
                            </>
                        ) : (
                            <>
                                <CalculatorIcon className="h-6 w-6" />
                                Calculate Recipe Cost
                            </>
                        )}
                    </button>

                    {/* Error Display */}
                    {error && (
                        <div className="alert alert-error">
                            <InformationCircleIcon className="h-6 w-6" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Right Column - Results */}
                <div className="space-y-6">
                    {showResults && calculationResult ? (
                        <CostResults
                            result={calculationResult}
                            onClose={() => setShowResults(false)}
                        />
                    ) : (
                        <div className="card bg-base-200 shadow-lg h-full">
                            <div className="card-body flex items-center justify-center">
                                <div className="text-center text-base-content/50">
                                    <CalculatorIcon className="h-24 w-24 mx-auto mb-4 opacity-30" />
                                    <h3 className="text-xl font-medium mb-2">Ready to Calculate</h3>
                                    <p className="text-base-content/60">
                                        Add your recipe ingredients and click calculate to see the cost breakdown,
                                        budget analysis, and shopping list.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Close Button for Modal Mode */}
            {onClose && (
                <div className="text-center mt-8">
                    <button
                        onClick={onClose}
                        className="btn btn-outline btn-secondary"
                    >
                        Close Calculator
                    </button>
                </div>
            )}
        </div>
    );
}

// Cost Results Component
function CostResults({ result, onClose }) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: ChartBarIcon },
        { id: 'ingredients', label: 'Ingredients', icon: ShoppingCartIcon },
        { id: 'shopping', label: 'Shopping List', icon: ShoppingCartIcon },
        { id: 'budget', label: 'Budget', icon: CurrencyDollarIcon }
    ];

    return (
        <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="card-title text-2xl text-success">
                        <CurrencyDollarIcon className="h-8 w-8" />
                        Cost Analysis Complete
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-outline"
                    >
                        ×
                    </button>
                </div>

                {/* Cost Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="stat bg-primary/10 rounded-lg">
                        <div className="stat-title text-primary">Total Cost</div>
                        <div className="stat-value text-primary">${result.recipe.totalCost}</div>
                        <div className="stat-desc">For {result.recipe.servingCount} servings</div>
                    </div>

                    <div className="stat bg-secondary/10 rounded-lg">
                        <div className="stat-title text-secondary">Cost per Serving</div>
                        <div className="stat-value text-secondary">${result.recipe.costPerServing}</div>
                        <div className="stat-desc">Per person</div>
                    </div>

                    <div className="stat bg-accent/10 rounded-lg">
                        <div className="stat-title text-accent">Savings vs Eating Out</div>
                        <div className="stat-value text-accent">${result.savings.savings}</div>
                        <div className="stat-desc">{result.savings.savingsPercentage}% savings</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className="h-4 w-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && <OverviewTab result={result} />}
                    {activeTab === 'ingredients' && <IngredientsTab result={result} />}
                    {activeTab === 'shopping' && <ShoppingTab result={result} />}
                    {activeTab === 'budget' && <BudgetTab result={result} />}
                </div>
            </div>
        </div>
    );
}

// Overview Tab Component
function OverviewTab({ result }) {
    const categoryColors = {
        protein: 'bg-red-500',
        vegetable: 'bg-green-500',
        grain: 'bg-yellow-500',
        dairy: 'bg-blue-500',
        fruit: 'bg-pink-500',
        spice: 'bg-purple-500',
        oil: 'bg-orange-500',
        other: 'bg-gray-500'
    };

    return (
        <div className="space-y-6">
            {/* Cost Breakdown by Category */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Cost Breakdown by Category</h3>
                <div className="space-y-2">
                    {Object.entries(result.recipe.costByCategory).map(([category, cost]) => (
                        <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${categoryColors[category] || 'bg-gray-500'}`}></div>
                                <span className="capitalize">{category}</span>
                            </div>
                            <span className="font-medium">${cost}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Savings Analysis */}
            <div className="bg-success/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-success mb-2">Savings Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-base-content/70">Restaurant Cost:</span>
                        <span className="font-medium ml-2">${result.savings.restaurantCost}</span>
                    </div>
                    <div>
                        <span className="text-base-content/70">Homemade Cost:</span>
                        <span className="font-medium ml-2">${result.savings.homemadeCost}</span>
                    </div>
                    <div>
                        <span className="text-base-content/70">Total Savings:</span>
                        <span className="font-medium text-success ml-2">${result.savings.savings}</span>
                    </div>
                    <div>
                        <span className="text-base-content/70">Savings %:</span>
                        <span className="font-medium text-success ml-2">{result.savings.savingsPercentage}%</span>
                    </div>
                </div>
            </div>

            {/* Budget Status */}
            {result.budget && (
                <div className={`p-4 rounded-lg ${result.budget.isWithinBudget ? 'bg-success/10' : 'bg-error/10'}`}>
                    <h3 className={`text-lg font-semibold mb-2 ${result.budget.isWithinBudget ? 'text-success' : 'text-error'}`}>
                        Budget Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-base-content/70">Budget:</span>
                            <span className="font-medium ml-2">${result.budget.budget}</span>
                        </div>
                        <div>
                            <span className="text-base-content/70">Recipe Cost:</span>
                            <span className="font-medium ml-2">${result.recipe.totalCost}</span>
                        </div>
                        <div>
                            <span className="text-base-content/70">Remaining:</span>
                            <span className={`font-medium ml-2 ${result.budget.isWithinBudget ? 'text-success' : 'text-error'}`}>
                                ${result.budget.remainingBudget}
                            </span>
                        </div>
                        <div>
                            <span className="text-base-content/70">Used:</span>
                            <span className="font-medium ml-2">{result.budget.budgetPercentage}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ingredients Tab Component
function IngredientsTab({ result }) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">Ingredient Cost Breakdown</h3>
            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th>Measure</th>
                            <th>Category</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.recipe.ingredients.map((ingredient, index) => (
                            <tr key={index}>
                                <td className="font-medium">{ingredient.ingredient}</td>
                                <td>{ingredient.measure}</td>
                                <td>
                                    <span className="badge badge-outline capitalize">
                                        {ingredient.category}
                                    </span>
                                </td>
                                <td className="font-medium">${ingredient.cost}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Shopping Tab Component
function ShoppingTab({ result }) {
    const exportShoppingList = () => {
        const list = result.shoppingList.map(item =>
            `${item.name} - ${item.measure} ($${item.estimatedCost})`
        ).join('\n');

        const totalCost = result.shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0);
        const exportText = `Shopping List\n\n${list}\n\nTotal Estimated Cost: $${totalCost}`;

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shopping-list.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Shopping List</h3>
                <button
                    onClick={exportShoppingList}
                    className="btn btn-sm btn-outline btn-primary"
                >
                    Export List
                </button>
            </div>

            <div className="space-y-2">
                {result.shoppingList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                        <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-base-content/70 ml-2">({item.measure})</span>
                        </div>
                        <span className="font-medium text-primary">${item.estimatedCost}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Estimated Cost:</span>
                    <span className="text-2xl font-bold text-primary">
                        ${result.shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}

// Budget Tab Component
function BudgetTab({ result }) {
    if (!result.budget) {
        return (
            <div className="text-center py-8">
                <p className="text-base-content/60">
                    No budget information available. Set a budget limit in the calculator settings to see budget analysis.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Budget Limit</div>
                    <div className="stat-value text-primary">${result.budget.budget}</div>
                </div>

                <div className="stat bg-base-100 rounded-lg">
                    <div className="stat-title">Recipe Cost</div>
                    <div className="stat-value text-secondary">${result.recipe.totalCost}</div>
                </div>
            </div>

            {/* Budget Status */}
            <div className={`p-4 rounded-lg ${result.budget.isWithinBudget ? 'bg-success/10' : 'bg-error/10'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${result.budget.isWithinBudget ? 'text-success' : 'text-error'}`}>
                    {result.budget.isWithinBudget ? '✅ Within Budget' : '❌ Over Budget'}
                </h3>
                <p className="text-sm text-base-content/70">
                    {result.budget.isWithinBudget
                        ? `You have $${result.budget.remainingBudget} remaining in your budget.`
                        : `You're $${Math.abs(result.budget.remainingBudget)} over your budget.`
                    }
                </p>
            </div>

            {/* Budget Usage Bar */}
            <div>
                <div className="flex justify-between text-sm mb-2">
                    <span>Budget Usage</span>
                    <span>{result.budget.budgetPercentage}%</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-300 ${result.budget.budgetPercentage > 100
                            ? 'bg-error'
                            : result.budget.budgetPercentage > 80
                                ? 'bg-warning'
                                : 'bg-success'
                            }`}
                        style={{ width: `${Math.min(result.budget.budgetPercentage, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-info/10 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-info mb-2">Recommendations</h3>
                {result.budget.isWithinBudget ? (
                    <ul className="text-sm space-y-1">
                        <li>• Great job staying within budget!</li>
                        <li>• Consider adding more ingredients for variety</li>
                        <li>• You could upgrade to premium ingredients</li>
                    </ul>
                ) : (
                    <ul className="text-sm space-y-1">
                        <li>• Consider using cheaper ingredient alternatives</li>
                        <li>• Reduce portion sizes to fit budget</li>
                        <li>• Look for sales and coupons</li>
                        <li>• Consider buying ingredients in bulk</li>
                    </ul>
                )}
            </div>
        </div>
    );
}
