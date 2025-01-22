import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavigationProps {
  items: {
    id: string;
    icon: LucideIcon;
    label: string;
  }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ items, activeTab, onTabChange }) => {
  return (
    <nav className="fixed md:relative bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:border-none md:mt-4">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-between md:justify-center md:gap-8">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-3 px-4 md:px-6 ${
                activeTab === item.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;