import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, CheckCircle2, Circle, Star, Clock, Tag, MoreVertical, X, ArrowUpDown, BarChart, Trophy, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

const GOALS_STORAGE_KEY = 'planify-goals';

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const getProgressColor = (progress: number) => {
  if (progress === 100) return 'bg-emerald-500';
  if (progress >= 75) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-gray-300';
};

const getProgressBackground = (progress: number) => {
  if (progress === 100) return 'bg-emerald-50';
  if (progress >= 75) return 'bg-green-50';
  if (progress >= 50) return 'bg-blue-50';
  if (progress >= 25) return 'bg-yellow-50';
  return 'bg-gray-100';
};

const Goals: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'Personal',
    deadline: new Date().toISOString().split('T')[0],
    progress: 0
  });

  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (savedGoals) {
      return JSON.parse(savedGoals);
    }
    return [
      {
        id: generateUniqueId(),
        title: 'Save $10,000',
        category: 'Finance',
        deadline: '2024-12-31',
        progress: 65,
        completed: false,
        color: 'text-green-500'
      },
      {
        id: generateUniqueId(),
        title: 'Run a marathon',
        category: 'Health',
        deadline: '2024-09-15',
        progress: 40,
        completed: false,
        color: 'text-blue-500'
      },
      {
        id: generateUniqueId(),
        title: 'Learn Spanish',
        category: 'Education',
        deadline: '2024-06-30',
        progress: 25,
        completed: false,
        color: 'text-yellow-500'
      },
      {
        id: generateUniqueId(),
        title: 'Read 24 books',
        category: 'Personal',
        deadline: '2024-12-31',
        progress: 80,
        completed: false,
        color: 'text-purple-500'
      }
    ];
  });

  const [showAnimation, setShowAnimation] = useState(false);
  const { updateGoals } = useApp();

  const calculateStats = useCallback(() => {
    const completedGoals = goals.filter(goal => goal.completed).length;
    const totalGoals = goals.length;
    const inProgressGoals = totalGoals - completedGoals;
    const averageProgress = Math.round(
      goals.reduce((acc, goal) => acc + goal.progress, 0) / totalGoals
    ) || 0;

    return {
      completedGoals,
      totalGoals,
      inProgressGoals,
      averageProgress,
      allGoalsCompleted: completedGoals === totalGoals && totalGoals > 0
    };
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    const stats = calculateStats();
    updateGoals(stats.inProgressGoals, stats.totalGoals);
  }, [goals, calculateStats, updateGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryColors = {
      Personal: 'text-purple-500',
      Health: 'text-green-500',
      Finance: 'text-blue-500',
      Education: 'text-yellow-500',
      Career: 'text-red-500'
    };

    const newGoalEntry = {
      id: generateUniqueId(),
      title: newGoal.title,
      category: newGoal.category,
      deadline: newGoal.deadline,
      progress: 0,
      completed: false,
      color: categoryColors[newGoal.category as keyof typeof categoryColors]
    };

    setGoals(prev => [...prev, newGoalEntry]);
    setIsModalOpen(false);
    setNewGoal({
      title: '',
      category: 'Personal',
      deadline: new Date().toISOString().split('T')[0],
      progress: 0
    });
  };

  const toggleGoal = (id: string | number) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === id) {
          const newCompleted = !goal.completed;
          if (newCompleted) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          return {
            ...goal,
            completed: newCompleted,
            progress: newCompleted ? 100 : 0
          };
        }
        return goal;
      })
    );
  };

  const updateProgress = (id: string | number, newProgress: number) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === id) {
          const completed = newProgress === 100;
          if (completed && !goal.completed) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          return {
            ...goal,
            progress: newProgress,
            completed
          };
        }
        return goal;
      })
    );
  };

  const deleteGoal = (id: string | number) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
  };

  const sortedGoals = goals.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const dateA = new Date(a.deadline);
    const dateB = new Date(b.deadline);
    return dateA.getTime() - dateB.getTime();
  });

  const stats = calculateStats();

  return (
    <div id="goals-overview" className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Goals</h1>
        <p className="text-base md:text-lg text-gray-600">Track your progress and achieve your dreams</p>
      </div>

      <div id="goals-progress" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <BarChart className={`h-6 w-6 text-blue-500 ${showAnimation ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white h-10 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shrink-0"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Goal</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-500" />
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.inProgressGoals}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.completedGoals}</p>
          </div>
        </div>
      </div>

      <div id="goals-categories" className="space-y-4">
        {sortedGoals.map(goal => (
          <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-2 rounded-xl ${goal.completed ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                >
                  {goal.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className={`font-medium ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {goal.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-500">{goal.deadline}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-500">{goal.category}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <X className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">Progress</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={goal.progress}
                    onChange={(e) => {
                      const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      updateProgress(goal.id, value);
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm font-medium text-gray-900">%</span>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  value={goal.progress}
                  onChange={(e) => updateProgress(goal.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  min="0"
                  max="100"
                  style={{
                    background: `linear-gradient(to right, ${getProgressColor(goal.progress).replace('bg-', '')} ${goal.progress}%, #e5e7eb ${goal.progress}%)`
                  }}
                />
                <div className={`absolute inset-0 pointer-events-none ${getProgressBackground(goal.progress)} rounded-lg`}>
                  <div
                    className={`h-full ${getProgressColor(goal.progress)} rounded-lg transition-all duration-300`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Goal</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Career">Career</option>
                </select>
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Goal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;