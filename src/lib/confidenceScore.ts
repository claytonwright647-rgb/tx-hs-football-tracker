import { Game, LiveGame } from './types';

export const calculateConfidenceScore = (game: Game | LiveGame, data: any) => {
    return { score: 50, mismatches: [] };
};
