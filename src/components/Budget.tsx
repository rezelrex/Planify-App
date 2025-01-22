import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingDown, PieChart, ArrowDownCircle, ArrowUpCircle, Coffee, ShoppingBag, Home, Car, X, Settings, MoreHorizontal, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const EXPENSES_STORAGE_KEY = 'planify-expenses';
const INITIAL_DISPLAY_COUNT = 4;

// Define categories before using them in state
const categories = [
  { name: 'Housing', color: 'bg-purple-500', textColor: 'text-purple-500', icon: Home },
  { name: 'Food', color: 'bg-blue-500', textColor: 'text-blue-500', icon: Coffee },
  { name: 'Transportation', color: 'bg-green-500', textColor: 'text-green-500', icon: Car },
  { name: 'Shopping', color: 'bg-red-500', textColor: 'text-red-500', icon: ShoppingBag },
  { name: 'Other', color: 'bg-gray-500', textColor: 'text-gray-500', icon: MoreHorizontal }
];

const Budget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedBudget = localStorage.getItem('planify-monthly-budget');
    return savedBudget ? parseFloat(savedBudget) : 3500;
  });
  const [spent, setSpent] = useState(0);
  const [newMonthlyBudget, setNewMonthlyBudget] = useState(monthlyBudget.toString());
  const [newExpense, setNewExpense] = useState({
    category: 'Housing',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { updateBudget, updateBudgetSpent } = useApp();

  const [recentExpenses, setRecentExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      return parsedExpenses.map((expense: any) => {
        const category = categories.find(cat => cat.name === expense.category);
        return {
          ...expense,
          icon: category?.icon || MoreHorizontal,
          color: category?.textColor || 'text-gray-500'
        };
      });
    }
    return [
      { id: 1, category: 'Housing', icon: Home, amount: 800, date: '2d ago', color: 'text-purple-500' },
      { id: 2, category: 'Food', icon: Coffee, amount: 85.20, date: '5h ago', color: 'text-blue-500' },
      { id: 3, category: 'Transportation', icon: Car, amount: 45.80, date: '3d ago', color: 'text-green-500' },
      { id: 4, category: 'Shopping', icon: ShoppingBag, amount: 120, date: '2h ago', color: 'text-red-500' }
    ];
  });

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    const expensesToSave = recentExpenses.map(expense => ({
      id: expense.id,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      color: expense.color
    }));
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expensesToSave));
  }, [recentExpenses]);

  // Calculate category spending
  const categorySpending = categories.map(category => {
    const totalSpent = recentExpenses
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const percentage = Math.round((totalSpent / spent) * 100) || 0;
    
    return {
      ...category,
      spent: totalSpent,
      percentage
    };
  });

  useEffect(() => {
    const totalSpent = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setSpent(totalSpent);
  }, [recentExpenses]);

  useEffect(() => {
    updateBudgetSpent(spent);
  }, [spent, updateBudgetSpent]);

  useEffect(() => {
    updateBudget(monthlyBudget);
  }, [monthlyBudget, updateBudget]);

  useEffect(() => {
    localStorage.setItem('planify-monthly-budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const remaining = monthlyBudget - spent;
  const percentageSpent = Math.round((spent / monthlyBudget) * 100);
  const percentageRemaining = 100 - percentageSpent;

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-red-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatRelativeDate = (date: string) => {
    const now = new Date();
    const expenseDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) return;

    const category = categories.find(cat => cat.name === newExpense.category);
    if (!category) return;

    const newExpenseEntry = {
      id: Date.now(),
      category: newExpense.category,
      icon: category.icon,
      amount: amount,
      date: formatRelativeDate(newExpense.date),
      color: category.textColor
    };

    // Add the new expense to the beginning of the array without removing any
    setRecentExpenses(prev => [newExpenseEntry, ...prev]);
    
    setIsModalOpen(false);
    setNewExpense({
      category: 'Housing',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(newMonthlyBudget);
    if (isNaN(newBudget) || newBudget <= 0) return;
    
    setMonthlyBudget(newBudget);
    setIsSettingsModalOpen(false);
  };

  const handleResetSpending = () => {
    setRecentExpenses([]);
    setSpent(0);
    setIsResetConfirmOpen(false);
    setIsSettingsModalOpen(false);
  };

  // Get expenses to display based on show all toggle
  const displayedExpenses = showAllExpenses ? recentExpenses : recentExpenses.slice(0, INITIAL_DISPLAY_COUNT);

  const toggleShowExpenses = () => {
    setShowAllExpenses(prev => !prev);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
      {/* Budget Overview */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Budget Overview</h1>
          <p className="text-base md:text-lg text-gray-600">Track your monthly spending</p>
        </div>
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Main Budget Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-sm text-gray-600">Monthly Budget</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">${monthlyBudget.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white h-10 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shrink-0"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative h-10 bg-gray-200 rounded-lg overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 ${getProgressBarColor(percentageSpent)} transition-all duration-300`}
              style={{ width: `${percentageSpent}%` }}
            >
              <div className="absolute inset-0 flex items-center">
                <span className="ml-3 text-sm text-white font-medium">
                  {percentageSpent}% spent
                </span>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-end">
              <span className="mr-3 text-sm font-medium text-gray-700">
                {percentageRemaining}% remaining
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Spent</p>
              <p className="font-semibold text-gray-900">${spent.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="font-semibold text-gray-900">${remaining.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Spending Categories</h2>
        </div>
        <div className="space-y-4">
          {categorySpending.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <category.icon className={category.textColor} />
                  <span className="text-gray-600">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">{category.percentage}%</span>
                  <p className="text-xs text-gray-500">${category.spent.toLocaleString()}</p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${category.color} rounded-full transition-all duration-300`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          </div>
          {recentExpenses.length > INITIAL_DISPLAY_COUNT && (
            <button
              onClick={toggleShowExpenses}
              className="flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              {showAllExpenses ? (
                <>
                  Show Less
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show More
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
        <div className="space-y-4">
          {displayedExpenses.map((expense) => {
            const ExpenseIcon = expense.icon;
            return (
              <div key={expense.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${expense.color}`}>
                    <ExpenseIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    <p className="text-sm text-gray-500">{expense.date}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  -${expense.amount.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Budget Settings</h2>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label htmlFor="monthlyBudget" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Budget ($)
                </label>
                <input
                  type="number"
                  id="monthlyBudget"
                  value={newMonthlyBudget}
                  onChange={(e) => setNewMonthlyBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
              <div className="pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Monthly Spending
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Monthly Spending</h2>
              <p className="text-gray-600">
                Are you sure you want to reset your monthly spending? This will remove all expenses for the current month.
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSpending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Spending
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;