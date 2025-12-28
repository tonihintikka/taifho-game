import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import type { Position } from '../types/game';

interface CellProps {
    x: number;
    y: number;
    isDark: boolean;
    isValidMove?: boolean;
    isSelected?: boolean;
    children?: React.ReactNode;
    onClick: () => void;
}

export const Cell: React.FC<CellProps> = ({ 
    x, 
    y, 
    isDark, 
    isValidMove = false,
    isSelected = false,
    children, 
    onClick 
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${x}-${y}`,
        data: { x, y } as Position,
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                'cell', 
                isDark ? 'dark' : 'light', 
                { 
                    'drag-over': isOver,
                    'valid-move': isValidMove,
                    'selected': isSelected,
                }
            )}
            onClick={onClick}
        >
            {children}
            {isValidMove && !children && <span className="valid-move-dot">●</span>}
            <span className="coord">{x},{y}</span>
        </div>
    );
};
