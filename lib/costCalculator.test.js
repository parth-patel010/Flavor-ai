// Simple test file for cost calculator functions
// This can be run in Node.js or browser environment

import {
    calculateIngredientCost,
    calculateRecipeCost,
    calculateSavings,
    parseMeasurement,
    convertToStandardUnit
} from './costCalculator.js';

// Test data
const testIngredients = [
    { name: 'chicken breast', measure: '1 lb' },
    { name: 'rice', measure: '2 cups' },
    { name: 'onion', measure: '1 medium' },
    { name: 'garlic', measure: '3 cloves' },
    { name: 'olive oil', measure: '2 tbsp' }
];

// Test functions
function testParseMeasurement() {
    console.log('Testing parseMeasurement...');

    const tests = [
        { input: '2 cups', expected: { quantity: 2, unit: 'cup', type: 'volume' } },
        { input: '1 lb', expected: { quantity: 1, unit: 'lb', type: 'weight' } },
        { input: '3 cloves', expected: { quantity: 3, unit: 'clove', type: 'count' } },
        { input: '1/2 cup', expected: { quantity: 0.5, unit: 'cup', type: 'fraction' } }
    ];

    tests.forEach(test => {
        try {
            const result = parseMeasurement(test.input);
            const passed = JSON.stringify(result) === JSON.stringify(test.expected);
            console.log(`${passed ? '✅' : '❌'} ${test.input} -> ${JSON.stringify(result)}`);
        } catch (error) {
            console.log(`❌ ${test.input} -> Error: ${error.message}`);
        }
    });
}

function testCalculateIngredientCost() {
    console.log('\nTesting calculateIngredientCost...');

    const tests = [
        { name: 'chicken breast', measure: '1 lb', expectedMin: 3, expectedMax: 5 },
        { name: 'rice', measure: '2 cups', expectedMin: 1, expectedMax: 3 },
        { name: 'onion', measure: '1 medium', expectedMin: 1, expectedMax: 2 }
    ];

    tests.forEach(test => {
        try {
            const result = calculateIngredientCost(test.name, test.measure);
            const passed = result.cost >= test.expectedMin && result.cost <= test.expectedMax;
            console.log(`${passed ? '✅' : '❌'} ${test.name} (${test.measure}) -> $${result.cost}`);
        } catch (error) {
            console.log(`❌ ${test.name} -> Error: ${error.message}`);
        }
    });
}

function testCalculateRecipeCost() {
    console.log('\nTesting calculateRecipeCost...');

    try {
        const result = calculateRecipeCost(testIngredients);
        console.log('✅ Recipe cost calculation successful');
        console.log(`   Total cost: $${result.totalCost}`);
        console.log(`   Cost per serving: $${result.costPerServing}`);
        console.log(`   Ingredients processed: ${result.ingredients.length}`);
        console.log(`   Cost by category:`, result.costByCategory);
    } catch (error) {
        console.log(`❌ Recipe cost calculation failed: ${error.message}`);
    }
}

function testCalculateSavings() {
    console.log('\nTesting calculateSavings...');

    try {
        const result = calculateSavings(25, 4);
        console.log('✅ Savings calculation successful');
        console.log(`   Restaurant cost: $${result.restaurantCost}`);
        console.log(`   Homemade cost: $${result.homemadeCost}`);
        console.log(`   Savings: $${result.savings}`);
        console.log(`   Savings percentage: ${result.savingsPercentage}%`);
    } catch (error) {
        console.log(`❌ Savings calculation failed: ${error.message}`);
    }
}

function testUnitConversions() {
    console.log('\nTesting unit conversions...');

    const tests = [
        { input: { quantity: 16, unit: 'oz', type: 'weight' }, expected: { quantity: 1, unit: 'lb', type: 'weight' } },
        { input: { quantity: 2, unit: 'cups', type: 'volume' }, expected: { quantity: 2, unit: 'cup', type: 'volume' } }
    ];

    tests.forEach(test => {
        try {
            const result = convertToStandardUnit(test.input);
            const passed = Math.abs(result.quantity - test.expected.quantity) < 0.01 &&
                result.unit === test.expected.unit;
            console.log(`${passed ? '✅' : '❌'} ${JSON.stringify(test.input)} -> ${JSON.stringify(result)}`);
        } catch (error) {
            console.log(`❌ ${JSON.stringify(test.input)} -> Error: ${error.message}`);
        }
    });
}

// Run all tests
function runAllTests() {
    console.log('🧪 Running Cost Calculator Tests...\n');

    testParseMeasurement();
    testCalculateIngredientCost();
    testCalculateRecipeCost();
    testCalculateSavings();
    testUnitConversions();

    console.log('\n✨ All tests completed!');
}

// Export for use in other environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testParseMeasurement,
        testCalculateIngredientCost,
        testCalculateRecipeCost,
        testCalculateSavings,
        testUnitConversions
    };
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
    window.runCostCalculatorTests = runAllTests;
    console.log('Cost Calculator tests loaded. Run runCostCalculatorTests() to execute tests.');
}
