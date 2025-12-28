/**
 * AI Setup Strategy
 * 
 * Determines how AI players arrange their pieces at the start of the game.
 * Different difficulty levels use different strategies.
 */

import type { Piece, PieceType, PlayerColor, AIDifficulty } from '../types/game';
import { createUnplacedPieces } from '../types/game';

// Valid placement columns for 2-player (1-8)
const VALID_COLUMNS_2P = [1, 2, 3, 4, 5, 6, 7, 8];
// Valid placement columns for 4-player (2-7)
const VALID_COLUMNS_4P = [2, 3, 4, 5, 6, 7];

/**
 * Pre-defined strategic setup templates
 */
export const SETUP_TEMPLATES: Record<string, PieceType[]> = {
    // Balanced: Circles center, mixed edges (default)
    balanced: ['square', 'triangle', 'diamond', 'circle', 'circle', 'diamond', 'triangle', 'square'],
    
    // Aggressive: Circles forward-ready, diamonds supporting
    aggressive: ['triangle', 'square', 'circle', 'diamond', 'diamond', 'circle', 'square', 'triangle'],
    
    // Defensive: Triangles protected in center, squares on flanks
    defensive: ['square', 'diamond', 'triangle', 'circle', 'circle', 'triangle', 'diamond', 'square'],
    
    // Flanking: Strong pieces (circles) on edges for wide attacks
    flanking: ['circle', 'diamond', 'triangle', 'square', 'square', 'triangle', 'diamond', 'circle'],
    
    // Center control: All power in middle columns
    centerControl: ['triangle', 'square', 'circle', 'diamond', 'diamond', 'circle', 'square', 'triangle'],
    
    // Diamond rush: Diamonds in center for diagonal breakthrough
    diamondRush: ['square', 'circle', 'diamond', 'triangle', 'triangle', 'diamond', 'circle', 'square'],
    
    // Square advance: Squares positioned for straight-line advance
    squareAdvance: ['circle', 'triangle', 'square', 'diamond', 'diamond', 'square', 'triangle', 'circle'],
};

/**
 * 4-player setup templates (6 pieces, no circles)
 */
export const SETUP_TEMPLATES_4P: Record<string, PieceType[]> = {
    balanced: ['square', 'triangle', 'diamond', 'diamond', 'triangle', 'square'],
    aggressive: ['triangle', 'diamond', 'square', 'square', 'diamond', 'triangle'],
    defensive: ['square', 'diamond', 'triangle', 'triangle', 'diamond', 'square'],
    flanking: ['diamond', 'square', 'triangle', 'triangle', 'square', 'diamond'],
};

/**
 * Shuffle array (Fisher-Yates)
 */
const shuffleArray = <T>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

/**
 * Evaluate a setup arrangement
 * Higher score = better arrangement
 */
const evaluateSetup = (
    arrangement: PieceType[],
    is4Player: boolean,
    opponentSetup?: PieceType[]
): number => {
    let score = 0;
    const columns = is4Player ? VALID_COLUMNS_4P : VALID_COLUMNS_2P;
    const centerIndex = (columns.length - 1) / 2;
    
    arrangement.forEach((type, index) => {
        const distFromCenter = Math.abs(index - centerIndex);
        
        // Factor 1: Circles in center (most flexible)
        if (type === 'circle') {
            score += (centerIndex - distFromCenter) * 15;
        }
        
        // Factor 2: Triangles on edges (limited movement, safer on edges)
        if (type === 'triangle') {
            if (index <= 1 || index >= columns.length - 2) {
                score += 8; // Edge bonus
            }
        }
        
        // Factor 3: Diamonds in diagonal lanes (center-ish)
        if (type === 'diamond') {
            if (distFromCenter <= 2) {
                score += 6; // Center area bonus
            }
        }
        
        // Factor 4: Squares for straight advancement (flexible position)
        if (type === 'square') {
            score += 3; // Baseline score - squares are versatile
        }
    });
    
    // Factor 5: Piece synergy - adjacent similar pieces
    for (let i = 0; i < arrangement.length - 1; i++) {
        if (arrangement[i] === arrangement[i + 1]) {
            score += 2; // Small bonus for paired pieces
        }
    }
    
    // Factor 6: Counter opponent setup (if known)
    if (opponentSetup) {
        // If opponent has circles on edges, put ours in center
        const oppCirclePositions = opponentSetup
            .map((t, i) => t === 'circle' ? i : -1)
            .filter(i => i >= 0);
        const ourCirclePositions = arrangement
            .map((t, i) => t === 'circle' ? i : -1)
            .filter(i => i >= 0);
        
        // Bonus if our circles are in different columns than opponent's
        ourCirclePositions.forEach(pos => {
            if (!oppCirclePositions.includes(pos)) {
                score += 5;
            }
        });
    }
    
    // Factor 7: Small random variation to avoid predictability
    score += Math.random() * 3;
    
    return score;
};

/**
 * Generate random arrangement
 */
const generateRandomSetup = (pieces: Piece[]): Piece[] => {
    return shuffleArray([...pieces]);
};

/**
 * Generate simple strategic setup
 */
const generateSimpleSetup = (pieces: Piece[]): Piece[] => {
    // Use balanced template
    const template = SETUP_TEMPLATES.balanced;
    return orderByTemplate(pieces, template);
};

/**
 * Generate evaluated setup (tries multiple arrangements)
 */
const generateEvaluatedSetup = (
    pieces: Piece[],
    is4Player: boolean,
    iterations: number,
    opponentSetup?: PieceType[]
): Piece[] => {
    const candidates: { arrangement: Piece[]; score: number }[] = [];
    
    // Try random arrangements
    for (let i = 0; i < iterations; i++) {
        const arrangement = shuffleArray([...pieces]);
        const types = arrangement.map(p => p.type);
        const score = evaluateSetup(types, is4Player, opponentSetup);
        candidates.push({ arrangement, score });
    }
    
    // Also try all templates
    const templates = is4Player ? SETUP_TEMPLATES_4P : SETUP_TEMPLATES;
    for (const [_name, template] of Object.entries(templates)) {
        const arrangement = orderByTemplate(pieces, template);
        const score = evaluateSetup(template, is4Player, opponentSetup);
        candidates.push({ arrangement, score: score + 5 }); // Small bonus for templates
    }
    
    // Sort by score (descending)
    candidates.sort((a, b) => b.score - a.score);
    
    // Pick from top candidates with some randomness
    const topN = Math.min(5, candidates.length);
    const selected = candidates[Math.floor(Math.random() * topN)];
    
    return selected.arrangement;
};

/**
 * Generate advanced setup with opponent modeling
 */
const generateAdvancedSetup = (
    pieces: Piece[],
    is4Player: boolean,
    opponentSetup?: PieceType[]
): Piece[] => {
    // More iterations + opponent analysis
    return generateEvaluatedSetup(pieces, is4Player, 500, opponentSetup);
};

/**
 * Order pieces according to a template
 */
const orderByTemplate = (pieces: Piece[], template: PieceType[]): Piece[] => {
    const result: Piece[] = [];
    const available = [...pieces];
    
    for (const type of template) {
        const index = available.findIndex(p => p.type === type);
        if (index >= 0) {
            result.push(available[index]);
            available.splice(index, 1);
        }
    }
    
    // Add any remaining pieces (shouldn't happen if template matches)
    result.push(...available);
    
    return result;
};

/**
 * Select a template based on strategy
 */
export const selectTemplate = (
    strategy: 'random' | 'balanced' | 'aggressive' | 'defensive' | 'counter',
    is4Player: boolean,
    opponentSetup?: PieceType[]
): PieceType[] => {
    const templates = is4Player ? SETUP_TEMPLATES_4P : SETUP_TEMPLATES;
    
    switch (strategy) {
        case 'random':
            const keys = Object.keys(templates);
            return templates[keys[Math.floor(Math.random() * keys.length)]];
            
        case 'balanced':
            return templates.balanced;
            
        case 'aggressive':
            return templates.aggressive;
            
        case 'defensive':
            return templates.defensive;
            
        case 'counter':
            if (!opponentSetup) return templates.balanced;
            
            // Analyze opponent and choose counter
            const oppCircleCenter = opponentSetup
                .map((t, i) => t === 'circle' ? Math.abs(i - 3.5) : 999)
                .filter(d => d < 999);
            
            const avgCircleDistance = oppCircleCenter.length > 0
                ? oppCircleCenter.reduce((a, b) => a + b, 0) / oppCircleCenter.length
                : 0;
            
            // If opponent's circles are in center, use flanking
            if (avgCircleDistance < 2) {
                return templates.flanking || templates.balanced;
            }
            // If opponent's circles are on edges, use center control
            return templates.centerControl || templates.balanced;
            
        default:
            return templates.balanced;
    }
};

/**
 * Main function: Generate AI setup based on difficulty
 */
export const generateAISetup = (
    color: PlayerColor,
    difficulty: AIDifficulty | null,
    is4Player: boolean = false,
    opponentSetup?: PieceType[]
): Piece[] => {
    const pieces = createUnplacedPieces(color, is4Player);
    
    switch (difficulty) {
        case 'beginner':
            // Completely random
            return generateRandomSetup(pieces);
            
        case 'easy':
            // Simple heuristic (balanced template)
            return generateSimpleSetup(pieces);
            
        case 'medium':
            // Evaluate 50 arrangements
            return generateEvaluatedSetup(pieces, is4Player, 50, opponentSetup);
            
        case 'challenging':
            // Evaluate 100 arrangements
            return generateEvaluatedSetup(pieces, is4Player, 100, opponentSetup);
            
        case 'hard':
            // Evaluate 200 arrangements
            return generateEvaluatedSetup(pieces, is4Player, 200, opponentSetup);
            
        case 'master':
        case 'grandmaster':
            // Advanced with full opponent modeling
            return generateAdvancedSetup(pieces, is4Player, opponentSetup);
            
        default:
            // Default to balanced
            return generateSimpleSetup(pieces);
    }
};

/**
 * Get the types from a piece arrangement (for opponent analysis)
 */
export const getSetupTypes = (pieces: Piece[]): PieceType[] => {
    return pieces.map(p => p.type);
};

