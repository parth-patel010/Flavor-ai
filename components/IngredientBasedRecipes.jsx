"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, PlusIcon, XMarkIcon } from "@/components/Icons";

export default function IngredientBasedRecipes({ filters = {} }) {
    const [ingredients, setIngredients] = useState([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const router = useRouter();

    const commonIngredients = [
        "Chicken", "Rice", "Tomatoes", "Onions", "Garlic", "Olive Oil",
        "Eggs", "Milk", "Cheese", "Pasta", "Beef", "Fish", "Potatoes",
        "Carrots", "Bell Peppers", "Spinach", "Mushrooms", "Lemon"
    ];

    useEffect(() => {
        if (ingredients.length > 0) {
            fetchIngredientBasedRecipes();
        }
    }, [ingredients, filters]);

    const addIngredient = () => {
        if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
            setIngredients([...ingredients, newIngredient.trim()]);
            setNewIngredient("");
        }
    };

    const removeIngredient = (ingredient) => {
        setIngredients(ingredients.filter(i => i !== ingredient));
    };

    const addCommonIngredient = (ingredient) => {
        if (!ingredients.includes(ingredient)) {
            setIngredients([...ingredients, ingredient]);
        }
    };

    const fetchIngredientBasedRecipes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/get-recommendations?type=ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingredients,
                    filters
                })
            });

            if (!response.ok) throw new Error('Failed to fetch recipes');

            const data = await response.json();
            setRecipes(data.recommendations || []);
        } catch (err) {
            console.error('Error fetching ingredient-based recipes:', err);
            // Fallback to mock data
            setRecipes(generateMockIngredientRecipes());
        } finally {
            setLoading(false);
        }
    };

    const generateMockIngredientRecipes = () => {
        const mockRecipes = [
            {
                id: 1,
                name: "Chicken Stir Fry",
                image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
                matchScore: 95,
                usedIngredients: ["Chicken", "Bell Peppers", "Garlic"],
                missingIngredients: ["Soy Sauce", "Ginger"],
                cookTime: 20,
                difficulty: "Easy"
            },
            {
                id: 2,
                name: "Tomato Basil Pasta",
                image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
                matchScore: 88,
                usedIngredients: ["Pasta", "Tomatoes", "Garlic"],
                missingIngredients: ["Basil", "Parmesan"],
                cookTime: 25,
                difficulty: "Easy"
            },
            {
                id: 3,
                name: "Rice and Vegetable Bowl",
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
                matchScore: 82,
                usedIngredients: ["Rice", "Carrots", "Bell Peppers"],
                missingIngredients: ["Soy Sauce", "Sesame Oil"],
                cookTime: 30,
                difficulty: "Easy"
            }
        ];

        return mockRecipes.filter(recipe =>
            recipe.usedIngredients.some(ingredient =>
                ingredients.some(userIngredient =>
                    userIngredient.toLowerCase().includes(ingredient.toLowerCase()) ||
                    ingredient.toLowerCase().includes(userIngredient.toLowerCase())
                )
            )
        );
    };

    const handleRecipeClick = (recipeId) => {
        router.push(`/meal/${recipeId}`);
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">🥘 What Can I Cook?</h2>
                <p className="text-base-content/70">
                    Tell us what ingredients you have, and we'll suggest delicious recipes you can make!
                </p>
            </div>

            {/* Ingredient Input Section */}
            <div className="bg-base-200 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">Add Your Ingredients</h3>

                {/* Input Field */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                        placeholder="Type an ingredient (e.g., chicken, tomatoes)..."
                        className="input input-bordered flex-1"
                    />
                    <button
                        onClick={addIngredient}
                        className="btn btn-primary"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add
                    </button>
                </div>

                {/* Current Ingredients */}
                {ingredients.length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-medium mb-3">Your Ingredients:</h4>
                        <div className="flex flex-wrap gap-2">
                            {ingredients.map((ingredient, index) => (
                                <div
                                    key={index}
                                    className="badge badge-primary badge-lg gap-2"
                                >
                                    {ingredient}
                                    <button
                                        onClick={() => removeIngredient(ingredient)}
                                        className="btn btn-ghost btn-xs p-0"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Common Ingredients */}
                <div>
                    <h4 className="font-medium mb-3">Quick Add Common Ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                        {commonIngredients.map((ingredient) => (
                            <button
                                key={ingredient}
                                onClick={() => addCommonIngredient(ingredient)}
                                disabled={ingredients.includes(ingredient)}
                                className={`btn btn-outline btn-sm ${ingredients.includes(ingredient)
                                    ? 'btn-disabled opacity-50'
                                    : 'hover:btn-primary'
                                    }`}
                            >
                                {ingredient}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recipe Results */}
            {ingredients.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold">
                            🎯 Recipe Suggestions ({recipes.length})
                        </h3>
                        {loading && (
                            <div className="loading loading-spinner loading-md text-primary"></div>
                        )}
                    </div>

                    {recipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map((recipe) => (
                                <div
                                    key={recipe.id}
                                    onClick={() => handleRecipeClick(recipe.id)}
                                    className="group cursor-pointer bg-base-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-base-300 overflow-hidden"
                                >
                                    {/* Recipe Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={recipe.image}
                                            alt={recipe.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <div className="badge badge-success badge-sm">
                                                {recipe.matchScore || 85}% Match
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recipe Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                            {recipe.name}
                                        </h3>

                                        {/* Match Score */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Match Score:</span>
                                                <span className="font-bold text-success">{recipe.matchScore || 85}%</span>
                                            </div>
                                            <progress
                                                className="progress progress-success w-full"
                                                value={recipe.matchScore || 85}
                                                max="100"
                                            ></progress>
                                        </div>

                                        {/* Used Ingredients */}
                                        {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
                                            <div className="mb-3">
                                                <h4 className="text-sm font-medium text-success mb-1">✅ You have:</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {recipe.usedIngredients.map((ingredient, index) => (
                                                        <span key={index} className="badge badge-success badge-outline badge-sm">
                                                            {ingredient}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Missing Ingredients */}
                                        {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                                            <div className="mb-3">
                                                <h4 className="text-sm font-medium text-warning mb-1">⚠️ You need:</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {recipe.missingIngredients.map((ingredient, index) => (
                                                        <span key={index} className="badge badge-warning badge-outline badge-sm">
                                                            {ingredient}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recipe Details */}
                                        <div className="flex items-center justify-between text-xs text-base-content/70">
                                            <span>⏱️ {recipe.cookTime || 30} min</span>
                                            <span>📊 {recipe.difficulty || 'Medium'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">🔍</div>
                            <h4 className="text-xl font-semibold mb-2">No recipes found</h4>
                            <p className="text-base-content/70">
                                Try adding more ingredients or adjusting your filters
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {ingredients.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🥘</div>
                    <h3 className="text-2xl font-bold mb-2">Start Adding Ingredients</h3>
                    <p className="text-base-content/70 mb-6">
                        Add the ingredients you have available, and we'll suggest delicious recipes you can make!
                    </p>
                    <div className="flex justify-center">
                        <button
                            onClick={() => setNewIngredient("Chicken")}
                            className="btn btn-primary btn-lg"
                        >
                            <SearchIcon className="w-5 h-5 mr-2" />
                            Start Exploring
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
