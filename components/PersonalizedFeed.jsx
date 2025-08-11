"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon, ClockIcon, StarIcon, TrendingUpIcon, UserIcon } from "@/components/Icons";

export default function PersonalizedFeed({ filters = {} }) {
    const [personalizedRecipes, setPersonalizedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPreferences, setUserPreferences] = useState({});
    const [preferenceModal, setPreferenceModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPersonalizedRecipes();
        loadUserPreferences();
    }, [filters]);

    const loadUserPreferences = () => {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
            setUserPreferences(JSON.parse(saved));
        }
    };

    const fetchPersonalizedRecipes = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/get-recommendations?type=personalized', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filters,
                    preferences: userPreferences
                })
            });

            if (!response.ok) throw new Error('Failed to fetch personalized recipes');

            const data = await response.json();
            setPersonalizedRecipes(data.recommendations || []);
        } catch (err) {
            console.error('Error fetching personalized recipes:', err);
            // Fallback to mock data
            setPersonalizedRecipes(generateMockPersonalizedRecipes());
        } finally {
            setLoading(false);
        }
    };

    const generateMockPersonalizedRecipes = () => {
        return [
            {
                id: 1,
                name: "Spicy Chicken Tacos",
                image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
                rating: 4.9,
                cookTime: 25,
                difficulty: "Easy",
                cuisine: "Mexican",
                tags: ["Spicy", "Quick", "Chicken"],
                confidence: 0.95,
                reason: "Based on your love for spicy Mexican food and quick meals",
                personalization: {
                    spiceLevel: "High",
                    cuisinePreference: "Mexican",
                    timePreference: "Quick"
                }
            },
            {
                id: 2,
                name: "Creamy Mushroom Pasta",
                image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
                rating: 4.7,
                cookTime: 30,
                difficulty: "Medium",
                cuisine: "Italian",
                tags: ["Vegetarian", "Creamy", "Pasta"],
                confidence: 0.88,
                reason: "Matches your preference for Italian cuisine and vegetarian options",
                personalization: {
                    cuisinePreference: "Italian",
                    dietaryPreference: "Vegetarian",
                    texturePreference: "Creamy"
                }
            },
            {
                id: 3,
                name: "Asian Stir Fry Bowl",
                image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
                rating: 4.6,
                cookTime: 20,
                difficulty: "Easy",
                cuisine: "Asian",
                tags: ["Quick", "Healthy", "Vegetables"],
                confidence: 0.82,
                reason: "Perfect for your healthy eating goals and quick meal preferences",
                personalization: {
                    healthPreference: "Healthy",
                    timePreference: "Quick",
                    cuisinePreference: "Asian"
                }
            },
            {
                id: 4,
                name: "Classic Beef Burger",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
                rating: 4.8,
                cookTime: 20,
                difficulty: "Easy",
                cuisine: "American",
                tags: ["Beef", "Quick", "Comfort"],
                confidence: 0.78,
                reason: "Great for your weekend comfort food cravings",
                personalization: {
                    occasionPreference: "Weekend",
                    meatPreference: "Beef",
                    comfortPreference: "High"
                }
            }
        ];
    };

    const handleRecipeClick = (recipeId) => {
        router.push(`/meal/${recipeId}`);
    };

    const handlePreferenceUpdate = (preferences) => {
        const updated = { ...userPreferences, ...preferences };
        setUserPreferences(updated);
        localStorage.setItem('userPreferences', JSON.stringify(updated));
        setPreferenceModal(false);
        fetchPersonalizedRecipes();
    };

    const handleRecipeFeedback = (recipeId, feedback) => {
        // Update user preferences based on feedback
        const recipe = personalizedRecipes.find(r => r.id === recipeId);
        if (recipe && recipe.personalization) {
            const newPreferences = { ...userPreferences };

            if (feedback === 'like') {
                // Strengthen preferences for this type of recipe
                Object.keys(recipe.personalization).forEach(key => {
                    if (!newPreferences[key]) newPreferences[key] = [];
                    if (!newPreferences[key].includes(recipe.personalization[key])) {
                        newPreferences[key].push(recipe.personalization[key]);
                    }
                });
            }

            setUserPreferences(newPreferences);
            localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with Preferences */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">✨ Your Personalized Feed</h2>
                    <p className="text-base-content/70">
                        AI-powered recommendations tailored to your unique taste preferences
                    </p>
                </div>
                <button
                    onClick={() => setPreferenceModal(true)}
                    className="btn btn-outline btn-primary"
                >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Update Preferences
                </button>
            </div>

            {/* AI Learning Status */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">🧠</div>
                    <div>
                        <h4 className="font-semibold">AI Learning Progress</h4>
                        <p className="text-sm text-base-content/70">
                            {Object.keys(userPreferences).length > 0
                                ? `We've learned ${Object.keys(userPreferences).length} preferences about your taste!`
                                : "Help us learn your preferences by rating recipes and updating your profile."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedRecipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className="group bg-base-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-base-300 overflow-hidden"
                    >
                        {/* Recipe Image */}
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                                <div className="badge badge-primary badge-sm">
                                    {Math.round((recipe.confidence || 0.8) * 100)}% Match
                                </div>
                            </div>
                            <div className="absolute top-3 right-3">
                                <TrendingUpIcon className="w-5 h-5 text-yellow-500" />
                            </div>
                        </div>

                        {/* Recipe Content */}
                        <div className="p-4">
                            <h3
                                onClick={() => handleRecipeClick(recipe.id)}
                                className="font-bold text-lg mb-2 group-hover:text-primary transition-colors cursor-pointer"
                            >
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
                                <div className="text-xs text-base-content/60 bg-base-200 p-2 rounded-lg mb-3">
                                    <span className="font-medium">🤖 Why this recipe:</span> {recipe.reason}
                                </div>
                            )}

                            {/* Personalization Details */}
                            {recipe.personalization && Object.keys(recipe.personalization).length > 0 && (
                                <div className="mb-3">
                                    <h4 className="text-xs font-medium text-primary mb-1">Personalized For You:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(recipe.personalization).map(([key, value]) => (
                                            <span key={key} className="badge badge-primary badge-xs">
                                                {key}: {value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recipe Details */}
                            <div className="flex items-center justify-between text-xs text-base-content/70 mb-3">
                                <span className="capitalize">{recipe.difficulty || 'Medium'}</span>
                                <span className="capitalize">{recipe.cuisine || 'General'}</span>
                            </div>

                            {/* Feedback Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRecipeFeedback(recipe.id, 'like')}
                                    className="btn btn-success btn-sm flex-1"
                                >
                                    👍 Like
                                </button>
                                <button
                                    onClick={() => handleRecipeFeedback(recipe.id, 'dislike')}
                                    className="btn btn-error btn-sm flex-1"
                                >
                                    👎 Dislike
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preference Modal */}
            {preferenceModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Update Your Preferences</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text">Preferred Cuisines</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean'].map(cuisine => (
                                        <button
                                            key={cuisine}
                                            onClick={() => handlePreferenceUpdate({
                                                preferredCuisines: [cuisine]
                                            })}
                                            className="btn btn-outline btn-sm"
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text">Dietary Preferences</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Low-Carb'].map(diet => (
                                        <button
                                            key={diet}
                                            onClick={() => handlePreferenceUpdate({
                                                dietaryPreferences: [diet]
                                            })}
                                            className="btn btn-outline btn-sm"
                                        >
                                            {diet}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                onClick={() => setPreferenceModal(false)}
                                className="btn btn-ghost"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
