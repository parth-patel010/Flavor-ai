"use client";

import { useState } from "react";
import RecommendationFilters from "@/components/RecommendationFilters";
import RecipeRecommendations from "@/components/RecipeRecommendations";
import IngredientBasedRecipes from "@/components/IngredientBasedRecipes";
import PersonalizedFeed from "@/components/PersonalizedFeed";

export default function TestRecommendationsPage() {
    const [filters, setFilters] = useState({
        dietary: [],
        cuisine: [],
        difficulty: "all",
        maxTime: 60,
        maxCalories: 800
    });

    return (
        <div className="min-h-screen bg-base-100 p-8">
            <h1 className="text-3xl font-bold mb-8">Test Recommendations Components</h1>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">1. Recommendation Filters</h2>
                    <RecommendationFilters filters={filters} setFilters={setFilters} />
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">2. Recipe Recommendations (Trending)</h2>
                    <RecipeRecommendations type="trending" filters={filters} />
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">3. Ingredient Based Recipes</h2>
                    <IngredientBasedRecipes filters={filters} />
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">4. Personalized Feed</h2>
                    <PersonalizedFeed filters={filters} />
                </div>
            </div>
        </div>
    );
}
