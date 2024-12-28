'use client';

import { useState, useEffect } from 'react';
import Minesweeper from './components/Minesweeper';
import Leaderboard from './components/Leaderboard';
import InteractiveGuide from './components/InteractiveGuide';
import Login from './components/Login';
import { useTheme } from './components/ThemeProvider';

interface Score {
  username: string;
  time: number;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    // Try to get saved user from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('minesweeperUser');
    }
    return null;
  });
  
  const [showGuide, setShowGuide] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [scores, setScores] = useState<Score[]>(() => {
    if (typeof window !== 'undefined') {
      const savedScores = localStorage.getItem('minesweeperScores');
      return savedScores ? JSON.parse(savedScores) : [];
    }
    return [];
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('minesweeperUser', currentUser);
    } else {
      localStorage.removeItem('minesweeperUser');
    }
  }, [currentUser]);

  // Save scores to localStorage when they change
  useEffect(() => {
    localStorage.setItem('minesweeperScores', JSON.stringify(scores));
  }, [scores]);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleGameWin = (time: number, difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentUser) return;
    
    const newScore: Score = {
      username: currentUser,
      time,
      date: new Date().toISOString(),
      difficulty
    };
    
    setScores(prev => [...prev, newScore].sort((a, b) => a.time - b.time).slice(0, 10));
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {/* Top Navigation Buttons */}
      <div className="fixed top-4 right-4 flex gap-3">
        <button
          onClick={handleLogout}
          className="p-3 text-xl rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
          aria-label="Logout"
        >
          🚪
        </button>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="p-3 text-xl rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
          aria-label="Toggle guide"
        >
          {showGuide ? '🎮' : '❓'}
        </button>

        <button
          onClick={toggleTheme}
          className="p-3 text-xl rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Minesweeper Game
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome, <span className="font-semibold">{currentUser}</span>!
          </p>
        </div>

        {showGuide ? (
          <InteractiveGuide />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Minesweeper onWin={handleGameWin} />
            </div>
            <div>
              <Leaderboard scores={scores} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 