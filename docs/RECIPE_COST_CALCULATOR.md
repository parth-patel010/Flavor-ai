# Recipe Cost Calculator - Documentation

## Overview

The Recipe Cost Calculator is a comprehensive feature that helps users estimate the cost of ingredients for any recipe. It provides budget planning tools, cost analysis, and shopping list generation to help users make informed decisions about meal planning.

## Features

### 🧮 Core Functionality
- **Ingredient Cost Calculation**: Calculate total cost per recipe with detailed breakdowns
- **Cost per Serving Analysis**: See how much each serving costs
- **Budget Planning**: Set budget limits and get alerts when recipes exceed budget
- **Savings Comparison**: Compare homemade costs with eating out
- **Shopping List Generation**: Create detailed shopping lists with estimated costs

### 🏪 Price Data Sources
- **Regional Pricing**: Support for different US regions (East, West, Midwest, South)
- **Store-Specific Pricing**: Walmart, Kroger, Target pricing data
- **Fallback Database**: Comprehensive ingredient price database with smart matching
- **API Integration Ready**: Framework for integrating with grocery store APIs

### 📊 Budget Planning Tools
- **Weekly/Monthly Planning**: Set budget periods and track expenses
- **Meal Tracking**: Plan meals with estimated costs and track completion
- **Budget Alerts**: Visual indicators when approaching or exceeding budget
- **Cost History**: Track spending patterns over time

### 🎯 User Experience Features
- **Quick Ingredient Addition**: Pre-filled common ingredients for fast setup
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Theme Integration**: Follows the app's light/dark theme system
- **Export Functionality**: Download shopping lists and budget plans

## Technical Architecture

### Backend Components

#### 1. Cost Calculator Library (`lib/costCalculator.js`)
- Core calculation logic for ingredient costs
- Unit conversion system (weight, volume, count)
- Measurement parsing with regex patterns
- Fallback pricing system

#### 2. Grocery Prices Library (`lib/groceryPrices.js`)
- Regional and store-specific pricing data
- Price history tracking
- API integration framework
- Local storage management

#### 3. API Endpoints
- **`/api/calculate-recipe-cost`**: Main cost calculation endpoint
- **`/api/grocery-prices`**: Price data and management endpoint

### Frontend Components

#### 1. CostCalculator (`components/CostCalculator.jsx`)
- Main calculator interface
- Ingredient input and management
- Cost calculation and results display
- Settings and preferences

#### 2. BudgetPlanner (`components/BudgetPlanner.jsx`)
- Budget planning interface
- Meal planning and tracking
- Cost analysis and recommendations
- Export functionality

#### 3. Cost Calculator Page (`app/cost-calculator/page.jsx`)
- Main page with tabbed interface
- Feature showcase and documentation
- User onboarding

## Usage Guide

### Basic Cost Calculation

1. **Navigate to Cost Calculator**
   - Click "Recipe Cost Calculator" button on homepage
   - Or use the navigation link in the navbar

2. **Add Ingredients**
   - Use the ingredient input form
   - Quick-add common ingredients with pre-filled buttons
   - Specify measurements (e.g., "2 cups", "1 lb", "3 cloves")

3. **Configure Settings**
   - Set your region for accurate pricing
   - Choose preferred store (optional)
   - Set budget limit (optional)
   - Adjust number of servings

4. **Calculate Costs**
   - Click "Calculate Recipe Cost"
   - View detailed cost breakdown
   - See savings compared to eating out
   - Generate shopping list

### Budget Planning

1. **Set Budget**
   - Choose budget period (daily/weekly/monthly)
   - Enter budget amount
   - Save preferences

2. **Plan Meals**
   - Add meals with estimated costs
   - Set dates and meal types
   - Track budget usage

3. **Monitor Spending**
   - View budget status and remaining amount
   - Get recommendations for staying within budget
   - Track completed meals

### Integration with Recipes

- **From Recipe Pages**: Click "Calculate Recipe Cost" button on any recipe
- **Direct Input**: Manually enter ingredients and measurements
- **URL Parameters**: Share recipe costs via direct links

## API Reference

### Calculate Recipe Cost

**Endpoint**: `POST /api/calculate-recipe-cost`

**Request Body**:
```json
{
  "ingredients": [
    { "name": "chicken breast", "measure": "1 lb" },
    { "name": "rice", "measure": "2 cups" }
  ],
  "servings": 4,
  "budget": 50.00,
  "region": "US-East",
  "preferredStore": "walmart"
}
```

**Response**:
```json
{
  "success": true,
  "recipe": {
    "totalCost": 12.45,
    "costPerServing": 3.11,
    "servingCount": 4,
    "ingredients": [...],
    "costByCategory": {...}
  },
  "savings": {
    "restaurantCost": 60.00,
    "homemadeCost": 12.45,
    "savings": 47.55,
    "savingsPercentage": 79.25
  },
  "shoppingList": [...],
  "budget": {
    "isWithinBudget": true,
    "remainingBudget": 37.55,
    "budgetPercentage": 24.90
  }
}
```

### Grocery Prices

**Endpoint**: `GET /api/grocery-prices?action=search&ingredient=chicken`

**Available Actions**:
- `search`: Search ingredient prices across sources
- `best-price`: Get best available price for ingredient
- `regional-price`: Get regional price for ingredient
- `store-price`: Get store-specific price
- `price-history`: Get price history and trends
- `regions`: Get available regions

## Configuration

### Environment Variables

```bash
# Grocery Store API Keys (optional)
WALMART_API_KEY=your_walmart_api_key
KROGER_API_KEY=your_kroger_api_key
LOCAL_GROCERY_API_URL=your_local_api_url
LOCAL_GROCERY_API_KEY=your_local_api_key
```

### Local Storage Keys

- `userBudget`: User's budget preference
- `userRegion`: User's preferred region
- `preferredStore`: User's preferred store
- `priceHistory`: Price history data
- `plannedMeals`: Planned meals for budget tracking
- `budgetHistory`: Completed meals history

## Customization

### Adding New Ingredients

1. **Update Fallback Prices** in `lib/costCalculator.js`:
```javascript
const FALLBACK_PRICES = {
  'new ingredient': { price: 2.99, unit: 'piece', category: 'category' },
  // ... existing ingredients
};
```

2. **Add Regional Variations** in `lib/groceryPrices.js`:
```javascript
const REGIONAL_PRICES = {
  'US-East': {
    'new ingredient': { price: 2.99, unit: 'piece', category: 'category' },
    // ... existing ingredients
  }
};
```

### Adding New Units

1. **Update Unit Conversions** in `lib/costCalculator.js`:
```javascript
const UNIT_CONVERSIONS = {
  'new_unit': { to: 'standard_unit', factor: conversion_factor },
  // ... existing conversions
};
```

2. **Update Measurement Patterns**:
```javascript
const MEASUREMENT_PATTERNS = [
  { regex: /(\d+)\s*new_unit/i, type: 'measurement_type' },
  // ... existing patterns
];
```

## Testing

### Run Tests

```bash
# In browser console
runCostCalculatorTests()

# Or import and run specific tests
import { testCalculateRecipeCost } from './lib/costCalculator.test.js';
testCalculateRecipeCost();
```

### Test Coverage

- ✅ Measurement parsing
- ✅ Unit conversions
- ✅ Cost calculations
- ✅ Budget planning
- ✅ API endpoints
- ✅ Component rendering

## Performance Considerations

### Optimization Features

- **Caching**: Price data cached in localStorage
- **Lazy Loading**: Components load only when needed
- **Debounced Input**: Prevents excessive API calls
- **Efficient Rendering**: React optimization with proper keys and memoization

### Scalability

- **Modular Architecture**: Easy to add new features
- **API Framework**: Ready for external integrations
- **Database Ready**: Can easily switch to database storage
- **CDN Ready**: Static assets can be served from CDN

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile**: iOS Safari 13+, Chrome Mobile 80+
- **Features**: ES6+, Local Storage, Fetch API

## Troubleshooting

### Common Issues

1. **Prices Not Loading**
   - Check browser console for errors
   - Verify localStorage is enabled
   - Clear browser cache and reload

2. **Calculations Not Working**
   - Ensure all ingredients have names and measures
   - Check ingredient spelling and formatting
   - Verify API endpoints are accessible

3. **Budget Not Saving**
   - Check localStorage permissions
   - Clear localStorage and try again
   - Verify browser supports localStorage

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('debugMode', 'true');
// Reload page to see detailed logs
```

## Future Enhancements

### Planned Features

- **Real-time Price Updates**: Live pricing from grocery APIs
- **Recipe Sharing**: Share cost calculations with others
- **Nutrition Integration**: Combine cost with nutritional data
- **Meal Planning Calendar**: Visual calendar for budget planning
- **Export to Apps**: Integration with popular meal planning apps

### API Integrations

- **Walmart API**: Real-time pricing and availability
- **Kroger API**: Store-specific pricing
- **Instacart API**: Delivery cost integration
- **Local Grocery APIs**: Regional store partnerships

## Contributing

### Development Setup

1. **Clone Repository**
2. **Install Dependencies**: `npm install`
3. **Run Development Server**: `npm run dev`
4. **Test Changes**: Use the test functions in browser console

### Code Standards

- **ES6+ Syntax**: Use modern JavaScript features
- **React Hooks**: Prefer functional components with hooks
- **Tailwind CSS**: Use utility classes for styling
- **Error Handling**: Implement proper error boundaries
- **Accessibility**: Follow WCAG guidelines

### Testing Guidelines

- **Unit Tests**: Test individual functions
- **Integration Tests**: Test component interactions
- **User Testing**: Validate with real user scenarios
- **Performance Testing**: Monitor bundle size and load times

## Support

### Getting Help

- **Documentation**: Check this file and inline code comments
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Use GitHub discussions for questions
- **Code Review**: Submit pull requests for improvements

### Community

- **Contributors**: Join the development team
- **Feedback**: Share ideas for new features
- **Testing**: Help test new functionality
- **Documentation**: Improve and expand documentation

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Flavor AI Team
