import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AppContextType {
  monthlyBudget: number;
  budgetSpent: number;
  budgetRemaining: number;
  budgetPercentage: number;
  habitsCompleted: number;
  totalHabits: number;
  habitsPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
  tasksPercentage: number;
  goalsInProgress: number;
  totalGoals: number;
  goalsPercentage: number;
  expenses: any[];
  timeRange: '7days' | '30days' | '3months';
  updateBudget: (budget: number) => void;
  updateBudgetSpent: (spent: number) => void;
  updateHabits: (completed: number, total: number) => void;
  updateTasks: (completed: number, total: number) => void;
  updateGoals: (inProgress: number, total: number) => void;
  updateExpenses: (expenses: any[]) => void;
  setTimeRange: (range: '7days' | '30days' | '3months') => void;
  initializeAppData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'planify-monthly-budget';
const HABITS_STORAGE_KEY = 'planify-habits';
const TODOS_STORAGE_KEY = 'planify-todos';
const GOALS_STORAGE_KEY = 'planify-goals';
const EXPENSES_STORAGE_KEY = 'planify-expenses';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const savedBudget = localStorage.getItem(STORAGE_KEY);
    return savedBudget ? parseFloat(savedBudget) : 3500;
  });
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [habitsStats, setHabitsStats] = useState({ completed: 0, total: 0 });
  const [tasksStats, setTasksStats] = useState({ completed: 0, total: 0 });
  const [goalsStats, setGoalsStats] = useState({ inProgress: 0, total: 0 });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '3months'>('7days');

  const getCurrentMonthExpenses = useCallback((expensesList: any[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expensesList.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
  }, []);

  const initializeAppData = useCallback(() => {
    const savedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      setExpenses(parsedExpenses);
      const currentMonthExpenses = getCurrentMonthExpenses(parsedExpenses);
      const totalSpent = currentMonthExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      setBudgetSpent(totalSpent);
    }

    const savedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
    if (savedHabits) {
      const habits = JSON.parse(savedHabits);
      const completed = habits.filter((habit: any) => habit.completed).length;
      setHabitsStats({ completed, total: habits.length });
    }

    const savedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
    if (savedTodos) {
      const todos = JSON.parse(savedTodos);
      const completed = todos.filter((todo: any) => todo.completed).length;
      setTasksStats({ completed, total: todos.length });
    }

    const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (savedGoals) {
      const goals = JSON.parse(savedGoals);
      const inProgress = goals.filter((goal: any) => !goal.completed).length;
      setGoalsStats({ inProgress, total: goals.length });
    }
  }, [getCurrentMonthExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, monthlyBudget.toString());
  }, [monthlyBudget]);

  const updateBudget = useCallback((budget: number) => {
    setMonthlyBudget(budget);
  }, []);

  const updateBudgetSpent = useCallback((spent: number) => {
    setBudgetSpent(spent);
  }, []);

  const updateHabits = useCallback((completed: number, total: number) => {
    setHabitsStats({ completed, total });
  }, []);

  const updateTasks = useCallback((completed: number, total: number) => {
    setTasksStats({ completed, total });
  }, []);

  const updateGoals = useCallback((inProgress: number, total: number) => {
    setGoalsStats({ inProgress, total });
  }, []);

  const updateExpenses = useCallback((newExpenses: any[]) => {
    setExpenses(newExpenses);
    const currentMonthExpenses = getCurrentMonthExpenses(newExpenses);
    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setBudgetSpent(totalSpent);
  }, [getCurrentMonthExpenses]);

  const value = {
    monthlyBudget,
    budgetSpent,
    budgetRemaining: monthlyBudget - budgetSpent,
    budgetPercentage: Math.round((budgetSpent / monthlyBudget) * 100),
    habitsCompleted: habitsStats.completed,
    totalHabits: habitsStats.total,
    habitsPercentage: Math.round((habitsStats.completed / habitsStats.total) * 100) || 0,
    tasksCompleted: tasksStats.completed,
    totalTasks: tasksStats.total,
    tasksPercentage: Math.round((tasksStats.completed / tasksStats.total) * 100) || 0,
    goalsInProgress: goalsStats.inProgress,
    totalGoals: goalsStats.total,
    goalsPercentage: Math.round((goalsStats.inProgress / goalsStats.total) * 100) || 0,
    expenses,
    timeRange,
    updateBudget,
    updateBudgetSpent,
    updateHabits,
    updateTasks,
    updateGoals,
    updateExpenses,
    setTimeRange,
    initializeAppData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};