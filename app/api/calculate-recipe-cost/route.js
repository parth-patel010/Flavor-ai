import { NextResponse } from 'next/server';
import { calculateRecipeCost, calculateSavings, generateShoppingList, checkBudgetFit } from '@/lib/costCalculator';

export async function POST(request) {
    try {
        const body = await request.json();
        const { ingredients, servings = 4, budget = null, region = null, preferredStore = null } = body;

        // Validate input
        if (!ingredients || !Array.isArray(ingredients)) {
            return NextResponse.json(
                { error: 'Invalid ingredients data. Expected an array of ingredients.' },
                { status: 400 }
            );
        }

        // Calculate recipe cost
        const costResult = calculateRecipeCost(ingredients);

        if (costResult.error) {
            return NextResponse.json(
                { error: costResult.error },
                { status: 400 }
            );
        }

        // Calculate savings compared to eating out
        const savings = calculateSavings(costResult.totalCost, servings);

        // Generate shopping list
        const shoppingList = generateShoppingList(costResult.ingredients);

        // Check budget fit if budget is provided
        let budgetStatus = null;
        if (budget !== null && budget > 0) {
            budgetStatus = checkBudgetFit(costResult.totalCost, budget);
        }

        // Prepare response
        const response = {
            success: true,
            recipe: {
                totalCost: costResult.totalCost,
                costPerServing: costResult.costPerServing,
                servingCount: servings,
                ingredients: costResult.ingredients,
                costByCategory: costResult.costByCategory
            },
            savings: savings,
            shoppingList: shoppingList,
            budget: budgetStatus,
            metadata: {
                region: region || 'US-East',
                preferredStore: preferredStore,
                calculatedAt: new Date().toISOString(),
                version: '1.0.0'
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error calculating recipe cost:', error);
        return NextResponse.json(
            {
                error: 'Internal server error while calculating recipe cost',
                details: error.message
            },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    // Return API information
    return NextResponse.json({
        name: 'Recipe Cost Calculator API',
        version: '1.0.0',
        description: 'Calculate the cost of recipe ingredients and generate shopping lists',
        endpoints: {
            POST: '/api/calculate-recipe-cost',
            GET: '/api/calculate-recipe-cost'
        },
        features: [
            'Recipe cost calculation',
            'Cost per serving analysis',
            'Savings comparison with eating out',
            'Shopping list generation',
            'Budget planning support'
        ]
    });
}
