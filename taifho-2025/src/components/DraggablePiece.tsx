import React, { useRef, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Piece as PieceComponent } from './Piece';
import type { Piece as PieceType } from '../types/game';

interface DraggablePieceProps {
    piece: PieceType;
    x: number;
    y: number;
    isSelected?: boolean;
    isMyTurn?: boolean;
    onClick?: () => void;
}

export const DraggablePiece: React.FC<DraggablePieceProps> = ({ piece, x, y, isSelected, isMyTurn, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging: _isDragging } = useDraggable({
        id: piece.id,
        data: { x, y, piece },
        disabled: !isMyTurn,
    });

    // Track if we're dragging to distinguish click from drag
    const isDraggingRef = useRef(false);
    const startPosRef = useRef<{ x: number; y: number } | null>(null);

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

    // Handle pointer down - record start position
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        startPosRef.current = { x: e.clientX, y: e.clientY };
        isDraggingRef.current = false;
        // Call original listener
        listeners?.onPointerDown?.(e as unknown as PointerEvent);
    }, [listeners]);

    // Handle pointer move - detect if dragging
    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (startPosRef.current) {
            const dx = Math.abs(e.clientX - startPosRef.current.x);
            const dy = Math.abs(e.clientY - startPosRef.current.y);
            if (dx > 5 || dy > 5) {
                isDraggingRef.current = true;
            }
        }
    }, []);

    // Handle click - only trigger if not dragging
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDraggingRef.current && onClick) {
            onClick();
        }
        isDraggingRef.current = false;
        startPosRef.current = null;
    }, [onClick]);

    // Handle touch tap for mobile
    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!isDraggingRef.current && onClick) {
            e.preventDefault();
            onClick();
        }
        isDraggingRef.current = false;
        startPosRef.current = null;
    }, [onClick]);

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes} 
            className="draggable-wrapper"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onClick={handleClick}
            onTouchEnd={handleTouchEnd}
        >
            <PieceComponent piece={piece} isSelected={isSelected} />
        </div>
    );
};
