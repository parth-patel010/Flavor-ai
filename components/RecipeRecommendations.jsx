"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon, ClockIcon, StarIcon, FireIcon } from "@/components/Icons";

export default function RecipeRecommendations({ type = "trending", filters = {} }) {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchRecommendations();
    }, [type, filters]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/get-recommendations?type=${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filters })
            });

            if (!response.ok) throw new Error('Failed to fetch recommendations');

            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setError(err.message);
            // Fallback to mock data for demo
            setRecommendations(generateMockRecommendations(type));
        } finally {
            setLoading(false);
        }
    };

    const generateMockRecommendations = (type) => {
        const mockRecipes = [
            {
                id: 1,
                name: "Creamy Mushroom Risotto",
                image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
                rating: 4.8,
                cookTime: 35,
                difficulty: "Medium",
                cuisine: "Italian",
                tags: ["Vegetarian", "Gluten-Free"],
                confidence: 0.92,
                reason: "Based on your love for Italian cuisine and vegetarian dishes"
            },
            {
                id: 2,
                name: "Spicy Thai Green Curry",
                image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
                rating: 4.6,
                cookTime: 25,
                difficulty: "Easy",
                cuisine: "Thai",
                tags: ["Spicy", "Quick"],
                confidence: 0.87,
                reason: "Matches your preference for quick, flavorful meals"
            },
            {
                id: 3,
                name: "Classic Beef Burger",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
                rating: 4.7,
                cookTime: 20,
                difficulty: "Easy",
                cuisine: "American",
                tags: ["Beef", "Quick"],
                confidence: 0.85,
                reason: "Perfect for your weekend comfort food cravings"
            },
            {
                id: 4,
                name: "Mediterranean Quinoa Bowl",
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
                rating: 4.5,
                cookTime: 30,
                difficulty: "Easy",
                cuisine: "Mediterranean",
                tags: ["Healthy", "Vegetarian"],
                confidence: 0.78,
                reason: "Aligns with your healthy eating goals"
            }
        ];

        if (type === "similar") {
            return mockRecipes.map(recipe => ({
                ...recipe,
                reason: "Similar to recipes you've enjoyed recently"
            }));
        }

        return mockRecipes;
    };

    const handleRecipeClick = (recipeId) => {
        router.push(`/meal/${recipeId}`);
    };

    const handleFavorite = (recipeId, event) => {
        event.stopPropagation();
        // Toggle favorite logic here
        console.log('Toggle favorite for recipe:', recipeId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-error mb-4">⚠️ {error}</div>
                <button
                    onClick={fetchRecommendations}
                    className="btn btn-primary"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                    {type === "trending" && "🔥 Trending Recipes"}
                    {type === "similar" && "🔄 Similar Recipes"}
                </h2>
                <p className="text-base-content/70">
                    {type === "trending"
                        ? "Discover what's popular in the cooking community right now"
                        : "Find recipes similar to ones you've enjoyed"
                    }
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.map((recipe) => (
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
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={(e) => handleFavorite(recipe.id, e)}
                                    className="btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 text-primary border-0"
                                >
                                    <HeartIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute top-3 left-3">
                                <div className="badge badge-primary badge-sm">
                                    {Math.round((recipe.confidence || 0.8) * 100)}% Match
                                </div>
                            </div>
                        </div>

                        {/* Recipe Content */}
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                {recipe.name}
                            </h3>

                            {/* Rating and Time */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{recipe.rating || 4.5}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-base-content/70">
                                    <ClockIcon className="w-4 h-4" />
                                    {recipe.cookTime || 30} min
                                </div>
                            </div>

                            {/* Tags */}
                            {recipe.tags && recipe.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {recipe.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-outline badge-sm text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* AI Reason */}
                            {recipe.reason && (
                                <div className="text-xs text-base-content/60 bg-base-200 p-2 rounded-lg">
                                    <span className="font-medium">🤖 AI Insight:</span> {recipe.reason}
                                </div>
                            )}

                            {/* Difficulty and Cuisine */}
                            <div className="flex items-center justify-between mt-3 text-xs text-base-content/70">
                                <span className="capitalize">{recipe.difficulty || 'Medium'}</span>
                                <span className="capitalize">{recipe.cuisine || 'General'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            <div className="text-center pt-8">
                <button className="btn btn-outline btn-primary">
                    Load More Recommendations
                </button>
            </div>
        </div>
    );
}
