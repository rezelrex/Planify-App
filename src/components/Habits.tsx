import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Calendar, CheckCircle2, Circle, Sparkles, Dumbbell, Book, Coffee, Sunrise, X, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

const HABITS_STORAGE_KEY = 'planify-habits';

// Define icon configurations with their colors
const iconOptions = {
  Dumbbell: {
    icon: Dumbbell,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50'
  },
  Book: {
    icon: Book,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50'
  },
  Coffee: {
    icon: Coffee,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  Sunrise: {
    icon: Sunrise,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  },
  Sparkles: {
    icon: Sparkles,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50'
  },
  Utensils: {
    icon: Utensils,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50'
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
  const prevCompletionRef = React.useRef(false);
  const lastResetDateRef = React.useRef(new Date().toDateString());

  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
    if (savedHabits) {
      return JSON.parse(savedHabits);
    }
    return [
      {
        id: 1,
        name: 'Morning Exercise',
        icon: 'Dumbbell',
        time: '06:00',
        streak: 5,
        completed: false
      },
      {
        id: 2,
        name: 'Read a Book',
        icon: 'Book',
        time: '20:00',
        streak: 3,
        completed: false
      },
      {
        id: 3,
        name: 'Meditate',
        icon: 'Sparkles',
        time: '07:00',
        streak: 7,
        completed: false
      }
    ];
  });

  const { updateHabits } = useApp();

  useEffect(() => {
    const checkAndResetHabits = () => {
      const now = new Date();
      const currentDate = now.toDateString();
      
      if (currentDate !== lastResetDateRef.current) {
        console.log('New day detected, resetting habits');
        
        setHabits(prevHabits =>
          prevHabits.map(habit => ({
            ...habit,
            completed: false
          }))
        );
        
        lastResetDateRef.current = currentDate;
        
        localStorage.setItem('habits-last-reset', currentDate);
      }
    };

    const storedLastReset = localStorage.getItem('habits-last-reset');
    if (storedLastReset !== new Date().toDateString()) {
      checkAndResetHabits();
    }

    const interval = setInterval(checkAndResetHabits, 60000);

    checkAndResetHabits();

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const completedHabits = habits.filter(habit => habit.completed).length;
  const totalHabits = habits.length;
  const completionRate = Math.round((completedHabits / totalHabits) * 100) || 0;
  const allHabitsCompleted = completedHabits === totalHabits && totalHabits > 0;

  useEffect(() => {
    updateHabits(completedHabits, totalHabits);
  }, [habits, completedHabits, totalHabits, updateHabits]);

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
    
    const newHabitEntry = {
      id: Date.now(),
      name: newHabit.name,
      icon: newHabit.icon,
      time: newHabit.time,
      streak: 0,
      completed: false
    };

    setHabits(prev => [...prev, newHabitEntry]);
    setIsModalOpen(false);
    setNewHabit({
      name: '',
      time: '06:00',
      icon: 'Dumbbell'
    });
  };

  const toggleHabit = (id: number) => {
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === id) {
          const newCompleted = !habit.completed;
          return {
            ...habit,
            completed: newCompleted,
            streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
          };
        }
        return habit;
      })
    );
  };

  const deleteHabit = (id: number) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
  };

  const sortedHabits = [...habits].sort((a, b) => {
    const timeA = new Date(`1970-01-01T${a.time}`);
    const timeB = new Date(`1970-01-01T${b.time}`);
    return timeA.getTime() - timeB.getTime();
  });

  return (
    <div id="habits-overview" className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Habits</h1>
        <p className="text-gray-600">Build better habits, one day at a time</p>
      </div>

      <div id="habits-progress" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
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

      <div id="habits-streaks" className="space-y-4">
        {sortedHabits.map(habit => {
          const IconComponent = iconOptions[habit.icon as keyof typeof iconOptions]?.icon || Sparkles;
          const iconColor = iconOptions[habit.icon as keyof typeof iconOptions]?.color || 'text-violet-500';
          const iconBgColor = iconOptions[habit.icon as keyof typeof iconOptions]?.bgColor || 'bg-violet-50';

          return (
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
                      <div className={`p-2 rounded-lg ${iconBgColor}`}>
                        <IconComponent className={iconColor} />
                      </div>
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
          );
        })}
      </div>

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
                  <option value="Utensils">Healthy Eating</option>
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
};

export default Habits;