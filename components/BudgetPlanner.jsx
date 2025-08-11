"use client";

import { useState, useEffect } from 'react';
import {
    CalendarIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    PlusIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function BudgetPlanner() {
    const [budget, setBudget] = useState('');
    const [period, setPeriod] = useState('weekly');
    const [meals, setMeals] = useState([]);
    const [showAddMeal, setShowAddMeal] = useState(false);
    const [newMeal, setNewMeal] = useState({ name: '', cost: '', date: '', type: 'dinner' });
    const [showHistory, setShowHistory] = useState(false);
    const [budgetHistory, setBudgetHistory] = useState([]);

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedBudget = localStorage.getItem('mealBudget');
        const savedMeals = localStorage.getItem('plannedMeals');
        const savedHistory = localStorage.getItem('budgetHistory');

        if (savedBudget) setBudget(savedBudget);
        if (savedMeals) setMeals(JSON.parse(savedMeals));
        if (savedHistory) setBudgetHistory(JSON.parse(savedHistory));
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (budget) localStorage.setItem('mealBudget', budget);
        localStorage.setItem('plannedMeals', JSON.stringify(meals));
        localStorage.setItem('budgetHistory', JSON.stringify(budgetHistory));
    }, [budget, meals, budgetHistory]);

    // Calculate total planned cost
    const totalPlannedCost = meals.reduce((sum, meal) => sum + parseFloat(meal.cost || 0), 0);

    // Calculate remaining budget
    const remainingBudget = parseFloat(budget || 0) - totalPlannedCost;

    // Calculate budget usage percentage
    const budgetUsagePercentage = budget ? (totalPlannedCost / parseFloat(budget)) * 100 : 0;

    // Add new meal
    const addMeal = () => {
        if (newMeal.name && newMeal.cost && newMeal.date) {
            const meal = {
                ...newMeal,
                id: Date.now(),
                cost: parseFloat(newMeal.cost)
            };

            setMeals([...meals, meal]);
            setNewMeal({ name: '', cost: '', date: '', type: 'dinner' });
            setShowAddMeal(false);
        }
    };

    // Remove meal
    const removeMeal = (id) => {
        setMeals(meals.filter(meal => meal.id !== id));
    };

    // Update meal
    const updateMeal = (id, field, value) => {
        setMeals(meals.map(meal =>
            meal.id === id ? { ...meal, [field]: value } : meal
        ));
    };

    // Complete meal (move to history)
    const completeMeal = (meal) => {
        const completedMeal = {
            ...meal,
            completedAt: new Date().toISOString(),
            completedDate: new Date().toLocaleDateString()
        };

        setBudgetHistory([...budgetHistory, completedMeal]);
        setMeals(meals.filter(m => m.id !== meal.id));
    };

    // Get meals by type
    const getMealsByType = (type) => {
        return meals.filter(meal => meal.type === type);
    };

    // Get total cost by type
    const getTotalCostByType = (type) => {
        return getMealsByType(type).reduce((sum, meal) => sum + meal.cost, 0);
    };

    // Get budget status color
    const getBudgetStatusColor = () => {
        if (budgetUsagePercentage > 100) return 'text-error';
        if (budgetUsagePercentage > 80) return 'text-warning';
        return 'text-success';
    };

    // Get budget status message
    const getBudgetStatusMessage = () => {
        if (budgetUsagePercentage > 100) {
            return `You're $${Math.abs(remainingBudget).toFixed(2)} over budget!`;
        }
        if (budgetUsagePercentage > 80) {
            return `Budget getting tight! ${remainingBudget.toFixed(2)} remaining.`;
        }
        return `Great! You have $${remainingBudget.toFixed(2)} remaining.`;
    };

    // Export budget plan
    const exportBudgetPlan = () => {
        const plan = {
            period: period,
            budget: budget,
            meals: meals,
            totalCost: totalPlannedCost,
            remainingBudget: remainingBudget,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-plan-${period}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Clear all data
    const clearAllData = () => {
        if (confirm('Are you sure you want to clear all budget data? This cannot be undone.')) {
            setMeals([]);
            setBudgetHistory([]);
            setBudget('');
            localStorage.removeItem('mealBudget');
            localStorage.removeItem('plannedMeals');
            localStorage.removeItem('budgetHistory');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-base-100">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <CurrencyDollarIcon className="h-12 w-12 text-primary" />
                    <h1 className="text-4xl font-bold text-primary">Budget Planner</h1>
                </div>
                <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                    Plan your meal budget, track expenses, and stay within your spending limits for smart meal planning.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Budget Overview */}
                <div className="space-y-6">
                    {/* Budget Settings */}
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-4">
                                <CurrencyDollarIcon className="h-6 w-6" />
                                Budget Settings
                            </h2>

                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Budget Period</span>
                                    </label>
                                    <select
                                        className="select select-bordered w-full"
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Budget Amount ($)</span>
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter your budget"
                                        className="input input-bordered w-full"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Budget Summary */}
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-xl mb-4">
                                <ChartBarIcon className="h-6 w-6" />
                                Budget Summary
                            </h2>

                            <div className="space-y-4">
                                <div className="stat bg-primary/10 rounded-lg">
                                    <div className="stat-title text-primary">Total Budget</div>
                                    <div className="stat-value text-primary">${budget || '0.00'}</div>
                                    <div className="stat-desc">{period} budget</div>
                                </div>

                                <div className="stat bg-secondary/10 rounded-lg">
                                    <div className="stat-title text-secondary">Planned Cost</div>
                                    <div className="stat-value text-secondary">${totalPlannedCost.toFixed(2)}</div>
                                    <div className="stat-desc">Total planned meals</div>
                                </div>

                                <div className={`stat ${remainingBudget >= 0 ? 'bg-success/10' : 'bg-error/10'} rounded-lg`}>
                                    <div className={`stat-title ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
                                        {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
                                    </div>
                                    <div className={`stat-value ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
                                        ${Math.abs(remainingBudget).toFixed(2)}
                                    </div>
                                    <div className={`stat-desc ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
                                        {getBudgetStatusMessage()}
                                    </div>
                                </div>
                            </div>

                            {/* Budget Usage Bar */}
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Budget Usage</span>
                                    <span>{budgetUsagePercentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-base-300 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-300 ${budgetUsagePercentage > 100
                                            ? 'bg-error'
                                            : budgetUsagePercentage > 80
                                                ? 'bg-warning'
                                                : 'bg-success'
                                            }`}
                                        style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => setShowAddMeal(true)}
                            className="btn btn-primary w-full"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add Meal
                        </button>

                        <button
                            onClick={exportBudgetPlan}
                            className="btn btn-outline btn-secondary w-full"
                        >
                            Export Plan
                        </button>

                        <button
                            onClick={clearAllData}
                            className="btn btn-outline btn-error w-full"
                        >
                            <TrashIcon className="h-5 w-5" />
                            Clear All Data
                        </button>
                    </div>
                </div>

                {/* Center Column - Meal Planning */}
                <div className="space-y-6">
                    {/* Meal Planning */}
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="card-title text-xl">
                                    <CalendarIcon className="h-6 w-6" />
                                    Meal Planning
                                </h2>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="btn btn-sm btn-outline"
                                >
                                    {showHistory ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                    {showHistory ? 'Hide' : 'Show'} History
                                </button>
                            </div>
                        </div>

                        {/* Add Meal Modal */}
                        {showAddMeal && (
                            <div className="modal modal-open">
                                <div className="modal-box">
                                    <h3 className="font-bold text-lg mb-4">Add New Meal</h3>

                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Meal Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Chicken Pasta"
                                                className="input input-bordered w-full"
                                                value={newMeal.name}
                                                onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Estimated Cost ($)</span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="input input-bordered w-full"
                                                value={newMeal.cost}
                                                onChange={(e) => setNewMeal({ ...newMeal, cost: e.target.value })}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Date</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="input input-bordered w-full"
                                                value={newMeal.date}
                                                onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Meal Type</span>
                                            </label>
                                            <select
                                                className="select select-bordered w-full"
                                                value={newMeal.type}
                                                onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
                                            >
                                                <option value="breakfast">Breakfast</option>
                                                <option value="lunch">Lunch</option>
                                                <option value="dinner">Dinner</option>
                                                <option value="snack">Snack</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="modal-action">
                                        <button
                                            onClick={() => setShowAddMeal(false)}
                                            className="btn btn-outline"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={addMeal}
                                            className="btn btn-primary"
                                            disabled={!newMeal.name || !newMeal.cost || !newMeal.date}
                                        >
                                            Add Meal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Meals List */}
                        <div className="space-y-3">
                            {meals.length === 0 ? (
                                <div className="text-center py-8 text-base-content/50">
                                    <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                                    <p>No meals planned yet. Add your first meal to get started!</p>
                                </div>
                            ) : (
                                meals.map((meal) => (
                                    <div key={meal.id} className="card bg-base-100 shadow-sm">
                                        <div className="card-body p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{meal.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-base-content/70">
                                                        <span className="capitalize">{meal.type}</span>
                                                        <span>{new Date(meal.date).toLocaleDateString()}</span>
                                                        <span className="font-medium text-primary">${meal.cost.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => completeMeal(meal)}
                                                        className="btn btn-sm btn-success"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => removeMeal(meal.id)}
                                                        className="btn btn-sm btn-error"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Budget History */}
                {showHistory && (
                    <div className="card bg-base-200 shadow-lg">
                        <div className="card-body">
                            <h3 className="card-title text-lg mb-4">Budget History</h3>

                            {budgetHistory.length === 0 ? (
                                <p className="text-center text-base-content/50 py-4">
                                    No completed meals yet. Complete meals to see them here.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {budgetHistory.map((meal, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-base-100 rounded">
                                            <div>
                                                <span className="font-medium">{meal.name}</span>
                                                <span className="text-sm text-base-content/70 ml-2">
                                                    {meal.completedDate}
                                                </span>
                                            </div>
                                            <span className="font-medium text-primary">${meal.cost.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column - Cost Breakdown */}
            <div className="space-y-6">
                {/* Cost by Meal Type */}
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Cost by Meal Type</h2>

                        <div className="space-y-4">
                            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                                const typeMeals = getMealsByType(type);
                                const totalCost = getTotalCostByType(type);

                                return (
                                    <div key={type} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize font-medium">{type}</span>
                                            <span className="badge badge-outline">{typeMeals.length} meals</span>
                                        </div>
                                        <span className="font-medium text-primary">${totalCost.toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Budget Recommendations */}
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Recommendations</h2>

                        <div className="space-y-3">
                            {budgetUsagePercentage > 100 && (
                                <div className="alert alert-error">
                                    <span>⚠️ You're over budget! Consider reducing meal costs or increasing your budget.</span>
                                </div>
                            )}

                            {budgetUsagePercentage > 80 && budgetUsagePercentage <= 100 && (
                                <div className="alert alert-warning">
                                    <span>⚠️ Budget getting tight! Look for cost-saving meal options.</span>
                                </div>
                            )}

                            {budgetUsagePercentage <= 80 && (
                                <div className="alert alert-success">
                                    <span>✅ Great budget management! You have room for premium ingredients.</span>
                                </div>
                            )}

                            {meals.length === 0 && (
                                <div className="alert alert-info">
                                    <span>💡 Start planning your meals to see budget recommendations.</span>
                                </div>
                            )}

                            {meals.length > 0 && remainingBudget > 0 && (
                                <div className="alert alert-info">
                                    <span>💡 You can add more meals worth ${remainingBudget.toFixed(2)} to your plan.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">Quick Stats</h2>

                        <div className="stats stats-vertical w-full">
                            <div className="stat">
                                <div className="stat-title">Total Meals</div>
                                <div className="stat-value text-primary">{meals.length}</div>
                            </div>

                            <div className="stat">
                                <div className="stat-title">Average Cost per Meal</div>
                                <div className="stat-value text-secondary">
                                    ${meals.length > 0 ? (totalPlannedCost / meals.length).toFixed(2) : '0.00'}
                                </div>
                            </div>

                            <div className="stat">
                                <div className="stat-title">Completed Meals</div>
                                <div className="stat-value text-accent">{budgetHistory.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
