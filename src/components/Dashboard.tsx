import React, { useEffect, useState } from 'react';
import { Wallet, ListTodo, Activity, Target, LogOut, HelpCircle, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import Tutorial from './Tutorial';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [showTutorial, setShowTutorial] = useState(false);
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
    expenses,
    timeRange,
    setTimeRange,
    initializeAppData
  } = useApp();

  const [username, setUsername] = useState(() => {
    const savedUsername = localStorage.getItem('planify-username');
    return savedUsername || '';
  });

  useEffect(() => {
    const getUser = async () => {
      if (!username) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const emailUsername = user.email.split('@')[0];
          const formattedUsername = emailUsername
            .replace(/[0-9]/g, '')
            .replace(/^\w/, c => c.toUpperCase());
          setUsername(formattedUsername);
          localStorage.setItem('planify-username', formattedUsername);
        }
      }
    };
    getUser();
  }, [username]);

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

  const calculateChartData = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize to start of day
    let data: Array<{ label: string; amount: number }> = [];

    if (timeRange === '3months') {
      // Create data points for last 3 months
      data = Array.from({ length: 3 }, (_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        return {
          label: date.toLocaleString('default', { month: 'short' }),
          amount: 0
        };
      }).reverse();

      // Sum up expenses for each month
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const monthKey = expenseDate.toLocaleString('default', { month: 'short' });
        const dataPoint = data.find(d => d.label === monthKey);
        if (dataPoint) {
          dataPoint.amount += expense.amount;
        }
      });
    } else if (timeRange === '30days') {
      // Create data points for last 30 days (6 points, 5 days each)
      data = Array.from({ length: 6 }, (_, i) => {
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() - (i * 5));
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 4);
        
        return {
          label: `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' })}`,
          amount: 0,
          startDate,
          endDate
        };
      }).reverse();

      // Sum up expenses for each 5-day period
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);
        
        const period = data.find(d => {
          const start = new Date(d.startDate);
          const end = new Date(d.endDate);
          return expenseDate >= start && expenseDate <= end;
        });

        if (period) {
          period.amount += expense.amount;
        }
      });

      // Remove the date objects before returning
      data = data.map(({ label, amount }) => ({ label, amount }));
    } else {
      // Create data points for last 7 days
      data = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        return {
          label: `${date.toLocaleString('default', { weekday: 'short' })} ${date.getDate()}`,
          date: new Date(date),
          amount: 0
        };
      }).reverse();

      // Sum up expenses for each day
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);
        
        const dayData = data.find(d => {
          const chartDate = new Date(d.date);
          return chartDate.getTime() === expenseDate.getTime();
        });

        if (dayData) {
          dayData.amount += expense.amount;
        }
      });

      // Remove the date objects before returning
      data = data.map(({ label, amount }) => ({ label, amount }));
    }

    return data;
  };

  const handleLogout = async () => {
    localStorage.removeItem('planify-username');
    await supabase.auth.signOut();
  };

  const chartData = calculateChartData();

  return (
    <div id="dashboard-overview" className="max-w-screen-xl mx-auto px-4 py-6">
      <Tutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        navigate={navigate}
      />
      
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back{username ? `, ${username}` : ''}!
          </h1>
          <p className="text-base md:text-lg text-gray-600">{formattedDate}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-8 h-8 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div id="dashboard-stats" className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
        <div id="budget-card" className="col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-700">Monthly Budget</h3>
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-sm font-medium text-gray-900">{100 - budgetPercentage}%</p>
            </div>
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className={`h-full ${budgetPercentage >= 70 ? 'bg-red-500' : budgetPercentage >= 40 ? 'bg-yellow-500' : 'bg-green-500'} rounded-full transition-all duration-300`}
                style={{ width: `${100 - budgetPercentage}%` }}
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

        <div id="tasks-card" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-700">Tasks</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{tasksCompleted}/{totalTasks}</p>
          <p className="text-sm text-gray-500">Tasks completed</p>
        </div>

        <div id="goals-card" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-gray-700">Goals</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{goalsInProgress}</p>
          <p className="text-sm text-gray-500">In progress</p>
        </div>

        <div id="habits-card" className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold text-gray-700">Habits</h3>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{habitsCompleted}/{totalHabits}</p>
          <p className="text-sm text-gray-500">Completed today</p>
        </div>
      </div>

      {/* Spending Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Spending Trends</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === '7days'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === '30days'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('3months')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === '3months'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              3M
            </button>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                formatter={(value: any) => [`$${value}`, 'Spent']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorAmount)"
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div id="recent-activity" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
};

export default Dashboard;