import type { StoreSlice, GameStore, HistoryEntry } from '../types';
import { copyBoard } from '../helpers';

export interface HistorySliceState {
    undoMove: () => void;
    redoMove: () => void;
    getMoveLog: () => string;
}

export const createHistorySlice: StoreSlice<HistorySliceState> = (set, get) => ({
    undoMove: () => set((state: GameStore) => {
        if (state.historyIndex <= 0) return {};

        const newIndex = state.historyIndex - 1;
        const entry: HistoryEntry = state.boardHistory[newIndex];

        return {
            board: copyBoard(entry.board),
            currentPlayer: entry.currentPlayer,
            historyIndex: newIndex,
            isViewingHistory: true,
            selectedPos: null,
        };
    }),

    redoMove: () => set((state: GameStore) => {
        if (state.historyIndex >= state.boardHistory.length - 1) return {};

        const newIndex = state.historyIndex + 1;
        const entry: HistoryEntry = state.boardHistory[newIndex];

        return {
            board: copyBoard(entry.board),
            currentPlayer: entry.currentPlayer,
            historyIndex: newIndex,
            isViewingHistory: newIndex < state.boardHistory.length - 1,
            selectedPos: null,
        };
    }),

    getMoveLog: (): string => {
        const state = get();
        const moves = state.moveHistory ?? [];
        if (moves.length === 0) return "No moves yet.";

        return moves.map((m, i) => {
            const pieceCode = m.piece.type[0].toUpperCase();
            const colorCode = m.piece.color[0].toUpperCase();
            const fromStr = `(${m.from.x},${m.from.y})`;
            const toStr = `(${m.to.x},${m.to.y})`;
            return `${i + 1}. ${colorCode}-${pieceCode} ${fromStr}→${toStr}`;
        }).join('\n');
    },
});
