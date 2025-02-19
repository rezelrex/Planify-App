import React, { useEffect, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, navigate }) => {
  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayClickNext: false,
      stagePadding: 0,
      onDestroyStarted: () => {
        navigate('/');
        onClose();
      },
      onCloseClick: () => {
        driverObj.destroy();
        return false;
      },
      steps: [
        // Dashboard Overview
        {
          element: '#dashboard-overview',
          popover: {
            title: 'Welcome to Planify!',
            description: 'This is your personal dashboard where you can track all your activities and progress.',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '#budget-card',
          popover: {
            title: 'Budget Overview',
            description: 'Track your monthly spending and see how much budget you have left.',
            side: "bottom"
          }
        },
        {
          element: '#tasks-card',
          popover: {
            title: 'Tasks Progress',
            description: 'Keep track of your daily tasks and to-dos.',
            side: "bottom"
          }
        },
        {
          element: '#goals-card',
          popover: {
            title: 'Goals Progress',
            description: 'Monitor your long-term goals and achievements.',
            side: "bottom"
          }
        },
        {
          element: '#habits-card',
          popover: {
            title: 'Habits Tracking',
            description: 'Build and maintain positive habits with daily tracking.',
            side: "bottom"
          }
        },
        {
          element: '.recharts-wrapper',
          popover: {
            title: 'Spending Trends',
            description: 'Visualize your spending patterns over time with this interactive area chart.',
            side: "bottom"
          }
        },
        {
          element: '#recent-activity',
          popover: {
            title: 'Recent Activity',
            description: 'See all your recent updates and progress in one place.',
            side: "top"
          }
        },
        // Budget Page
        {
          popover: {
            title: 'Let\'s explore the Budget page',
            description: 'I\'ll navigate you to the Budget section.',
            onNextClick: () => {
              navigate('/budget');
              setTimeout(() => driverObj.moveNext(), 300);
              return false;
            }
          }
        },
        {
          element: '#budget-overview',
          popover: {
            title: 'Budget Management',
            description: 'Set and manage your monthly budget here.',
            side: "left"
          }
        },
        {
          element: '#budget-progress',
          popover: {
            title: 'Budget Progress',
            description: 'Track your spending and see how much of your budget remains.',
            side: "bottom"
          }
        },
        {
          element: '#spending-categories',
          popover: {
            title: 'Spending Categories',
            description: 'View your spending breakdown by category.',
            side: "bottom"
          }
        },
        {
          element: '#recent-expenses',
          popover: {
            title: 'Recent Expenses',
            description: 'Keep track of your latest expenses and spending patterns.',
            side: "top"
          }
        },
        // Habits Page
        {
          popover: {
            title: 'Next up: Habits',
            description: 'Let\'s check out the Habits section.',
            onNextClick: () => {
              navigate('/habits');
              setTimeout(() => driverObj.moveNext(), 300);
              return false;
            }
          }
        },
        {
          element: '#habits-overview',
          popover: {
            title: 'Habits Overview',
            description: 'Build and track your daily habits here.',
            side: "left"
          }
        },
        {
          element: '#habits-progress',
          popover: {
            title: 'Habits Progress',
            description: 'See your daily completion rate and weekly progress.',
            side: "bottom"
          }
        },
        {
          element: '#habits-streaks',
          popover: {
            title: 'Habit Streaks',
            description: 'Maintain your streaks by completing habits daily.',
            side: "top"
          }
        },
        // To-dos Page
        {
          popover: {
            title: 'Moving to To-dos',
            description: 'Let\'s explore the To-dos section.',
            onNextClick: () => {
              navigate('/todos');
              setTimeout(() => driverObj.moveNext(), 300);
              return false;
            }
          }
        },
        {
          element: 'body',
          popover: {
            title: 'Task Management',
            description: 'Organize and track your daily tasks in this dedicated space.',
            side: "left"
          }
        },
        {
          element: '#todos-list',
          popover: {
            title: 'Todo List',
            description: 'View and manage your tasks. Click on a task to mark it as complete.',
            side: "bottom"
          }
        },
        {
          element: '#sort-buttons',
          popover: {
            title: 'Sort Tasks',
            description: 'Sort your tasks by priority, category, or due date to stay organized.',
            side: "bottom"
          }
        },
        // Goals Page
        {
          popover: {
            title: 'Finally, let\'s check Goals',
            description: 'Last but not least, the Goals section.',
            onNextClick: () => {
              navigate('/goals');
              setTimeout(() => driverObj.moveNext(), 300);
              return false;
            }
          }
        },
        {
          element: '#goals-overview',
          popover: {
            title: 'Goals Overview',
            description: 'Set and track your long-term goals.',
            side: "left"
          }
        },
        {
          element: '#goals-progress',
          popover: {
            title: 'Goals Progress',
            description: 'Monitor your progress towards each goal.',
            side: "bottom"
          }
        },
        {
          element: '#goals-categories',
          popover: {
            title: 'Goal Categories',
            description: 'Organize goals by category and track completion.',
            side: "top"
          }
        },
        {
          popover: {
            title: 'Tour Complete! 🎉',
            description: 'You\'re all set to start using Planify. Click Done to finish the tour.',
            onNextClick: () => {
              driverObj.destroy();
              return false;
            }
          }
        }
      ]
    });

    driverObj.drive();
    
    return () => {
      driverObj.destroy();
    };
  }, [navigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      startTour();
    }
  }, [isOpen, startTour]);

  return null;
};

export default Tutorial;