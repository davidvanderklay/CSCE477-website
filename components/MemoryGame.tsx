// components/MemoryGame.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { shuffle } from 'lodash'; // Using lodash for easy shuffling

// Define card content (using emojis for simplicity)
const cardEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const initialCards = [...cardEmojis, ...cardEmojis]; // Each emoji appears twice

interface MemoryCard {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false); // Prevent clicking during check

  // Initialize/Reset Game
  const initializeGame = useCallback(() => {
    const shuffledEmojis = shuffle(initialCards);
    setCards(
      shuffledEmojis.map((emoji, index) => ({
        id: index,
        value: emoji,
        isFlipped: false,
        isMatched: false,
      }))
    );
    setFlippedIndices([]);
    setMoves(0);
    setGameOver(false);
    setIsChecking(false);
  }, []);

  // Run on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle Card Click
  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched || flippedIndices.length >= 2) {
      return; // Ignore clicks if checking, card already flipped/matched, or 2 cards already open
    }

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // Flip the clicked card
    const newCards = cards.map((card, i) =>
      i === index ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    // If two cards are flipped, check for a match
    if (newFlippedIndices.length === 2) {
      setIsChecking(true); // Start check delay
      setMoves(moves + 1);
      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = newCards[firstIndex];
      const secondCard = newCards[secondIndex];

      if (firstCard.value === secondCard.value) {
        // Match found
        const matchedCards = newCards.map((card) =>
          card.value === firstCard.value ? { ...card, isMatched: true } : card
        );
        setCards(matchedCards);
        setFlippedIndices([]); // Reset flipped cards immediately for match
        setIsChecking(false); // End check delay

        // Check for game over
        if (matchedCards.every((card) => card.isMatched)) {
          setGameOver(true);
        }
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          const resetCards = newCards.map((card, i) =>
            i === firstIndex || i === secondIndex ? { ...card, isFlipped: false } : card
          );
          setCards(resetCards);
          setFlippedIndices([]); // Reset flipped cards after delay
          setIsChecking(false); // End check delay
        }, 1000); // 1 second delay
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-lg font-medium">Moves: {moves}</div>
      {gameOver && (
        <div className="mb-4 text-xl font-bold text-green-600">
          Congratulations! You won in {moves} moves!
        </div>
      )}
      <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
        {cards.map((card, index) => (
          <Card
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`
              w-16 h-20 md:w-20 md:h-24 flex items-center justify-center
              cursor-pointer transition-transform duration-300 ease-in-out
              ${card.isFlipped || card.isMatched ? 'bg-blue-100 transform rotate-y-180' : 'bg-blue-500'}
              ${card.isMatched ? 'opacity-60 cursor-default' : ''}
              ${isChecking && flippedIndices.includes(index) && !card.isMatched ? 'border-2 border-yellow-400' : ''}
            `}
            style={{ transformStyle: 'preserve-3d' }} // Needed for flip effect
          >
            <CardContent className="p-0 flex items-center justify-center w-full h-full backface-hidden">
              {/* Card Front (Emoji) */}
              <div className={`text-3xl md:text-4xl ${card.isFlipped || card.isMatched ? 'block transform rotate-y-180' : 'hidden'}`}>
                {card.value}
              </div>
              {/* Card Back (Hidden when flipped/matched) */}
              <div className={`text-3xl md:text-4xl ${card.isFlipped || card.isMatched ? 'hidden' : 'block'}`}>
                ?
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={initializeGame}>Reset Game</Button>
      {/* Basic CSS for flip effect (add to globals.css or keep here) */}
      <style jsx global>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
};

export default MemoryGame;
