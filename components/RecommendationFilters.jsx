"use client";

import { useState } from "react";
import { FilterIcon, XMarkIcon } from "@/components/Icons";

export default function RecommendationFilters({ filters, setFilters }) {
    const [showFilters, setShowFilters] = useState(false);

    const dietaryOptions = [
        "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free",
        "Low-Carb", "Low-Sodium", "Keto", "Paleo"
    ];

    const cuisineOptions = [
        "Italian", "Mexican", "Asian", "American", "Mediterranean",
        "Indian", "French", "Thai", "Japanese", "Greek"
    ];

    const difficultyOptions = ["Easy", "Medium", "Hard"];

    const handleDietaryChange = (diet) => {
        const newDietary = filters.dietary.includes(diet)
            ? filters.dietary.filter(d => d !== diet)
            : [...filters.dietary, diet];

        setFilters({ ...filters, dietary: newDietary });
    };

    const handleCuisineChange = (cuisine) => {
        const newCuisine = filters.cuisine.includes(cuisine)
            ? filters.cuisine.filter(c => c !== cuisine)
            : [...filters.cuisine, cuisine];

        setFilters({ ...filters, cuisine: newCuisine });
    };

    const handleDifficultyChange = (difficulty) => {
        setFilters({ ...filters, difficulty });
    };

    const handleTimeChange = (value) => {
        setFilters({ ...filters, maxTime: parseInt(value) });
    };

    const handleCaloriesChange = (value) => {
        setFilters({ ...filters, maxCalories: parseInt(value) });
    };

    const clearAllFilters = () => {
        setFilters({
            dietary: [],
            cuisine: [],
            difficulty: "all",
            maxTime: 60,
            maxCalories: 800
        });
    };

    const activeFiltersCount = [
        filters.dietary.length,
        filters.cuisine.length,
        filters.difficulty !== "all" ? 1 : 0,
        filters.maxTime !== 60 ? 1 : 0,
        filters.maxCalories !== 800 ? 1 : 0
    ].reduce((sum, count) => sum + count, 0);

    return (
        <div className="mb-8">
            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-outline btn-primary"
                >
                    <FilterIcon className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="badge badge-primary badge-sm ml-2">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="btn btn-ghost btn-sm text-error"
                    >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {filters.dietary.map(diet => (
                        <span key={diet} className="badge badge-primary badge-outline">
                            {diet}
                            <button
                                onClick={() => handleDietaryChange(diet)}
                                className="ml-1 hover:text-error"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    {filters.cuisine.map(cuisine => (
                        <span key={cuisine} className="badge badge-secondary badge-outline">
                            {cuisine}
                            <button
                                onClick={() => handleCuisineChange(cuisine)}
                                className="ml-1 hover:text-error"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    {filters.difficulty !== "all" && (
                        <span className="badge badge-accent badge-outline">
                            Difficulty: {filters.difficulty}
                            <button
                                onClick={() => handleDifficultyChange("all")}
                                className="ml-1 hover:text-error"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {filters.maxTime !== 60 && (
                        <span className="badge badge-info badge-outline">
                            Max Time: {filters.maxTime}min
                            <button
                                onClick={() => handleTimeChange(60)}
                                className="ml-1 hover:text-error"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {filters.maxCalories !== 800 && (
                        <span className="badge badge-warning badge-outline">
                            Max Calories: {filters.maxCalories}
                            <button
                                onClick={() => handleCaloriesChange(800)}
                                className="ml-1 hover:text-error"
                            >
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-base-200 p-6 rounded-2xl border border-base-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Dietary Restrictions */}
                        <div>
                            <h4 className="font-semibold mb-3 text-primary">🥗 Dietary Preferences</h4>
                            <div className="space-y-2">
                                {dietaryOptions.map(diet => (
                                    <label key={diet} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.dietary.includes(diet)}
                                            onChange={() => handleDietaryChange(diet)}
                                            className="checkbox checkbox-primary checkbox-sm"
                                        />
                                        <span className="text-sm">{diet}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Cuisine Preferences */}
                        <div>
                            <h4 className="font-semibold mb-3 text-secondary">🌍 Cuisine Types</h4>
                            <div className="space-y-2">
                                {cuisineOptions.map(cuisine => (
                                    <label key={cuisine} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.cuisine.includes(cuisine)}
                                            onChange={() => handleCuisineChange(cuisine)}
                                            className="checkbox checkbox-secondary checkbox-sm"
                                        />
                                        <span className="text-sm">{cuisine}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Cooking Constraints */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-3 text-accent">⚡ Cooking Level</h4>
                                <div className="space-y-2">
                                    {difficultyOptions.map(difficulty => (
                                        <label key={difficulty} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="difficulty"
                                                checked={filters.difficulty === difficulty}
                                                onChange={() => handleDifficultyChange(difficulty)}
                                                className="radio radio-accent radio-sm"
                                            />
                                            <span className="text-sm">{difficulty}</span>
                                        </label>
                                    ))}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="difficulty"
                                            checked={filters.difficulty === "all"}
                                            onChange={() => handleDifficultyChange("all")}
                                            className="radio radio-accent radio-sm"
                                        />
                                        <span className="text-sm">All Levels</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-info">⏱️ Max Cooking Time</h4>
                                <input
                                    type="range"
                                    min="15"
                                    max="120"
                                    step="15"
                                    value={filters.maxTime}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className="range range-info range-sm"
                                />
                                <div className="flex justify-between text-xs text-base-content/70 mt-1">
                                    <span>15 min</span>
                                    <span className="font-medium">{filters.maxTime} min</span>
                                    <span>120 min</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-warning">🔥 Max Calories</h4>
                                <input
                                    type="range"
                                    min="200"
                                    max="1500"
                                    step="100"
                                    value={filters.maxCalories}
                                    onChange={(e) => handleCaloriesChange(e.target.value)}
                                    className="range range-warning range-sm"
                                />
                                <div className="flex justify-between text-xs text-base-content/70 mt-1">
                                    <span>200 cal</span>
                                    <span className="font-medium">{filters.maxCalories} cal</span>
                                    <span>1500 cal</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-300">
                        <button
                            onClick={clearAllFilters}
                            className="btn btn-ghost btn-sm"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="btn btn-primary btn-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
