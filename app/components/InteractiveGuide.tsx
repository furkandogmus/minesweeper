'use client';

import React, { useState } from 'react';

interface DemoCell {
  value: number | '💣' | '🚩' | '';
  isRevealed: boolean;
  isMine: boolean;
  isFlagged: boolean;
}

export default function InteractiveGuide() {
  const [step, setStep] = useState(1);
  const [board, setBoard] = useState<DemoCell[][]>(() => {
    // Create a 5x5 demo board
    const demoBoard: DemoCell[][] = Array(5).fill(null).map(() =>
      Array(5).fill(null).map(() => ({
        value: '',
        isRevealed: false,
        isMine: false,
        isFlagged: false
      }))
    );

    // Place mines for the demo
    const minePositions = [[1, 1], [2, 3], [3, 0]];
    minePositions.forEach(([row, col]) => {
      demoBoard[row][col].isMine = true;
      demoBoard[row][col].value = '💣';
    });

    // Calculate numbers
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (!demoBoard[row][col].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (
                row + i >= 0 && row + i < 5 &&
                col + j >= 0 && col + j < 5 &&
                demoBoard[row + i][col + j].isMine
              ) {
                count++;
              }
            }
          }
          demoBoard[row][col].value = count || '';
        }
      }
    }

    return demoBoard;
  });

  const steps = [
    {
      title: "Welcome to Interactive Guide!",
      description: "Let's learn Minesweeper step by step. Click 'Next' to begin.",
      action: null
    },
    {
      title: "Safe First Click",
      description: "Click the center cell (2,2). The first click is always safe!",
      action: () => {
        const newBoard = [...board];
        newBoard[2][2].isRevealed = true;
        setBoard(newBoard);
      }
    },
    {
      title: "Understanding Numbers",
      description: "The number '2' shows that there are two mines adjacent to this cell.",
      highlight: [2, 2]
    },
    {
      title: "Using Flags",
      description: "Right-click a cell you suspect has a mine to place a flag. Try flagging (1,1)!",
      action: () => {
        const newBoard = [...board];
        newBoard[1][1].isFlagged = true;
        newBoard[1][1].value = '🚩';
        setBoard(newBoard);
      }
    },
    {
      title: "Revealing Safe Cells",
      description: "Click cells you think are safe. Numbers help you identify mine locations.",
      action: () => {
        const newBoard = [...board];
        newBoard[0][0].isRevealed = true;
        newBoard[0][1].isRevealed = true;
        setBoard(newBoard);
      }
    }
  ];

  const handleCellClick = (row: number, col: number) => {
    if (step === 2 && row === 2 && col === 2) {
      steps[1].action?.();
      setStep(3);
    }
  };

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (step === 4 && row === 1 && col === 1) {
      steps[3].action?.();
      setStep(5);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Interactive Guide 🎮
        </h2>

        {/* Step Information */}
        <div className="mb-8 text-center">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Step {step}: {steps[step - 1].title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {steps[step - 1].description}
          </p>
        </div>

        {/* Demo Board */}
        <div className="aspect-square w-full max-w-[300px] mx-auto bg-gray-200 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-5 gap-2 h-full">
            {board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                  className={`
                    aspect-square w-full
                    flex items-center justify-center
                    text-lg font-bold
                    rounded-lg
                    transition-all duration-200
                    ${cell.isRevealed
                      ? 'bg-white dark:bg-gray-600'
                      : 'bg-blue-400 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-700'}
                    ${steps[step - 1].highlight?.[0] === rowIndex && 
                      steps[step - 1].highlight?.[1] === colIndex
                      ? 'ring-4 ring-yellow-400'
                      : ''}
                  `}
                >
                  {cell.isRevealed || cell.isFlagged ? cell.value : ''}
                </button>
              ))
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (step === 5) {
                steps[4].action?.();
              }
              setStep(Math.min(steps.length, step + 1));
            }}
            disabled={step === steps.length}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
} 