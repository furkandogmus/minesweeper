'use client';

import React, { useState } from 'react';

export default function Guide() {
  const [activeSection, setActiveSection] = useState('basics');

  const sections = {
    basics: {
      title: 'Game Basics',
      content: [
        "Minesweeper is a puzzle game where you need to clear a board without detonating any mines.",
        "The board is divided into cells, with mines randomly distributed.",
        "To win, you need to open all cells that do not contain mines."
      ]
    },
    controls: {
      title: 'Controls',
      content: [
        "🖱️ Left Click: Reveal a cell",
        "🚩 Right Click: Place/Remove a flag",
        "🎯 First click is always safe",
        "🔄 Click 'New Game' to restart"
      ]
    },
    numbers: {
      title: 'Understanding Numbers',
      content: [
        "Numbers show how many mines are adjacent to that cell",
        "1️⃣ means one mine is touching this cell",
        "2️⃣ means two mines are touching this cell",
        "And so on up to 8️⃣"
      ]
    },
    strategy: {
      title: 'Strategy Tips',
      content: [
        "🎯 Start with corners or edges - they often have fewer adjacent mines",
        "🚩 Use flags to mark cells you are sure contain mines",
        "🧮 Use the number clues to deduce mine locations",
        "🤔 When stuck, look for patterns in the numbers"
      ]
    },
    difficulty: {
      title: 'Difficulty Levels',
      content: [
        "😊 Easy: 5x5 grid with 5 mines - Perfect for beginners",
        "🤔 Medium: 10x10 grid with 10 mines - Standard challenge",
        "😰 Hard: 15x15 grid with 15 mines - For experts"
      ]
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          How to Play Minesweeper 🎮
        </h2>

        {/* Section Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(sections).map(([key, section]) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                activeSection === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {sections[activeSection as keyof typeof sections].title}
          </h3>
          <ul className="space-y-4">
            {sections[activeSection as keyof typeof sections].content.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          {/* Visual Examples */}
          {activeSection === 'numbers' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3">Example Board:</h4>
              <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                <div className="bg-white p-3 rounded text-center font-bold text-blue-600">1</div>
                <div className="bg-white p-3 rounded text-center font-bold text-green-600">2</div>
                <div className="bg-white p-3 rounded text-center font-bold text-red-600">3</div>
                <div className="bg-white p-3 rounded text-center">🚩</div>
                <div className="bg-white p-3 rounded text-center font-bold text-purple-600">4</div>
                <div className="bg-white p-3 rounded text-center">🚩</div>
                <div className="bg-white p-3 rounded text-center font-bold text-yellow-600">5</div>
                <div className="bg-white p-3 rounded text-center font-bold text-pink-600">6</div>
                <div className="bg-white p-3 rounded text-center">💣</div>
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Quick Tip:</h4>
            <p className="text-gray-600 text-sm">
              {activeSection === 'basics' && "Start by clicking in the middle of the board - it often gives you the most information!"}
              {activeSection === 'controls' && "Double-check before placing flags - incorrect flags can mislead you!"}
              {activeSection === 'numbers' && "When you see a '1', there is exactly one mine in the eight surrounding cells."}
              {activeSection === 'strategy' && "If you are unsure, it is better to reveal a new area than to guess in a difficult spot."}
              {activeSection === 'difficulty' && "Start with Easy mode to learn the basics, then gradually increase difficulty."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 