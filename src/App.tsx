import React from 'react';
import { LayoutDashboard, ListTodo, Target, Wallet, Activity } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import Habits from './components/Habits';
import Todos from './components/Todos';
import Goals from './components/Goals';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'budget', icon: Wallet, label: 'Budget' },
    { id: 'habits', icon: Activity, label: 'Habits' },
    { id: 'todos', icon: ListTodo, label: 'To-dos' },
    { id: 'goals', icon: Target, label: 'Goals' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20 md:pb-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'budget' && <Budget />}
        {activeTab === 'habits' && <Habits />}
        {activeTab === 'todos' && <Todos />}
        {activeTab === 'goals' && <Goals />}
      </main>
      <Navigation items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;