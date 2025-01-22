import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trophy, Calendar, CheckCircle2, Circle, Sparkles, Dumbbell, Book, Coffee, Sunrise, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

const HABITS_STORAGE_KEY = 'planify-habits';

// Define icon configurations with their colors
const iconOptions = {
  Dumbbell: {
    icon: Dumbbell,
    color: 'text-red-500'
  },
  Book: {
    icon: Book,
    color: 'text-blue-500'
  },
  Coffee: {
    icon: Coffee,
    color: 'text-yellow-500'
  },
  Sunrise: {
    icon: Sunrise,
    color: 'text-orange-500'
  },
  Sparkles: {
    icon: Sparkles,
    color: 'text-purple-500'
  }
};

// Format time to 12-hour format
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Generate a unique ID
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Define weekDays with unique IDs
const weekDays = [
  { id: 'sun', label: 'S', name: 'Sunday' },
  { id: 'mon', label: 'M', name: 'Monday' },
  { id: 'tue', label: 'T', name: 'Tuesday' },
  { id: 'wed', label: 'W', name: 'Wednesday' },
  { id: 'thu', label: 'T', name: 'Thursday' },
  { id: 'fri', label: 'F', name: 'Friday' },
  { id: 'sat', label: 'S', name: 'Saturday' }
];

const Habits: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: '',
    time: '06:00',
    icon: 'Dumbbell'
  });
  const [showAnimation, setShowAnimation] = useState(false);
  const prevCompletionRef = useRef(false);
  const lastResetDateRef = useRef(new Date().toDateString());

  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits);
      return parsedHabits.map((habit: any) => ({
        ...habit,
        id: generateUniqueId(),
        icon: iconOptions[habit.iconName as keyof typeof iconOptions].icon,
        color: iconOptions[habit.iconName as keyof typeof iconOptions].color
      }));
    }
    return [
      { 
        id: generateUniqueId(),
        name: 'Morning Workout',
        iconName: 'Dumbbell',
        icon: iconOptions.Dumbbell.icon,
        color: iconOptions.Dumbbell.color,
        streak: 12,
        completed: false,
        time: '06:00'
      },
      { 
        id: generateUniqueId(),
        name: 'Read 30 minutes',
        iconName: 'Book',
        icon: iconOptions.Book.icon,
        color: iconOptions.Book.color,
        streak: 8,
        completed: false,
        time: '20:00'
      },
      { 
        id: generateUniqueId(),
        name: 'Meditation',
        iconName: 'Sparkles',
        icon: iconOptions.Sparkles.icon,
        color: iconOptions.Sparkles.color,
        streak: 5,
        completed: false,
        time: '07:00'
      },
      { 
        id: generateUniqueId(),
        name: 'No caffeine after 2 PM',
        iconName: 'Coffee',
        icon: iconOptions.Coffee.icon,
        color: iconOptions.Coffee.color,
        streak: 3,
        completed: false,
        time: '14:00'
      },
      { 
        id: generateUniqueId(),
        name: 'Early wake up',
        iconName: 'Sunrise',
        icon: iconOptions.Sunrise.icon,
        color: iconOptions.Sunrise.color,
        streak: 15,
        completed: false,
        time: '05:30'
      }
    ];
  });

  const { updateHabits } = useApp();

  // Save habits to localStorage whenever they change
  useEffect(() => {
    const habitsToSave = habits.map(habit => ({
      ...habit,
      icon: undefined,
      iconName: Object.keys(iconOptions).find(
        key => iconOptions[key as keyof typeof iconOptions].icon === habit.icon
      )
    }));
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habitsToSave));
  }, [habits]);

  // Check for date change and reset habits
  useEffect(() => {
    const checkAndResetHabits = () => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastResetDateRef.current) {
        setHabits(prevHabits =>
          prevHabits.map(habit => ({
            ...habit,
            completed: false
          }))
        );
        lastResetDateRef.current = currentDate;
      }
    };

    // Check immediately
    checkAndResetHabits();

    // Check every minute for date changes
    const interval = setInterval(checkAndResetHabits, 60000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats from habits
  const completedHabits = habits.filter(habit => habit.completed).length;
  const totalHabits = habits.length;
  const completionRate = Math.round((completedHabits / totalHabits) * 100) || 0;
  const allHabitsCompleted = completedHabits === totalHabits;

  // Update app context whenever habits change
  useEffect(() => {
    updateHabits(completedHabits, totalHabits);
  }, [habits]);

  useEffect(() => {
    const wasCompleted = prevCompletionRef.current;
    if (allHabitsCompleted && !wasCompleted) {
      setShowAnimation(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
    }
    prevCompletionRef.current = allHabitsCompleted;
  }, [allHabitsCompleted]);

  const today = new Date().getDay();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedIconConfig = iconOptions[newHabit.icon as keyof typeof iconOptions];
    
    const newHabitEntry = {
      id: generateUniqueId(),
      name: newHabit.name,
      iconName: newHabit.icon,
      icon: selectedIconConfig.icon,
      color: selectedIconConfig.color,
      streak: 0,
      completed: false,
      time: newHabit.time
    };

    setHabits(prev => [...prev, newHabitEntry]);
    setIsModalOpen(false);
    setNewHabit({
      name: '',
      time: '06:00',
      icon: 'Dumbbell'
    });
  };

  const toggleHabit = (id: string | number) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === id) {
          const streakChange = !habit.completed ? 1 : -1;
          return {
            ...habit,
            completed: !habit.completed,
            streak: Math.max(0, habit.streak + streakChange)
          };
        }
        return habit;
      })
    );
  };

  const deleteHabit = (id: string | number) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  };

  // Sort habits by time
  const sortedHabits = [...habits].sort((a, b) => {
    const timeA = new Date(`1970-01-01T${a.time}`);
    const timeB = new Date(`1970-01-01T${b.time}`);
    return timeA.getTime() - timeB.getTime();
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Habits</h1>
        <p className="text-gray-600">Build better habits, one day at a time</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Trophy 
                className={`h-6 w-6 text-yellow-500 transition-transform duration-300 ${
                  showAnimation ? 'animate-bounce' : ''
                }`}
              />
              <div>
                <p className="text-sm text-gray-600">Today's Progress</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white h-10 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shrink-0"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Habit</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Week Progress */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => (
            <div 
              key={day.id}
              className={`text-center ${index === today ? 'bg-blue-50 rounded-lg' : ''}`}
            >
              <p className={`text-sm ${index === today ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                {day.label}
              </p>
              <div className={`h-1 mt-2 rounded-full ${index <= today ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {sortedHabits.map(habit => (
          <div key={habit.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-2 rounded-xl ${habit.completed ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                >
                  {habit.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <habit.icon className={`h-5 w-5 ${habit.color}`} />
                    <h3 className="font-medium text-gray-900">{habit.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{formatTime(habit.time)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <p className="text-sm font-medium text-gray-900">{habit.streak} days</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current streak</p>
                </div>
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <X className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Habit</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={newHabit.time}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <select
                  id="icon"
                  value={newHabit.icon}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Dumbbell">Exercise</option>
                  <option value="Book">Reading</option>
                  <option value="Coffee">Caffeine</option>
                  <option value="Sunrise">Morning</option>
                  <option value="Sparkles">Meditation</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Habit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Habits;