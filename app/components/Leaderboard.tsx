'use client';

import React, { useState } from 'react';

interface Score {
  username: string;
  time: number;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface LeaderboardProps {
  scores: Score[];
}

export default function Leaderboard({ scores }: LeaderboardProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const filteredScores = scores
    .filter(score => score.difficulty === selectedDifficulty)
    .sort((a, b) => a.time - b.time)
    .slice(0, 10);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Leaderboard 🏆
      </h2>

      {/* Difficulty Tabs */}
      <div className="flex gap-2 mb-6">
        {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
          <button
            key={difficulty}
            onClick={() => setSelectedDifficulty(difficulty)}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium
              transition-colors duration-200
              ${selectedDifficulty === difficulty
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </button>
        ))}
      </div>

      {/* Scores Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Rank</th>
              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Player</th>
              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Time</th>
              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredScores.length > 0 ? (
              filteredScores.map((score, index) => (
                <tr
                  key={`${score.username}-${score.date}`}
                  className={`
                    border-b dark:border-gray-700
                    ${index < 3 ? 'font-semibold' : ''}
                  `}
                >
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{score.username}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatTime(score.time)}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatDate(score.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No scores yet for {selectedDifficulty} difficulty.
                  <br />
                  Be the first to set a record!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 