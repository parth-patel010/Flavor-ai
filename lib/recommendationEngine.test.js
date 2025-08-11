import { RecommendationEngine } from './recommendationEngine';

describe('RecommendationEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new RecommendationEngine();
    });

    describe('User Preferences Management', () => {
        test('should add and retrieve user preferences', () => {
            const userId = 'user123';
            const preferences = {
                preferredCuisines: ['Italian', 'Mexican'],
                dietaryPreferences: ['Vegetarian'],
                timePreference: 'quick'
            };

            engine.userPreferences.set(userId, preferences);
            const retrieved = engine.userPreferences.get(userId);

            expect(retrieved).toEqual(preferences);
            expect(retrieved.preferredCuisines).toContain('Italian');
            expect(retrieved.dietaryPreferences).toContain('Vegetarian');
        });

        test('should learn from user interactions', () => {
            const userId = 'user123';
            const recipeId = 'recipe456';

            // Add recipe metadata first
            engine.addRecipeMetadata(recipeId, {
                cuisine: 'Italian',
                tags: ['Vegetarian', 'Pasta'],
                cookTime: 20,
                difficulty: 'Easy'
            });

            // Simulate user interaction
            engine.updateUserPreferences(userId, recipeId, 'like');

            const userPrefs = engine.userPreferences.get(userId);
            expect(userPrefs.preferredCuisines).toContain('Italian');
            expect(userPrefs.dietaryPreferences).toContain('Vegetarian');
            expect(userPrefs.timePreference).toBe('quick');
            expect(userPrefs.skillLevel).toBe('Easy');
        });
    });

    describe('Recipe Similarity Calculations', () => {
        test('should calculate recipe similarity correctly', () => {
            const recipe1 = {
                cuisine: 'Italian',
                tags: ['Pasta', 'Vegetarian'],
                difficulty: 'Easy',
                cookTime: 20
            };

            const recipe2 = {
                cuisine: 'Italian',
                tags: ['Pasta', 'Cheese'],
                difficulty: 'Easy',
                cookTime: 25
            };

            const similarity = engine.calculateRecipeSimilarity(recipe1, recipe2);

            // Should have high similarity due to same cuisine, difficulty, and some common tags
            expect(similarity).toBeGreaterThan(0.5);
            expect(similarity).toBeLessThanOrEqual(1.0);
        });

        test('should handle recipes with no common features', () => {
            const recipe1 = {
                cuisine: 'Italian',
                tags: ['Pasta'],
                difficulty: 'Easy',
                cookTime: 20
            };

            const recipe2 = {
                cuisine: 'Mexican',
                tags: ['Spicy', 'Meat'],
                difficulty: 'Hard',
                cookTime: 60
            };

            const similarity = engine.calculateRecipeSimilarity(recipe1, recipe2);
            expect(similarity).toBeLessThan(0.5);
        });
    });

    describe('Content-Based Filtering', () => {
        test('should score recipes based on user preferences', () => {
            const userPrefs = {
                preferredCuisines: ['Italian'],
                dietaryPreferences: ['Vegetarian'],
                timePreference: 'quick'
            };

            // Add test recipes
            engine.addRecipeMetadata('recipe1', {
                cuisine: 'Italian',
                tags: ['Vegetarian', 'Pasta'],
                cookTime: 15,
                difficulty: 'Easy'
            });

            engine.addRecipeMetadata('recipe2', {
                cuisine: 'Mexican',
                tags: ['Meat', 'Spicy'],
                cookTime: 45,
                difficulty: 'Medium'
            });

            const scores = engine.contentBasedFiltering(userPrefs, {});

            expect(scores.get('recipe1')).toBeGreaterThan(scores.get('recipe2'));
        });

        test('should handle missing user preferences gracefully', () => {
            const userPrefs = {};
            const scores = engine.contentBasedFiltering(userPrefs, {});

            // Should return empty map when no preferences
            expect(scores.size).toBe(0);
        });
    });

    describe('Collaborative Filtering', () => {
        test('should find similar users based on interaction patterns', () => {
            const userId = 'user1';
            const userHistory = [
                { recipeId: 'recipe1', type: 'like', timestamp: Date.now() },
                { recipeId: 'recipe2', type: 'favorite', timestamp: Date.now() }
            ];

            // Add another user with similar interactions
            engine.userInteractionHistory.set('user2', [
                { recipeId: 'recipe1', type: 'like', timestamp: Date.now() },
                { recipeId: 'recipe3', type: 'cook', timestamp: Date.now() }
            ]);

            engine.userInteractionHistory.set('user1', userHistory);

            const similarUsers = engine.findSimilarUsers(userId, userHistory);

            expect(similarUsers.length).toBeGreaterThan(0);
            expect(similarUsers[0].similarity).toBeGreaterThan(0);
        });

        test('should calculate interaction weights correctly', () => {
            const interaction = {
                type: 'cook',
                timestamp: Date.now()
            };

            const weight = engine.calculateInteractionWeight(interaction);

            // Cook interactions should have higher weight than view interactions
            expect(weight).toBeGreaterThan(1);
        });
    });

    describe('Filter Application', () => {
        test('should apply dietary filters correctly', () => {
            const filters = {
                dietary: ['Vegetarian']
            };

            const recipeScores = new Map([
                ['recipe1', 0.8],
                ['recipe2', 0.6]
            ]);

            // Add recipe metadata
            engine.addRecipeMetadata('recipe1', {
                tags: ['Vegetarian', 'Pasta']
            });

            engine.addRecipeMetadata('recipe2', {
                tags: ['Meat', 'Spicy']
            });

            const filtered = engine.applyAdvancedFilters(recipeScores, filters);

            expect(filtered.length).toBe(1);
            expect(filtered[0].recipeId).toBe('recipe1');
        });

        test('should apply multiple filters correctly', () => {
            const filters = {
                dietary: ['Vegetarian'],
                cuisine: ['Italian'],
                maxTime: 30
            };

            const recipeScores = new Map([
                ['recipe1', 0.9],
                ['recipe2', 0.7],
                ['recipe3', 0.5]
            ]);

            // Add recipe metadata
            engine.addRecipeMetadata('recipe1', {
                tags: ['Vegetarian'],
                cuisine: 'Italian',
                cookTime: 25
            });

            engine.addRecipeMetadata('recipe2', {
                tags: ['Vegetarian'],
                cuisine: 'Mexican',
                cookTime: 20
            });

            engine.addRecipeMetadata('recipe3', {
                tags: ['Meat'],
                cuisine: 'Italian',
                cookTime: 45
            });

            const filtered = engine.applyAdvancedFilters(recipeScores, filters);

            expect(filtered.length).toBe(1);
            expect(filtered[0].recipeId).toBe('recipe1');
        });
    });

    describe('Diversity Boost', () => {
        test('should apply diversity boost to avoid clustering', () => {
            const recipes = [
                { recipeId: 'recipe1', score: 0.9, recipe: { cuisine: 'Italian', difficulty: 'Easy' } },
                { recipeId: 'recipe2', score: 0.85, recipe: { cuisine: 'Italian', difficulty: 'Easy' } },
                { recipeId: 'recipe3', score: 0.8, recipe: { cuisine: 'Mexican', difficulty: 'Medium' } }
            ];

            const diverseRecipes = engine.applyDiversityBoost(recipes, {});

            // Third recipe should get diversity boost
            expect(diverseRecipes[0].finalScore).toBeGreaterThan(diverseRecipes[0].score);
            expect(diverseRecipes.length).toBe(3);
        });
    });

    describe('Fallback Recommendations', () => {
        test('should return fallback recommendations when needed', () => {
            const filters = { dietary: ['Vegetarian'] };
            const fallback = engine.getFallbackRecommendations(filters);

            expect(fallback.length).toBeGreaterThan(0);
            expect(fallback[0]).toHaveProperty('recipeId');
            expect(fallback[0]).toHaveProperty('score');
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty user history gracefully', () => {
            const userId = 'newUser';
            const userHistory = [];

            const similarUsers = engine.findSimilarUsers(userId, userHistory);
            expect(similarUsers.length).toBe(0);
        });

        test('should handle missing recipe metadata gracefully', () => {
            const filters = { dietary: ['Vegetarian'] };
            const recipeScores = new Map([['unknownRecipe', 0.8]]);

            const filtered = engine.applyAdvancedFilters(recipeScores, filters);
            expect(filtered.length).toBe(0);
        });

        test('should handle invalid interaction types gracefully', () => {
            const interaction = {
                type: 'invalidType',
                timestamp: Date.now()
            };

            const weight = engine.calculateInteractionWeight(interaction);
            expect(weight).toBeGreaterThan(0); // Should use default weight
        });
    });

    describe('Performance Tests', () => {
        test('should handle large numbers of recipes efficiently', () => {
            const startTime = Date.now();

            // Add 1000 test recipes
            for (let i = 0; i < 1000; i++) {
                engine.addRecipeMetadata(`recipe${i}`, {
                    cuisine: 'Test',
                    tags: ['Test'],
                    difficulty: 'Easy',
                    cookTime: 20
                });
            }

            const userPrefs = { preferredCuisines: ['Test'] };
            const scores = engine.contentBasedFiltering(userPrefs, {});

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            expect(scores.size).toBe(1000);
            expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });
});
