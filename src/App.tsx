import React, { useEffect, useState, useRef, TouchEvent } from 'react';
import { LayoutDashboard, ListTodo, Target, Wallet, Activity } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import Habits from './components/Habits';
import Todos from './components/Todos';
import Goals from './components/Goals';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Splash from './components/Splash';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const minSwipeDistance = 50;
  const maxVerticalDistance = 50;
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'budget', icon: Wallet, label: 'Budget' },
    { id: 'habits', icon: Activity, label: 'Habits' },
    { id: 'todos', icon: ListTodo, label: 'To-dos' },
    { id: 'goals', icon: Target, label: 'Goals' },
  ];

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigate = (path: string) => {
    const tabMap: { [key: string]: string } = {
      '/': 'dashboard',
      '/budget': 'budget',
      '/habits': 'habits',
      '/todos': 'todos',
      '/goals': 'goals'
    };
    
    const newTab = tabMap[path];
    if (newTab) {
      setActiveTab(newTab);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    // Store both X and Y coordinates
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current || isTransitioning) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    // Calculate horizontal and vertical distances
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    // Only process as swipe if vertical movement is limited
    if (deltaY > maxVerticalDistance) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const isLeftSwipe = deltaX < -minSwipeDistance;
    const isRightSwipe = deltaX > minSwipeDistance;

    if (!isLeftSwipe && !isRightSwipe) return;

    const currentIndex = navItems.findIndex(item => item.id === activeTab);
    let nextIndex = currentIndex;

    if (isLeftSwipe && currentIndex < navItems.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (isRightSwipe && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      setIsTransitioning(true);
      setActiveTab(navItems[nextIndex].id);
      setTimeout(() => setIsTransitioning(false), 300); // Match transition duration
    }

    // Reset touch coordinates
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Login onSuccess={() => setSession(true)} />;
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <main 
        className={`pb-20 md:pb-6 transition-transform duration-300 ease-in-out ${
          isTransitioning ? 'pointer-events-none' : ''
        }`}
      >
        {activeTab === 'dashboard' && <Dashboard navigate={navigate} />}
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