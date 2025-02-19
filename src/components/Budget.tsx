import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingDown, 
  PieChart, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Coffee, 
  ShoppingBag, 
  Home as HomeIcon, 
  Car, 
  X, 
  Settings, 
  MoreHorizontal, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const EXPENSES_STORAGE_KEY = 'planify-expenses';
const INITIAL_DISPLAY_COUNT = 4;

// Define categories with their icons
const categories = [
  { name: 'Housing', icon: HomeIcon, color: 'bg-purple-500', textColor: 'text-purple-500' },
  { name: 'Food', icon: Coffee, color: 'bg-blue-500', textColor: 'text-blue-500' },
  { name: 'Transportation', icon: Car, color: 'bg-green-500', textColor: 'text-green-500' },
  { name: 'Shopping', icon: ShoppingBag, color: 'bg-red-500', textColor: 'text-red-500' },
  { name: 'Other', icon: MoreHorizontal, color: 'bg-gray-500', textColor: 'text-gray-500' }
];

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

const Budget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedBudget = localStorage.getItem('planify-monthly-budget');
    return savedBudget ? parseFloat(savedBudget) : 3500;
  });
  const [newMonthlyBudget, setNewMonthlyBudget] = useState(monthlyBudget.toString());
  const [newExpense, setNewExpense] = useState({
    category: 'Housing',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { updateBudget, updateBudgetSpent, expenses, updateExpenses } = useApp();

  const [recentExpenses, setRecentExpenses] = useState(() => {
    if (expenses.length > 0) return expenses;
    return [
      { id: 1, category: 'Housing', amount: 800, date: '2024-01-15', color: 'text-purple-500' },
      { id: 2, category: 'Food', amount: 85.20, date: '2024-01-20', color: 'text-blue-500' },
      { id: 3, category: 'Transportation', amount: 45.80, date: '2024-01-18', color: 'text-green-500' },
      { id: 4, category: 'Shopping', amount: 120, date: '2024-01-21', color: 'text-red-500' }
    ];
  });

  useEffect(() => {
    const expensesToSave = recentExpenses.map(expense => ({
      id: expense.id,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      color: expense.color
    }));
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expensesToSave));
    updateExpenses(expensesToSave);
  }, [recentExpenses, updateExpenses]);

  // Calculate current month's expenses
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return recentExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
  };

  // Calculate category spending for current month only
  const categorySpending = categories.map(category => {
    const currentMonthExpenses = getCurrentMonthExpenses();
    const totalSpent = currentMonthExpenses
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = Math.round((totalSpent / currentMonthTotal) * 100) || 0;
    
    return {
      ...category,
      spent: totalSpent,
      percentage
    };
  });

  useEffect(() => {
    const currentMonthExpenses = getCurrentMonthExpenses();
    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    updateBudgetSpent(totalSpent);
  }, [recentExpenses, updateBudgetSpent]);

  useEffect(() => {
    updateBudget(monthlyBudget);
  }, [monthlyBudget, updateBudget]);

  useEffect(() => {
    localStorage.setItem('planify-monthly-budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const remaining = monthlyBudget - recentExpenses.reduce((sum, expense) => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear() 
           ? sum + expense.amount 
           : sum;
  }, 0);

  const percentageSpent = Math.round(((monthlyBudget - remaining) / monthlyBudget) * 100);
  const percentageRemaining = 100 - percentageSpent;

  const getBudgetStatus = () => {
    if (percentageRemaining > 70) {
      return { text: 'Good', color: 'text-green-500' };
    } else if (percentageRemaining >= 40) {
      return { text: 'Careful', color: 'text-yellow-500' };
    } else {
      return { text: 'Danger', color: 'text-red-500' };
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-red-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-green-500';
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
      amount: amount,
      date: newExpense.date,
      color: category.textColor
    };

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

  const handleResetMonthlySpending = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter out expenses from current month only
    const filteredExpenses = recentExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() !== currentMonth || 
             expenseDate.getFullYear() !== currentYear;
    });

    setRecentExpenses(filteredExpenses);
    updateBudgetSpent(0);
    setIsResetConfirmOpen(false);
    setIsSettingsModalOpen(false);
  };

  const handleResetAllSpending = () => {
    setRecentExpenses([]);
    updateBudgetSpent(0);
    setIsResetConfirmOpen(false);
    setIsSettingsModalOpen(false);
  };

  const displayedExpenses = showAllExpenses ? recentExpenses : recentExpenses.slice(0, INITIAL_DISPLAY_COUNT);

  const toggleShowExpenses = () => {
    setShowAllExpenses(prev => !prev);
  };

  return (
    <div id="budget-overview" className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
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
      <div id="budget-progress" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
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
              <p className="font-semibold text-gray-900">${(monthlyBudget - remaining).toLocaleString()}</p>
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
      <div id="spending-categories" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Spending Categories</h2>
        </div>
        <div className="space-y-4">
          {categorySpending.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className={category.textColor} />
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
            );
          })}
        </div>
      </div>

      {/* Recent Expenses */}
      <div id="recent-expenses" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
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
            const ExpenseIcon = categories.find(cat => cat.name === expense.category)?.icon || MoreHorizontal;
            return (
              <div key={expense.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-50 ${expense.color}`}>
                    <ExpenseIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    <p className="text-sm text-gray-500">{formatRelativeDate(expense.date)}</p>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Spending</h2>
              <p className="text-gray-600 mb-4">
                Choose how you would like to reset your spending:
              </p>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-1">Reset Current Month</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This will remove all expenses for the current month only. Previous months' data will be preserved.
                  </p>
                  <button
                    onClick={handleResetMonthlySpending}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Reset Current Month
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-1">Reset All Spending</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This will remove ALL expenses across all months. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleResetAllSpending}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reset All Spending
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;