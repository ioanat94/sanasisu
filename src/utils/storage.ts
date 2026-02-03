export interface GameState {
    score: number;
    lancelotHealth: number;
    enemyHealth: number;
    enemySprite: string;
    isMuted: boolean;
    currentWord: {
        word: string;
        tr: string;
        kotous: string;
        case: string;
        caseValue: string | undefined;
    };
}

const GAME_STATE_KEY = "sanasisu_game_state";
const HIGHSCORE_KEY = "sanasisu_highscore";

export const saveGameState = (state: GameState): void => {
    try {
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error("Failed to save game state:", error);
    }
};

export const loadGameState = (): GameState | null => {
    try {
        const saved = localStorage.getItem(GAME_STATE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error("Failed to load game state:", error);
    }
    return null;
};

export const clearGameState = (): void => {
    try {
        localStorage.removeItem(GAME_STATE_KEY);
    } catch (error) {
        console.error("Failed to clear game state:", error);
    }
};

export const getHighscore = (): number => {
    try {
        const saved = localStorage.getItem(HIGHSCORE_KEY);
        const parsed = saved ? parseInt(saved, 10) : 0;
        return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
        console.error("Failed to get highscore:", error);
        return 0;
    }
};

export const saveHighscore = (score: number): void => {
    try {
        const currentHighscore = getHighscore();
        if (score > currentHighscore) {
            localStorage.setItem(HIGHSCORE_KEY, score.toString());
        }
    } catch (error) {
        console.error("Failed to save highscore:", error);
    }
};
