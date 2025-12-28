import { useState } from 'react';
import './MoveLog.css';
import { useGameStore } from '../store/useGameStore';

export const MoveLog: React.FC = () => {
    const {
        getMoveLog,
        undoMove,
        redoMove,
        historyIndex,
        boardHistory,
        isViewingHistory
    } = useGameStore();

    const [copied, setCopied] = useState(false);

    const log = getMoveLog();
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < boardHistory.length - 1;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(log);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleResume = () => {
        // Go to latest state
        while (useGameStore.getState().historyIndex < useGameStore.getState().boardHistory.length - 1) {
            redoMove();
        }
    };

    return (
        <div className="move-log-container">
            <div className="move-log-header">
                <h4>Move Log</h4>
                <button
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>

            {isViewingHistory && (
                <div className="viewing-history-notice">
                    📜 Viewing history
                    <button className="resume-btn" onClick={handleResume}>
                        Resume
                    </button>
                </div>
            )}

            <div className="move-log-content">
                {log}
            </div>

            <div className="history-controls">
                <button
                    className="history-btn"
                    onClick={undoMove}
                    disabled={!canUndo}
                >
                    ◀ Back
                </button>
                <button
                    className="history-btn"
                    onClick={redoMove}
                    disabled={!canRedo}
                >
                    Forward ▶
                </button>
            </div>
        </div>
    );
};
