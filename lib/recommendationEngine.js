/**
 * AI-Powered Recipe Recommendation Engine
 * Implements collaborative filtering, content-based filtering, and recipe similarity algorithms
 */

export class RecommendationEngine {
    constructor() {
        this.userPreferences = new Map();
        this.recipeSimilarityMatrix = new Map();
        this.userInteractionHistory = new Map();
        this.recipeMetadata = new Map();
    }

    /**
     * Generate personalized recommendations using hybrid approach
     */
    async generatePersonalizedRecommendations(userId, filters = {}) {
        try {
            const userPrefs = this.userPreferences.get(userId) || {};
            const userHistory = this.userInteractionHistory.get(userId) || [];

            // Combine collaborative filtering and content-based filtering
            const collaborativeScore = this.collaborativeFiltering(userId, userHistory);
            const contentScore = this.contentBasedFiltering(userPrefs, filters);
            const hybridScore = this.hybridScoring(collaborativeScore, contentScore);

            // Apply filters and return top recommendations
            const filteredRecipes = this.applyAdvancedFilters(hybridScore, filters);
            return this.rankRecommendations(filteredRecipes, userPrefs);

        } catch (error) {
            console.error('Error generating personalized recommendations:', error);
            return this.getFallbackRecommendations(filters);
        }
    }

    /**
     * Collaborative filtering based on similar users
     */
    collaborativeFiltering(userId, userHistory) {
        const userScores = new Map();

        // Find similar users based on interaction patterns
        const similarUsers = this.findSimilarUsers(userId, userHistory);

        // Calculate recipe scores based on similar users' preferences
        similarUsers.forEach(similarUser => {
            const userRecipes = this.userInteractionHistory.get(similarUser.id) || [];
            userRecipes.forEach(interaction => {
                const currentScore = userScores.get(interaction.recipeId) || 0;
                const similarityWeight = similarUser.similarity;
                const interactionWeight = this.calculateInteractionWeight(interaction);

                userScores.set(
                    interaction.recipeId,
                    currentScore + (similarityWeight * interactionWeight)
                );
            });
        });

        return userScores;
    }

    /**
     * Content-based filtering using recipe features
     */
    contentBasedFiltering(userPrefs, filters) {
        const contentScores = new Map();

        // Score recipes based on user preferences
        this.recipeMetadata.forEach((recipe, recipeId) => {
            let score = 0;

            // Cuisine preference matching
            if (userPrefs.preferredCuisines && recipe.cuisine) {
                const cuisineMatch = userPrefs.preferredCuisines.includes(recipe.cuisine);
                score += cuisineMatch ? 0.3 : 0;
            }

            // Dietary preference matching
            if (userPrefs.dietaryPreferences && recipe.tags) {
                const dietaryMatches = userPrefs.dietaryPreferences.filter(diet =>
                    recipe.tags.some(tag => tag.toLowerCase().includes(diet.toLowerCase()))
                );
                score += (dietaryMatches.length / userPrefs.dietaryPreferences.length) * 0.25;
            }

            // Cooking time preference
            if (userPrefs.timePreference && recipe.cookTime) {
                const timeMatch = this.calculateTimePreferenceScore(userPrefs.timePreference, recipe.cookTime);
                score += timeMatch * 0.2;
            }

            // Difficulty level preference
            if (userPrefs.skillLevel && recipe.difficulty) {
                const difficultyMatch = userPrefs.skillLevel === recipe.difficulty ? 0.15 : 0;
                score += difficultyMatch;
            }

            // Spice level preference
            if (userPrefs.spicePreference && recipe.tags) {
                const spiceMatch = this.calculateSpicePreferenceScore(userPrefs.spicePreference, recipe.tags);
                score += spiceMatch * 0.1;
            }

            contentScores.set(recipeId, score);
        });

        return contentScores;
    }

    /**
     * Hybrid scoring combining multiple approaches
     */
    hybridScoring(collaborativeScore, contentScore) {
        const hybridScores = new Map();
        const allRecipeIds = new Set([
            ...collaborativeScore.keys(),
            ...contentScore.keys()
        ]);

        allRecipeIds.forEach(recipeId => {
            const collaborative = collaborativeScore.get(recipeId) || 0;
            const content = contentScore.get(recipeId) || 0;

            // Weighted combination (can be tuned based on performance)
            const hybridScore = (collaborative * 0.6) + (content * 0.4);
            hybridScores.set(recipeId, hybridScore);
        });

        return hybridScores;
    }

    /**
     * Find similar users based on interaction patterns
     */
    findSimilarUsers(userId, userHistory) {
        const similarUsers = [];
        const userInteractions = new Set(userHistory.map(h => h.recipeId));

        this.userInteractionHistory.forEach((otherHistory, otherUserId) => {
            if (otherUserId === userId) return;

            const otherInteractions = new Set(otherHistory.map(h => h.recipeId));
            const intersection = new Set([...userInteractions].filter(x => otherInteractions.has(x)));
            const union = new Set([...userInteractions, ...otherInteractions]);

            // Jaccard similarity
            const similarity = intersection.size / union.size;

            if (similarity > 0.1) { // Minimum similarity threshold
                similarUsers.push({
                    id: otherUserId,
                    similarity: similarity
                });
            }
        });

        // Sort by similarity and return top 10
        return similarUsers
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);
    }

    /**
     * Calculate interaction weight based on type and recency
     */
    calculateInteractionWeight(interaction) {
        const baseWeights = {
            'view': 1,
            'like': 3,
            'favorite': 5,
            'cook': 8,
            'rate': 4
        };

        const baseWeight = baseWeights[interaction.type] || 1;
        const recencyWeight = this.calculateRecencyWeight(interaction.timestamp);

        return baseWeight * recencyWeight;
    }

    /**
     * Calculate recency weight (more recent interactions have higher weight)
     */
    calculateRecencyWeight(timestamp) {
        const now = Date.now();
        const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);

        // Exponential decay: interactions older than 30 days get very low weight
        return Math.exp(-daysDiff / 30);
    }

    /**
     * Calculate time preference score
     */
    calculateTimePreferenceScore(userPreference, recipeTime) {
        const timeRanges = {
            'quick': { min: 0, max: 20, ideal: 15 },
            'medium': { min: 15, max: 45, ideal: 30 },
            'slow': { min: 30, max: 120, ideal: 60 }
        };

        const range = timeRanges[userPreference];
        if (!range) return 0.5; // Default score

        if (recipeTime >= range.min && recipeTime <= range.max) {
            // Calculate how close to ideal time
            const distance = Math.abs(recipeTime - range.ideal);
            const maxDistance = (range.max - range.min) / 2;
            return 1 - (distance / maxDistance);
        }

        return 0; // Outside preferred range
    }

    /**
     * Calculate spice preference score
     */
    calculateSpicePreferenceScore(userPreference, recipeTags) {
        const spiceKeywords = {
            'mild': ['mild', 'gentle', 'subtle'],
            'medium': ['medium', 'moderate', 'balanced'],
            'spicy': ['spicy', 'hot', 'fiery', 'bold', 'zesty']
        };

        const userKeywords = spiceKeywords[userPreference] || [];
        const recipeSpiceLevel = recipeTags.find(tag =>
            userKeywords.some(keyword => tag.toLowerCase().includes(keyword))
        );

        return recipeSpiceLevel ? 1 : 0;
    }

    /**
     * Apply advanced filters to recommendations
     */
    applyAdvancedFilters(recipeScores, filters) {
        const filteredRecipes = [];

        recipeScores.forEach((score, recipeId) => {
            const recipe = this.recipeMetadata.get(recipeId);
            if (!recipe) return;

            // Dietary restrictions
            if (filters.dietary && filters.dietary.length > 0) {
                const hasDietaryMatch = filters.dietary.some(diet =>
                    recipe.tags?.some(tag =>
                        tag.toLowerCase().includes(diet.toLowerCase().replace('-', ''))
                    )
                );
                if (!hasDietaryMatch) return;
            }

            // Cuisine preferences
            if (filters.cuisine && filters.cuisine.length > 0) {
                if (!filters.cuisine.some(cuisine =>
                    recipe.cuisine?.toLowerCase().includes(cuisine.toLowerCase())
                )) {
                    return;
                }
            }

            // Difficulty level
            if (filters.difficulty && filters.difficulty !== "all") {
                if (recipe.difficulty !== filters.difficulty) return;
            }

            // Cooking time
            if (filters.maxTime && recipe.cookTime > filters.maxTime) {
                return;
            }

            // Calories
            if (filters.maxCalories && recipe.calories && recipe.calories > filters.maxCalories) {
                return;
            }

            filteredRecipes.push({ recipeId, score, recipe });
        });

        return filteredRecipes;
    }

    /**
     * Rank recommendations by relevance and diversity
     */
    rankRecommendations(filteredRecipes, userPrefs) {
        // Sort by score first
        const sortedRecipes = filteredRecipes.sort((a, b) => b.score - a.score);

        // Apply diversity boost to avoid too many similar recipes
        const diverseRecipes = this.applyDiversityBoost(sortedRecipes, userPrefs);

        return diverseRecipes.slice(0, 20); // Return top 20
    }

    /**
     * Apply diversity boost to avoid recipe clustering
     */
    applyDiversityBoost(recipes, userPrefs) {
        const diverseRecipes = [];
        const usedCuisines = new Set();
        const usedDifficulty = new Set();

        recipes.forEach(recipe => {
            let diversityScore = recipe.score;

            // Boost score for diverse cuisines
            if (!usedCuisines.has(recipe.recipe.cuisine)) {
                diversityScore += 0.1;
                usedCuisines.add(recipe.recipe.cuisine);
            }

            // Boost score for diverse difficulty levels
            if (!usedDifficulty.has(recipe.recipe.difficulty)) {
                diversityScore += 0.05;
                usedDifficulty.add(recipe.recipe.difficulty);
            }

            diverseRecipes.push({
                ...recipe,
                finalScore: diversityScore
            });
        });

        // Resort by final score
        return diverseRecipes.sort((a, b) => b.finalScore - a.finalScore);
    }

    /**
     * Get fallback recommendations when AI fails
     */
    getFallbackRecommendations(filters) {
        // Return curated fallback recipes based on filters
        return [
            {
                recipeId: 'fallback-1',
                score: 0.8,
                finalScore: 0.8,
                recipe: {
                    name: "Classic Pasta Carbonara",
                    cuisine: "Italian",
                    difficulty: "Medium",
                    cookTime: 25,
                    tags: ["Pasta", "Quick", "Classic"]
                }
            }
        ];
    }

    /**
     * Update user preferences based on interaction
     */
    updateUserPreferences(userId, recipeId, interactionType) {
        if (!this.userInteractionHistory.has(userId)) {
            this.userInteractionHistory.set(userId, []);
        }

        const userHistory = this.userInteractionHistory.get(userId);
        userHistory.push({
            recipeId,
            type: interactionType,
            timestamp: Date.now()
        });

        // Update user preferences based on interaction
        this.learnFromInteraction(userId, recipeId, interactionType);
    }

    /**
     * Learn from user interactions to improve recommendations
     */
    learnFromInteraction(userId, recipeId, interactionType) {
        const recipe = this.recipeMetadata.get(recipeId);
        if (!recipe) return;

        if (!this.userPreferences.has(userId)) {
            this.userPreferences.set(userId, {});
        }

        const userPrefs = this.userPreferences.get(userId);

        // Learn cuisine preference
        if (recipe.cuisine) {
            if (!userPrefs.preferredCuisines) userPrefs.preferredCuisines = [];
            if (!userPrefs.preferredCuisines.includes(recipe.cuisine)) {
                userPrefs.preferredCuisines.push(recipe.cuisine);
            }
        }

        // Learn dietary preferences from tags
        if (recipe.tags) {
            if (!userPrefs.dietaryPreferences) userPrefs.dietaryPreferences = [];
            recipe.tags.forEach(tag => {
                if (['vegetarian', 'vegan', 'gluten-free'].includes(tag.toLowerCase())) {
                    if (!userPrefs.dietaryPreferences.includes(tag)) {
                        userPrefs.dietaryPreferences.push(tag);
                    }
                }
            });
        }

        // Learn time preference
        if (recipe.cookTime) {
            if (recipe.cookTime <= 20) {
                userPrefs.timePreference = 'quick';
            } else if (recipe.cookTime <= 45) {
                userPrefs.timePreference = 'medium';
            } else {
                userPrefs.timePreference = 'slow';
            }
        }

        // Learn difficulty preference
        if (recipe.difficulty) {
            userPrefs.skillLevel = recipe.difficulty;
        }
    }

    /**
     * Add recipe metadata for similarity calculations
     */
    addRecipeMetadata(recipeId, metadata) {
        this.recipeMetadata.set(recipeId, metadata);
    }

    /**
     * Calculate recipe similarity for content-based filtering
     */
    calculateRecipeSimilarity(recipe1, recipe2) {
        let similarity = 0;

        // Cuisine similarity
        if (recipe1.cuisine === recipe2.cuisine) {
            similarity += 0.3;
        }

        // Tag similarity
        const commonTags = recipe1.tags?.filter(tag =>
            recipe2.tags?.includes(tag)
        ) || [];
        const tagSimilarity = commonTags.length / Math.max(recipe1.tags?.length || 1, recipe2.tags?.length || 1);
        similarity += tagSimilarity * 0.4;

        // Difficulty similarity
        if (recipe1.difficulty === recipe2.difficulty) {
            similarity += 0.2;
        }

        // Time similarity (closer times get higher similarity)
        const timeDiff = Math.abs(recipe1.cookTime - recipe2.cookTime);
        const maxTime = Math.max(recipe1.cookTime, recipe2.cookTime);
        const timeSimilarity = 1 - (timeDiff / maxTime);
        similarity += timeSimilarity * 0.1;

        return similarity;
    }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
