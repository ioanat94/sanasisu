import {
    GameState,
    clearGameState,
    getHighscore,
    loadGameState,
    saveGameState,
    saveHighscore,
} from "./storage";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("storage.ts", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    describe("saveGameState", () => {
        it("should save game state to localStorage", () => {
            const gameState: GameState = {
                score: 10,
                lancelotHealth: 2,
                enemyHealth: 1,
                enemySprite: "goblin",
                isMuted: false,
                currentWord: {
                    word: "koira",
                    tr: "dog",
                    kotous: "koira",
                    case: "nom_p",
                    caseValue: "koirat",
                },
            };

            saveGameState(gameState);

            const saved = localStorage.getItem("sanasisu_game_state");
            expect(saved).toBeTruthy();
            expect(JSON.parse(saved!)).toEqual(gameState);
        });

        it("should handle localStorage errors gracefully", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
                throw new Error("Storage full");
            });

            const gameState: GameState = {
                score: 5,
                lancelotHealth: 3,
                enemyHealth: 2,
                enemySprite: "orc",
                isMuted: true,
                currentWord: {
                    word: "test",
                    tr: "test",
                    kotous: "test",
                    case: "gen_s",
                    caseValue: "testin",
                },
            };

            expect(() => saveGameState(gameState)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to save game state:",
                expect.any(Error),
            );

            consoleSpy.mockRestore();
        });
    });

    describe("loadGameState", () => {
        it("should load game state from localStorage", () => {
            const gameState: GameState = {
                score: 15,
                lancelotHealth: 1,
                enemyHealth: 3,
                enemySprite: "demon",
                isMuted: false,
                currentWord: {
                    word: "luu",
                    tr: "bone",
                    kotous: "maa",
                    case: "par_s",
                    caseValue: "luuta",
                },
            };

            localStorage.setItem(
                "sanasisu_game_state",
                JSON.stringify(gameState),
            );

            const loaded = loadGameState();
            expect(loaded).toEqual(gameState);
        });

        it("should return null when no game state exists", () => {
            const loaded = loadGameState();
            expect(loaded).toBeNull();
        });

        it("should return null when localStorage contains invalid JSON", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            localStorage.setItem("sanasisu_game_state", "invalid json");

            const loaded = loadGameState();
            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to load game state:",
                expect.any(Error),
            );

            consoleSpy.mockRestore();
        });

        it("should handle localStorage errors gracefully", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
                throw new Error("Storage error");
            });

            const loaded = loadGameState();
            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to load game state:",
                expect.any(Error),
            );

            consoleSpy.mockRestore();
        });
    });

    describe("clearGameState", () => {
        it("should remove game state from localStorage", () => {
            const gameState: GameState = {
                score: 20,
                lancelotHealth: 3,
                enemyHealth: 3,
                enemySprite: "troll",
                isMuted: true,
                currentWord: {
                    word: "kissa",
                    tr: "cat",
                    kotous: "koira",
                    case: "ill_s",
                    caseValue: "kissaan",
                },
            };

            localStorage.setItem(
                "sanasisu_game_state",
                JSON.stringify(gameState),
            );
            expect(localStorage.getItem("sanasisu_game_state")).toBeTruthy();

            clearGameState();
            expect(localStorage.getItem("sanasisu_game_state")).toBeNull();
        });

        it("should handle localStorage errors gracefully", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
                throw new Error("Storage error");
            });

            expect(() => clearGameState()).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to clear game state:",
                expect.any(Error),
            );

            consoleSpy.mockRestore();
        });
    });

    describe("getHighscore", () => {
        it("should return highscore from localStorage", () => {
            localStorage.setItem("sanasisu_highscore", "42");

            const highscore = getHighscore();
            expect(highscore).toBe(42);
        });

        it("should return 0 when no highscore exists", () => {
            const highscore = getHighscore();
            expect(highscore).toBe(0);
        });

        it("should return 0 when localStorage contains invalid number", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            localStorage.setItem("sanasisu_highscore", "not a number");

            const highscore = getHighscore();
            expect(highscore).toBe(0);

            consoleSpy.mockRestore();
        });

        it("should handle localStorage errors gracefully", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
                throw new Error("Storage error");
            });

            const highscore = getHighscore();
            expect(highscore).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to get highscore:",
                expect.any(Error),
            );

            consoleSpy.mockRestore();
        });
    });

    describe("saveHighscore", () => {
        it("should save new highscore when score is higher", () => {
            localStorage.setItem("sanasisu_highscore", "10");

            saveHighscore(20);

            const saved = localStorage.getItem("sanasisu_highscore");
            expect(saved).toBe("20");
        });

        it("should not save score when it is lower than current highscore", () => {
            localStorage.setItem("sanasisu_highscore", "50");

            saveHighscore(30);

            const saved = localStorage.getItem("sanasisu_highscore");
            expect(saved).toBe("50");
        });

        it("should save score when it equals current highscore", () => {
            localStorage.setItem("sanasisu_highscore", "25");

            saveHighscore(25);

            const saved = localStorage.getItem("sanasisu_highscore");
            expect(saved).toBe("25");
        });

        it("should save first highscore when none exists", () => {
            saveHighscore(15);

            const saved = localStorage.getItem("sanasisu_highscore");
            expect(saved).toBe("15");
        });

        it("should handle localStorage errors gracefully", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
                throw new Error("Storage full");
            });

            expect(() => saveHighscore(100)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(
                "Failed to save highscore:",
                expect.any(Error),
            );

            consoleSpy.mockRestore();
        });
    });
});
