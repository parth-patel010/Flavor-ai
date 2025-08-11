import { NextResponse } from 'next/server';
import { model } from '@/lib/groq';

export async function POST(request) {
    try {
        const { type, filters = {}, ingredients = [], preferences = {} } = await request.json();

        let recommendations = [];
        let aiInsights = '';

        // Generate AI-powered recommendations based on type
        switch (type) {
            case 'personalized':
                recommendations = await generatePersonalizedRecommendations(filters, preferences);
                aiInsights = await generatePersonalizedInsights(preferences);
                break;

            case 'ingredients':
                recommendations = await generateIngredientBasedRecommendations(ingredients, filters);
                aiInsights = await generateIngredientInsights(ingredients);
                break;

            case 'trending':
                recommendations = await generateTrendingRecommendations(filters);
                aiInsights = await generateTrendingInsights();
                break;

            case 'similar':
                recommendations = await generateSimilarRecommendations(filters, preferences);
                aiInsights = await generateSimilarInsights(preferences);
                break;

            default:
                recommendations = await generateGeneralRecommendations(filters);
                aiInsights = await generateGeneralInsights();
        }

        // Apply filters to recommendations
        const filteredRecommendations = applyFilters(recommendations, filters);

        return NextResponse.json({
            success: true,
            recommendations: filteredRecommendations,
            aiInsights,
            totalCount: filteredRecommendations.length,
            appliedFilters: filters
        });

    } catch (error) {
        console.error('Error in recommendations API:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate recommendations',
                fallback: true
            },
            { status: 500 }
        );
    }
}

async function generatePersonalizedRecommendations(filters, preferences) {
    try {
        // Use Groq AI to generate personalized recommendations
        const prompt = `Generate 4 personalized recipe recommendations based on these user preferences: ${JSON.stringify(preferences)}. 
    Consider dietary restrictions: ${filters.dietary?.join(', ') || 'none'}, 
    cuisine preferences: ${filters.cuisine?.join(', ') || 'any'}, 
    max cooking time: ${filters.maxTime || 60} minutes, 
    max calories: ${filters.maxCalories || 800}.
    
    Return a JSON array with recipe objects containing: id, name, image (unsplash URL), rating, cookTime, difficulty, cuisine, tags, confidence (0.0-1.0), reason (AI explanation), personalization (object with user-specific details).`;

        const result = await model.generate(prompt);
        const aiResponse = result.text;

        // Try to parse AI response, fallback to mock data if parsing fails
        try {
            const parsed = JSON.parse(aiResponse);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Ensure all recipes have required properties
                return parsed.map(recipe => ({
                    ...recipe,
                    personalization: recipe.personalization || {
                        cuisinePreference: recipe.cuisine || 'General',
                        difficulty: recipe.difficulty || 'Medium',
                        timePreference: recipe.cookTime <= 30 ? 'Quick' : 'Standard'
                    }
                }));
            }
        } catch (parseError) {
            console.log('AI response parsing failed, using fallback data');
        }
    } catch (aiError) {
        console.log('AI generation failed, using fallback data');
    }

    // Fallback mock data
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
        }
    ];
}

async function generateIngredientBasedRecommendations(ingredients, filters) {
    try {
        const prompt = `Generate 3 recipe recommendations based on these available ingredients: ${ingredients.join(', ')}. 
    Consider dietary restrictions: ${filters.dietary?.join(', ') || 'none'}, 
    max cooking time: ${filters.maxTime || 60} minutes.
    
    Return a JSON array with recipe objects containing: id, name, image (unsplash URL), matchScore (0-100), usedIngredients (array), missingIngredients (array), cookTime, difficulty.`;

        const result = await model.generate(prompt);
        const aiResponse = result.text;

        try {
            const parsed = JSON.parse(aiResponse);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Ensure all recipes have required properties
                return parsed.map(recipe => ({
                    ...recipe,
                    matchScore: recipe.matchScore || 85,
                    usedIngredients: recipe.usedIngredients || ingredients.slice(0, 3),
                    missingIngredients: recipe.missingIngredients || []
                }));
            }
        } catch (parseError) {
            console.log('AI response parsing failed, using fallback data');
        }
    } catch (aiError) {
        console.log('AI generation failed, using fallback data');
    }

    // Fallback mock data
    return [
        {
            id: 1,
            name: "Chicken Stir Fry",
            image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
            matchScore: 95,
            usedIngredients: ["Chicken", "Bell Peppers", "Garlic"],
            missingIngredients: ["Soy Sauce", "Ginger"],
            cookTime: 20,
            difficulty: "Easy"
        }
    ];
}

async function generateTrendingRecommendations(filters) {
    // Mock trending data with seasonal and popular recipes
    return [
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
            reason: "Trending this season - perfect comfort food for cooler weather"
        }
    ];
}

async function generateSimilarRecommendations(filters, preferences) {
    // Mock similar recipes based on user history
    return [
        {
            id: 1,
            name: "Spicy Thai Green Curry",
            image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop",
            rating: 4.6,
            cookTime: 25,
            difficulty: "Easy",
            cuisine: "Thai",
            tags: ["Spicy", "Quick"],
            confidence: 0.87,
            reason: "Similar to recipes you've enjoyed recently"
        }
    ];
}

async function generateGeneralRecommendations(filters) {
    // General recommendations when no specific type is specified
    return [
        {
            id: 1,
            name: "Classic Beef Burger",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
            rating: 4.7,
            cookTime: 20,
            difficulty: "Easy",
            cuisine: "American",
            tags: ["Beef", "Quick"],
            confidence: 0.85,
            reason: "A classic favorite that's always a hit"
        }
    ];
}

async function generatePersonalizedInsights(preferences) {
    try {
        const prompt = `Generate a brief, friendly insight about the user's cooking preferences based on: ${JSON.stringify(preferences)}. 
    Keep it under 100 characters and make it encouraging.`;

        const result = await model.generate(prompt);
        return result.text.trim();
    } catch (error) {
        return "We're learning your taste preferences to give you better recommendations!";
    }
}

async function generateIngredientInsights(ingredients) {
    try {
        const prompt = `Generate a brief insight about cooking with these ingredients: ${ingredients.join(', ')}. 
    Keep it under 100 characters and make it helpful.`;

        const result = await model.generate(prompt);
        return result.text.trim();
    } catch (error) {
        return `Great ingredients! Let's find some delicious recipes for you.`;
    }
}

async function generateTrendingInsights() {
    return "Discover what's popular in the cooking community right now!";
}

async function generateSimilarInsights(preferences) {
    return "Find recipes similar to ones you've enjoyed recently.";
}

async function generateGeneralInsights() {
    return "Explore our curated collection of delicious recipes!";
}

function applyFilters(recommendations, filters) {
    return recommendations.filter(recipe => {
        // Dietary restrictions
        if (filters.dietary && filters.dietary.length > 0) {
            const hasDietaryMatch = filters.dietary.some(diet =>
                recipe.tags?.some(tag =>
                    tag.toLowerCase().includes(diet.toLowerCase().replace('-', ''))
                )
            );
            if (!hasDietaryMatch) return false;
        }

        // Cuisine preferences
        if (filters.cuisine && filters.cuisine.length > 0) {
            if (!filters.cuisine.some(cuisine =>
                recipe.cuisine?.toLowerCase().includes(cuisine.toLowerCase())
            )) {
                return false;
            }
        }

        // Difficulty level
        if (filters.difficulty && filters.difficulty !== "all") {
            if (recipe.difficulty !== filters.difficulty) return false;
        }

        // Cooking time
        if (filters.maxTime && recipe.cookTime > filters.maxTime) {
            return false;
        }

        // Calories (if available)
        if (filters.maxCalories && recipe.calories && recipe.calories > filters.maxCalories) {
            return false;
        }

        return true;
    });
}
