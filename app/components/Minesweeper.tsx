'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  onWin: (time: number, difficulty: 'easy' | 'medium' | 'hard') => void;
}

interface Cell {
  value: number | '💣';
  isRevealed: boolean;
  isFlagged: boolean;
  isMine: boolean;
}

type Difficulty = {
  name: string;
  rows: number;
  cols: number;
  mines: number;
};

const DIFFICULTIES: { [key: string]: Difficulty } = {
  easy: { name: 'Easy (5×5)', rows: 5, cols: 5, mines: 4 },
  medium: { name: 'Medium (10×10)', rows: 10, cols: 10, mines: 10 },
  hard: { name: 'Hard (15×15)', rows: 15, cols: 15, mines: 30 },
};

export default function Minesweeper({ onWin }: Props) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [minesLeft, setMinesLeft] = useState(0);
  const [time, setTime] = useState(0);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize board
  const initializeBoard = (firstClickRow?: number, firstClickCol?: number) => {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    const newBoard: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        value: 0,
        isRevealed: false,
        isFlagged: false,
        isMine: false,
      }))
    );

    // Place mines randomly (avoiding first click if provided)
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      
      if (!newBoard[row][col].isMine && 
          (firstClickRow === undefined || 
           Math.abs(row - firstClickRow) > 1 || 
           Math.abs(col - firstClickCol) > 1)) {
        newBoard[row][col].isMine = true;
        newBoard[row][col].value = '💣';
        minesPlaced++;
      }
    }

    // Calculate numbers
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (row + i >= 0 && row + i < rows && col + j >= 0 && col + j < cols) {
                if (newBoard[row + i][col + j].isMine) count++;
              }
            }
          }
          newBoard[row][col].value = count;
        }
      }
    }

    setBoard(newBoard);
    setMinesLeft(mines);
    setGameOver(false);
    setGameWon(false);
    setTime(0);
    
    // Only reset first click and timer if this is a new game
    if (firstClickRow === undefined) {
      setIsFirstClick(true);
      setTimerActive(false);
    }
    
    return newBoard; // Return the board for immediate use
  };

  // Start timer when game starts
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !gameOver && !gameWon) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, gameOver, gameWon]);

  // Initialize board on mount and difficulty change
  useEffect(() => {
    initializeBoard();
  }, [difficulty]);

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isFlagged) return;

    if (isFirstClick) {
      setIsFirstClick(false);
      setTimerActive(true);
      const newBoard = initializeBoard(row, col);
      floodFill(newBoard, row, col);
      setBoard(newBoard);
      return;
    }

    const newBoard = [...board];
    
    if (newBoard[row][col].isMine) {
      // Create explosion overlay
      const overlay = document.createElement('div');
      overlay.className = 'game-over-overlay';
      document.body.appendChild(overlay);

      // Create game over text
      const gameOverText = document.createElement('div');
      gameOverText.className = 'game-over-text';
      gameOverText.textContent = 'GAME OVER';
      document.body.appendChild(gameOverText);

      // Set explosion center
      const cell = document.getElementById(`cell-${row}-${col}`);
      if (cell) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        overlay.style.setProperty('--x', `${centerX}px`);
        overlay.style.setProperty('--y', `${centerY}px`);

        // Create debris particles
        for (let i = 0; i < 20; i++) {
          const debris = document.createElement('div');
          debris.className = 'absolute w-2 h-2 bg-red-500 rounded-full animate-debris';
          debris.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
          debris.style.setProperty('--ty', `${(Math.random() - 0.5) * 200}px`);
          debris.style.setProperty('--r', `${Math.random() * 360}deg`);
          debris.style.left = `${centerX}px`;
          debris.style.top = `${centerY}px`;
          document.body.appendChild(debris);
          setTimeout(() => debris.remove(), 1000);
        }
      }

      // Activate overlay
      requestAnimationFrame(() => overlay.classList.add('active'));

      // Shake the board
      const boardElement = document.querySelector('.game-board');
      if (boardElement) boardElement.classList.add('animate-shake');

      // Flash screen
      document.body.classList.add('animate-flash');

      // Game Over - reveal all mines with cascade effect
      let delay = 0;
      for (let r = 0; r < newBoard.length; r++) {
        for (let c = 0; c < newBoard[0].length; c++) {
          if (newBoard[r][c].isMine) {
            setTimeout(() => {
              newBoard[r][c].isRevealed = true;
              setBoard([...newBoard]);
            }, delay);
            delay += 50;
          }
        }
      }

      // Clean up
      setTimeout(() => {
        overlay.remove();
        gameOverText.remove();
        document.body.classList.remove('animate-flash');
        if (boardElement) boardElement.classList.remove('animate-shake');
      }, 2000); // Increased cleanup time to 2s to show text longer

      setGameOver(true);
      setTimerActive(false);
      return;
    }

    floodFill(newBoard, row, col);
    setBoard(newBoard);

    // Check for win
    let unrevealedSafeCells = 0;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (!newBoard[r][c].isMine && !newBoard[r][c].isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      setGameWon(true);
      setTimerActive(false);
      onWin(time, difficulty);
    }
  };

  // Flood fill algorithm to reveal connected empty cells
  const floodFill = (board: Cell[][], row: number, col: number) => {
    const stack = [[row, col]];
    const rows = board.length;
    const cols = board[0].length;

    while (stack.length > 0) {
      const [r, c] = stack.pop()!;

      // Skip if out of bounds, already revealed, flagged, or is a mine
      if (r < 0 || r >= rows || c < 0 || c >= cols || 
          board[r][c].isRevealed || board[r][c].isFlagged || 
          board[r][c].isMine) {
        continue;
      }

      // Reveal current cell
      board[r][c].isRevealed = true;

      // If it's an empty cell (value is 0), add all neighbors to stack
      if (board[r][c].value === 0) {
        // Add all 8 neighbors
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip current cell
            stack.push([r + i, c + j]);
          }
        }
      } else {
        // If it's a number, only reveal this cell (don't add neighbors to stack)
        continue;
      }
    }
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || gameWon || board[row][col].isRevealed) return;

    const newBoard = [...board];
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setBoard(newBoard);
    setMinesLeft(prev => newBoard[row][col].isFlagged ? prev - 1 : prev + 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
      {/* Difficulty Selection */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(DIFFICULTIES) as Array<'easy' | 'medium' | 'hard'>).map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff)}
            className={`
              flex-1 px-4 py-2 rounded-lg font-medium
              transition-all duration-200 hover:scale-105
              ${difficulty === diff
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {DIFFICULTIES[diff].name}
          </button>
        ))}
      </div>

      {/* Game Stats and New Game Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105">
          <span className="text-xl">💣</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{minesLeft}</span>
        </div>
        
        <button
          onClick={() => initializeBoard()}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          New Game
        </button>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105">
          <span className="text-xl">⏱️</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{time}s</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="aspect-square w-full bg-gray-200 dark:bg-gray-700 rounded-xl p-4 mb-6 game-board">
        <div 
          className="grid gap-1 h-full"
          style={{ 
            gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].cols}, 1fr)`,
            gridTemplateRows: `repeat(${DIFFICULTIES[difficulty].rows}, 1fr)`
          }}
        >
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                id={`cell-${rowIndex}-${colIndex}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => toggleFlag(e, rowIndex, colIndex)}
                className={`
                  aspect-square w-full
                  flex items-center justify-center
                  text-sm sm:text-base lg:text-lg font-bold
                  rounded
                  transition-all duration-200
                  ${cell.isRevealed
                    ? cell.isMine
                      ? 'bg-red-500 text-white animate-explode'
                      : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 animate-reveal'
                    : 'bg-blue-400 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-700 hover:scale-95'
                  }
                  ${gameOver && cell.isMine ? 'bg-red-500 text-white animate-shockwave' : ''}
                  ${cell.isFlagged ? 'animate-flag' : ''}
                `}
                disabled={gameOver || gameWon}
              >
                {cell.isRevealed ? (
                  cell.value
                ) : cell.isFlagged ? (
                  '🚩'
                ) : null}
              </button>
            ))
          ))}
        </div>
      </div>

      {/* Game Status */}
      {(gameOver || gameWon) && (
        <div className="text-center mb-6">
          <p className={`text-xl font-bold ${gameWon ? 'text-green-500 animate-victory' : 'text-red-500 animate-shake'}`}>
            {gameWon ? '🎉 You Won!' : '💥 Game Over!'}
          </p>
        </div>
      )}
    </div>
  );
} 