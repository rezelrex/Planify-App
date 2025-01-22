import React, { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle2, Circle, Star, Clock, Tag, MoreVertical, X, ArrowUpDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';

const TODOS_STORAGE_KEY = 'planify-todos';

type SortOption = 'priority' | 'category' | 'dueDate';

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

const Todos: React.FC = () => {
  const { updateTasks } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newTodo, setNewTodo] = useState({
    title: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Personal'
  });

  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
    if (savedTodos) {
      return JSON.parse(savedTodos);
    }
    return [
      {
        id: 1,
        title: 'Review quarterly budget',
        priority: 'high',
        dueDate: '2024-03-15',
        category: 'Finance',
        completed: false,
        color: 'text-red-500'
      },
      {
        id: 2,
        title: 'Schedule team meeting',
        priority: 'medium',
        dueDate: '2024-03-14',
        category: 'Work',
        completed: true,
        color: 'text-blue-500'
      },
      {
        id: 3,
        title: 'Buy groceries',
        priority: 'low',
        dueDate: '2024-03-13',
        category: 'Personal',
        completed: false,
        color: 'text-green-500'
      },
      {
        id: 4,
        title: 'Prepare presentation',
        priority: 'high',
        dueDate: '2024-03-16',
        category: 'Work',
        completed: false,
        color: 'text-purple-500'
      },
      {
        id: 5,
        title: 'Call dentist',
        priority: 'medium',
        dueDate: '2024-03-14',
        category: 'Health',
        completed: false,
        color: 'text-yellow-500'
      }
    ];
  });

  const [showAnimation, setShowAnimation] = useState(false);
  const prevCompletionRef = React.useRef(false);

  useEffect(() => {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const completedTodos = todos.filter(todo => todo.completed).length;
  const totalTodos = todos.length;
  const completionRate = Math.round((completedTodos / totalTodos) * 100);
  const allTodosCompleted = completedTodos === totalTodos;

  useEffect(() => {
    updateTasks(completedTodos, totalTodos);
  }, [todos]);

  useEffect(() => {
    const wasCompleted = prevCompletionRef.current;
    if (allTodosCompleted && !wasCompleted) {
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
    prevCompletionRef.current = allTodosCompleted;
  }, [allTodosCompleted]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Work':
        return 'text-blue-500';
      case 'Personal':
        return 'text-green-500';
      case 'Health':
        return 'text-yellow-500';
      case 'Finance':
        return 'text-red-500';
      default:
        return 'text-purple-500';
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTodoEntry = {
      id: generateUniqueId(),
      ...newTodo,
      completed: false,
      color: getCategoryColor(newTodo.category)
    };

    setTodos(prev => [...prev, newTodoEntry]);
    setIsModalOpen(false);
    setNewTodo({
      title: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Personal'
    });
  };

  const deleteTodo = (id: number | string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const getSortedTodos = () => {
    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const diff = priorityOrder[a.priority as keyof typeof priorityOrder] - 
                      priorityOrder[b.priority as keyof typeof priorityOrder];
          return sortOrder === 'asc' ? diff : -diff;
        }
        case 'category': {
          const categoryCompare = a.category.localeCompare(b.category);
          return sortOrder === 'asc' ? categoryCompare : -categoryCompare;
        }
        case 'dueDate': {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        default:
          return 0;
      }
    });
  };

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };

  const sortedTodos = getSortedTodos();

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">To-do List</h1>
        <p className="text-gray-600">Stay organized and get things done</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <CheckCircle2 
                  className={`h-6 w-6 text-blue-500 transition-transform duration-300 ${
                    showAnimation ? 'animate-bounce' : ''
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white h-10 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shrink-0"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleSort('priority')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'priority'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Star className="h-4 w-4" />
            Priority
            {sortBy === 'priority' && (
              <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            )}
          </button>
          <button
            onClick={() => toggleSort('category')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'category'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Tag className="h-4 w-4" />
            Category
            {sortBy === 'category' && (
              <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            )}
          </button>
          <button
            onClick={() => toggleSort('dueDate')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sortBy === 'dueDate'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Due Date
            {sortBy === 'dueDate' && (
              <ArrowUpDown className={`h-3 w-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTodos.map(todo => (
          <div key={todo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`p-2 rounded-xl ${todo.completed ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                >
                  {todo.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {todo.title}
                    </h3>
                    {todo.priority === 'high' && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-500">{todo.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-500">{todo.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <X className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
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
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={newTodo.category}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Todos;