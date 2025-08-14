import { NextResponse } from 'next/server';
import {
    getBestPrice,
    searchIngredientPrices,
    getRegionalPrice,
    getStorePrice,
    getAvailableRegions,
    getUserRegion,
    setUserRegion,
    getPriceHistory,
    getPriceTrend,
    updatePriceHistory
} from '@/lib/groceryPrices';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ingredient = searchParams.get('ingredient');
        const store = searchParams.get('store');
        const region = searchParams.get('region');
        const action = searchParams.get('action');

        // Handle different actions
        switch (action) {
            case 'search':
                if (!ingredient) {
                    return NextResponse.json(
                        { error: 'Ingredient parameter is required for search action' },
                        { status: 400 }
                    );
                }

                const searchResults = searchIngredientPrices(ingredient);
                return NextResponse.json({
                    success: true,
                    ingredient: ingredient,
                    results: searchResults,
                    count: searchResults.length
                });

            case 'best-price':
                if (!ingredient) {
                    return NextResponse.json(
                        { error: 'Ingredient parameter is required for best-price action' },
                        { status: 400 }
                    );
                }

                const bestPrice = getBestPrice(ingredient, store);
                return NextResponse.json({
                    success: true,
                    ingredient: ingredient,
                    bestPrice: bestPrice
                });

            case 'regional-price':
                if (!ingredient || !region) {
                    return NextResponse.json(
                        { error: 'Both ingredient and region parameters are required for regional-price action' },
                        { status: 400 }
                    );
                }

                const regionalPrice = getRegionalPrice(ingredient, region);
                return NextResponse.json({
                    success: true,
                    ingredient: ingredient,
                    region: region,
                    price: regionalPrice
                });

            case 'store-price':
                if (!ingredient || !store) {
                    return NextResponse.json(
                        { error: 'Both ingredient and store parameters are required for store-price action' },
                        { status: 400 }
                    );
                }

                const storePrice = getStorePrice(ingredient, store);
                return NextResponse.json({
                    success: true,
                    ingredient: ingredient,
                    store: store,
                    price: storePrice
                });

            case 'price-history':
                if (!ingredient) {
                    return NextResponse.json(
                        { error: 'Ingredient parameter is required for price-history action' },
                        { status: 400 }
                    );
                }

                const history = getPriceHistory(ingredient);
                const trend = getPriceTrend(ingredient);

                return NextResponse.json({
                    success: true,
                    ingredient: ingredient,
                    history: history,
                    trend: trend
                });

            case 'regions':
                const regions = getAvailableRegions();
                const currentRegion = getUserRegion();

                return NextResponse.json({
                    success: true,
                    regions: regions,
                    currentRegion: currentRegion
                });

            case 'info':
            default:
                // Return general API information
                return NextResponse.json({
                    name: 'Grocery Prices API',
                    version: '1.0.0',
                    description: 'Fetch ingredient prices from various sources',
                    availableActions: [
                        'search - Search for ingredient prices across sources',
                        'best-price - Get best available price for an ingredient',
                        'regional-price - Get regional price for an ingredient',
                        'store-price - Get store-specific price for an ingredient',
                        'price-history - Get price history and trends',
                        'regions - Get available regions'
                    ],
                    parameters: {
                        action: 'Action to perform (required)',
                        ingredient: 'Ingredient name (required for most actions)',
                        store: 'Store name (optional)',
                        region: 'Region name (optional)'
                    },
                    examples: [
                        '/api/grocery-prices?action=search&ingredient=chicken',
                        '/api/grocery-prices?action=best-price&ingredient=milk&store=walmart',
                        '/api/grocery-prices?action=regions'
                    ]
                });
        }

    } catch (error) {
        console.error('Error fetching grocery prices:', error);
        return NextResponse.json(
            {
                error: 'Internal server error while fetching grocery prices',
                details: error.message
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, ingredient, priceData, region } = body;

        switch (action) {
            case 'set-region':
                if (!region) {
                    return NextResponse.json(
                        { error: 'Region parameter is required for set-region action' },
                        { status: 400 }
                    );
                }

                const success = setUserRegion(region);
                return NextResponse.json({
                    success: success,
                    message: success ? `Region set to ${region}` : `Invalid region: ${region}`,
                    region: region
                });

            case 'update-price':
                if (!ingredient || !priceData) {
                    return NextResponse.json(
                        { error: 'Both ingredient and priceData are required for update-price action' },
                        { status: 400 }
                    );
                }

                updatePriceHistory(ingredient, priceData);
                return NextResponse.json({
                    success: true,
                    message: `Price history updated for ${ingredient}`,
                    ingredient: ingredient,
                    priceData: priceData
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Supported actions: set-region, update-price' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error updating grocery prices:', error);
        return NextResponse.json(
            {
                error: 'Internal server error while updating grocery prices',
                details: error.message
            },
            { status: 500 }
        );
    }
}

