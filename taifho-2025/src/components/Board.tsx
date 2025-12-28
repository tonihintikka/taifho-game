import React from 'react';
import { DndContext, type DragEndEvent, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameStore } from '../store/useGameStore';
import { Cell } from './Cell';
import { DraggablePiece } from './DraggablePiece';
import './Board.css';
import type { PlayerColor, AIDifficulty } from '../types/game';

// Difficulty display names
const DIFFICULTY_LABELS: Record<AIDifficulty, string> = {
    beginner: '🌱',
    easy: '🌿',
    medium: '⚔️',
    challenging: '🎯',
    hard: '🔥',
    master: '👑',
    grandmaster: '🏆'
};

// Difficulty text names
const DIFFICULTY_NAMES: Record<AIDifficulty, string> = {
    beginner: 'Beginner',
    easy: 'Easy',
    medium: 'Medium',
    challenging: 'Challenging',
    hard: 'Hard',
    master: 'Master',
    grandmaster: 'Grandmaster'
};

// Player label component
const PlayerLabel: React.FC<{
    color: PlayerColor;
    emoji: string;
    name: string;
    playerType: 'human' | 'computer';
    difficulty: AIDifficulty | null;
}> = ({ color, emoji, name, playerType, difficulty }) => {
    const isAI = playerType === 'computer';
    const diffEmoji = isAI && difficulty ? DIFFICULTY_LABELS[difficulty] : '';
    const diffName = isAI && difficulty ? DIFFICULTY_NAMES[difficulty] : '';
    
    return (
        <span className={`edge-label ${color}`}>
            {emoji} {name}
            <span className="player-type">
                {isAI ? (
                    <>🤖{diffEmoji} <span className="diff-text">{diffName}</span></>
                ) : '👤 Human'}
            </span>
        </span>
    );
};

export const Board: React.FC = () => {
    const { board, selectedPos, validMoves, currentPlayer, gameConfig, selectPiece, movePiece } = useGameStore();
    const is4Player = gameConfig.playerCount === 4;

    // Configure sensors for both mouse and touch with activation distance
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: { distance: 8 },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: { delay: 150, tolerance: 8 },
    });
    const sensors = useSensors(mouseSensor, touchSensor);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active) {
            const from = active.data.current as { x: number, y: number };
            const to = over.data.current as { x: number, y: number };

            if (from && to && (from.x !== to.x || from.y !== to.y)) {
                movePiece(from, to);
            }
        }
    };

    const handleCellClick = (x: number, y: number) => {
        // If clicking on a valid move target, execute the move
        if (selectedPos && validMoves?.some(m => m.x === x && m.y === y)) {
            movePiece(selectedPos, { x, y });
            return;
        }
        // Otherwise, select the piece (or deselect if clicking elsewhere)
        selectPiece({ x, y });
    };

    const handlePieceClick = (x: number, y: number) => {
        selectPiece({ x, y });
    };

    // Check if a position is a valid move target
    const isValidMoveTarget = (x: number, y: number): boolean => {
        return validMoves?.some(m => m.x === x && m.y === y) ?? false;
    };

    return (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
            <div className="board-container">
                {/* Top edge - Blue's goal (row 0) */}
                <div className="board-edge top">
                    <PlayerLabel
                        color="blue"
                        emoji="🔵"
                        name="BLUE"
                        playerType={gameConfig.playerTypes.blue}
                        difficulty={gameConfig.aiDifficulty.blue}
                    />
                </div>

                <div className="board-with-sides">
                    {/* Left edge - Green's goal (column 0) */}
                    {is4Player && (
                        <div className="board-edge left">
                            <PlayerLabel
                                color="green"
                                emoji="🟢"
                                name="GREEN"
                                playerType={gameConfig.playerTypes.green}
                                difficulty={gameConfig.aiDifficulty.green}
                            />
                        </div>
                    )}

                    <div className="board">
                        {board.map((row, y) => (
                            <div key={`row-${y}`} className="board-row">
                                {row.map((piece, x) => {
                                    const isDark = (x + y) % 2 === 1;
                                    const isSelected = selectedPos?.x === x && selectedPos?.y === y;
                                    const isValidMove = isValidMoveTarget(x, y);
                                    const isMyTurn = piece ? piece.color === currentPlayer : false;

                                    return (
                                        <Cell
                                            key={`cell-${x}-${y}`}
                                            x={x}
                                            y={y}
                                            isDark={isDark}
                                            isValidMove={isValidMove}
                                            isSelected={isSelected}
                                            onClick={() => handleCellClick(x, y)}
                                        >
                                            {piece && (
                                                <DraggablePiece
                                                    piece={piece}
                                                    x={x}
                                                    y={y}
                                                    isSelected={isSelected}
                                                    isMyTurn={isMyTurn}
                                                    onClick={() => handlePieceClick(x, y)}
                                                />
                                            )}
                                        </Cell>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Right edge - Yellow's goal (column 9) */}
                    {is4Player && (
                        <div className="board-edge right">
                            <PlayerLabel
                                color="yellow"
                                emoji="🟡"
                                name="YELLOW"
                                playerType={gameConfig.playerTypes.yellow}
                                difficulty={gameConfig.aiDifficulty.yellow}
                            />
                        </div>
                    )}
                </div>

                {/* Bottom edge - Red's goal (row 9) */}
                <div className="board-edge bottom">
                    <PlayerLabel
                        color="red"
                        emoji="🔴"
                        name="RED"
                        playerType={gameConfig.playerTypes.red}
                        difficulty={gameConfig.aiDifficulty.red}
                    />
                </div>
            </div>
        </DndContext>
    );
};
