import React, { useEffect } from 'react';
import { Wallet, ListTodo, Activity, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const {
    monthlyBudget,
    budgetSpent,
    budgetRemaining,
    budgetPercentage,
    habitsCompleted,
    totalHabits,
    tasksCompleted,
    totalTasks,
    goalsInProgress,
    totalGoals,
    initializeAppData
  } = useApp();

  // Initialize app data when dashboard mounts
  useEffect(() => {
    initializeAppData();
  }, [initializeAppData]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const remainingPercentage = 100 - budgetPercentage;

  const getBudgetStatus = () => {
    if (remainingPercentage > 70) {
      return { text: 'Good', color: 'text-green-500' };
    } else if (remainingPercentage >= 40) {
      return { text: 'Careful', color: 'text-yellow-500' };
    } else {
      return { text: 'Danger', color: 'text-red-500' };
    }
  };

  const budgetStatus = getBudgetStatus();

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Date Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome to Planify!</h1>
        <p className="text-base md:text-lg text-gray-600">{formattedDate}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
        <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="h-5 w-5 text-blue-500" />
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-700">Monthly Budget</h3>
              <span className={`text-sm font-medium ${budgetStatus.color}`}>
                ({budgetStatus.text})
              </span>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-sm font-medium text-gray-900">{remainingPercentage}%</p>
            </div>
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressBarColor(remainingPercentage)} rounded-full transition-all duration-300`}
                style={{ width: `${remainingPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Spent: ${budgetSpent.toLocaleString()}</span>
            <span className="font-medium text-gray-900">
              ${budgetRemaining.toLocaleString()} left
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-700">Tasks</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{tasksCompleted}/{totalTasks}</p>
          <p className="text-sm text-gray-500">Tasks completed</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-gray-700">Goals</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{goalsInProgress}</p>
          <p className="text-sm text-gray-500">In progress</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-gray-700">Habits</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{habitsCompleted}/{totalHabits}</p>
          <p className="text-sm text-gray-500">Completed today</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {budgetSpent > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-gray-600 flex-1">
                Spent ${budgetSpent.toLocaleString()} of ${monthlyBudget.toLocaleString()} budget
              </p>
              <span className="text-xs text-gray-400 whitespace-nowrap">Today</span>
            </div>
          )}
          {habitsCompleted > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <p className="text-sm text-gray-600 flex-1">
                Completed {habitsCompleted} out of {totalHabits} habits
              </p>
              <span className="text-xs text-gray-400 whitespace-nowrap">Today</span>
            </div>
          )}
          {tasksCompleted > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <p className="text-sm text-gray-600 flex-1">
                Completed {tasksCompleted} out of {totalTasks} tasks
              </p>
              <span className="text-xs text-gray-400 whitespace-nowrap">Today</span>
            </div>
          )}
          {goalsInProgress > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <p className="text-sm text-gray-600 flex-1">
                {goalsInProgress} goals in progress
              </p>
              <span className="text-xs text-gray-400 whitespace-nowrap">Today</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;