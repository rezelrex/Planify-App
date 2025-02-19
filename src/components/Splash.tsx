import React, { useEffect, useState } from 'react';
import { ClipboardCheck } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  const [showContent, setShowContent] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(false);

  useEffect(() => {
    // Start the entrance animation after a short delay
    const showTimeout = setTimeout(() => {
      setShowContent(true);
    }, 100);

    // Start exit animation
    const exitTimeout = setTimeout(() => {
      setExitAnimation(true);
    }, 1800);

    // Complete the animation after exit animation finishes
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(exitTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-blue-500 flex items-center justify-center transition-opacity duration-500 ${
      exitAnimation ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className={`transform transition-all duration-1000 ease-out ${
        showContent 
          ? exitAnimation 
            ? 'translate-y-4 opacity-0' 
            : 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      }`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-xl mb-6 animate-bounce">
            <ClipboardCheck className="h-12 w-12 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Planify</h1>
          <p className="text-blue-100 text-lg">
            Where Your Goals Take Flight
            <span className="inline-block animate-pulse">.</span>
            <span className="inline-block animate-pulse delay-100">.</span>
            <span className="inline-block animate-pulse delay-200">.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Splash;