import * as storage from "./utils/storage";
import * as wordlist from "./utils/wordlist";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "./App";
import { EventBus } from "./game/EventBus";
import userEvent from "@testing-library/user-event";

vi.mock("./PhaserGame", () => ({
    PhaserGame: vi.fn(({ currentActiveScene }) => {
        if (currentActiveScene) {
            setTimeout(() => {
                currentActiveScene({ scene: { key: "Game" } });
            }, 0);
        }
        return <div data-testid="phaser-game">Phaser Game</div>;
    }),
}));

describe("App.tsx", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.spyOn(storage, "getHighscore").mockReturnValue(0);
        vi.spyOn(storage, "saveHighscore").mockImplementation(() => {});
        vi.spyOn(storage, "saveGameState").mockImplementation(() => {});
        vi.spyOn(storage, "loadGameState").mockReturnValue(null);
        vi.spyOn(storage, "clearGameState").mockImplementation(() => {});
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    describe("Initial Render", () => {
        it("should render the app", () => {
            render(<App />);
            expect(screen.getByTestId("phaser-game")).toBeInTheDocument();
        });

        it("should initialize with score of 0", async () => {
            render(<App />);
            await waitFor(() => {
                expect(screen.queryByText(/Score: 0/i)).toBeInTheDocument();
            });
        });

        it("should load highscore on mount", () => {
            vi.spyOn(storage, "getHighscore").mockReturnValue(42);
            render(<App />);
            expect(storage.getHighscore).toHaveBeenCalled();
        });

        it("should display random word information", async () => {
            vi.spyOn(wordlist, "wordlist", "get").mockReturnValue([
                {
                    word: "koira",
                    tr: "dog",
                    kotous: "koira",
                    nom_p: "koirat",
                    gen_s: "koiran",
                    gen_p: "koirien",
                    par_s: "koiraa",
                    par_p: "koiria",
                    ine_s: "koirassa",
                    ine_p: "koirissa",
                    ela_s: "koirasta",
                    ela_p: "koirista",
                    ill_s: "koiraan",
                    ill_p: "koiriin",
                    ade_s: "koiralla",
                    ade_p: "koirilla",
                    abl_s: "koiralta",
                    abl_p: "koirilta",
                    all_s: "koiralle",
                    all_p: "koirille",
                    ess_s: "koirana",
                    ess_p: "koirina",
                    tra_s: "koiraksi",
                    tra_p: "koiriksi",
                    abe_s: "koiratta",
                    abe_p: "koiritta",
                    ins_p: "koirin",
                    com_p: "koirineni",
                },
            ]);

            render(<App />);
            await waitFor(() => {
                expect(screen.queryByText(/koira/i)).toBeInTheDocument();
                expect(screen.queryByText(/dog/i)).toBeInTheDocument();
            });
        });
    });

    describe("EventBus Integration", () => {
        it("should listen to show-help event", async () => {
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("show-help");

            await waitFor(() => {
                expect(screen.getByText(/Help/i)).toBeInTheDocument();
            });
        });

        it("should listen to game-over event", async () => {
            const saveHighscoreSpy = vi.spyOn(storage, "saveHighscore");
            const clearGameStateSpy = vi.spyOn(storage, "clearGameState");

            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("game-over");

            await waitFor(() => {
                expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
            });

            expect(saveHighscoreSpy).toHaveBeenCalled();
            expect(clearGameStateSpy).toHaveBeenCalled();
        });

        it("should clean up event listeners on unmount", () => {
            const offSpy = vi.spyOn(EventBus, "off");
            const { unmount } = render(<App />);

            unmount();

            expect(offSpy).toHaveBeenCalledWith(
                "show-help",
                expect.any(Function),
            );
            expect(offSpy).toHaveBeenCalledWith(
                "game-over",
                expect.any(Function),
            );
            expect(offSpy).toHaveBeenCalledWith(
                "enemy-spawned",
                expect.any(Function),
            );
            expect(offSpy).toHaveBeenCalledWith(
                "sound-toggled",
                expect.any(Function),
            );
        });
    });

    describe("Player Input", () => {
        it("should update player answer when typing", async () => {
            const user = userEvent.setup();
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByRole("textbox")).toBeInTheDocument();
            });

            const input = screen.getByRole("textbox") as HTMLInputElement;
            await user.type(input, "koiraa");

            expect(input.value).toBe("koiraa");
        });

        it("should prevent form submission with empty answer", async () => {
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByRole("textbox")).toBeInTheDocument();
            });

            const form = screen.getByRole("textbox").closest("form");
            expect(form).toBeInTheDocument();

            fireEvent.submit(form!);

            expect(screen.getByText(/Score: 0/i)).toBeInTheDocument();
        });
    });

    describe("Help Modal", () => {
        it("should show help modal when show-help event is emitted", async () => {
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("show-help");

            await waitFor(() => {
                expect(screen.getByText(/Help/i)).toBeInTheDocument();
            });
        });

        it("should close help modal when close button is clicked", async () => {
            const user = userEvent.setup();
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("show-help");

            await waitFor(() => {
                expect(screen.getByText(/Help/i)).toBeInTheDocument();
            });

            const closeButton = screen.getByText(/Close/i);
            await user.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText(/Help/i)).not.toBeInTheDocument();
            });
        });
    });

    describe("Game Over Modal", () => {
        it("should show game over modal when game-over event is emitted", async () => {
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("game-over");

            await waitFor(() => {
                expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
            });
        });

        it("should display final score in game over modal", async () => {
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("game-over");

            await waitFor(() => {
                expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
                expect(screen.getByText(/Final Score:/i)).toBeInTheDocument();
            });
        });
    });

    describe("State Persistence", () => {
        it("should load saved game state on mount", () => {
            const savedState = {
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

            vi.spyOn(storage, "loadGameState").mockReturnValue(savedState);

            render(<App />);

            expect(storage.loadGameState).toHaveBeenCalled();
        });

        it("should save game state when enemy spawns", async () => {
            const saveGameStateSpy = vi.spyOn(storage, "saveGameState");
            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("enemy-spawned");

            await waitFor(
                () => {
                    expect(saveGameStateSpy).toHaveBeenCalled();
                },
                { timeout: 200 },
            );
        });

        it("should clear game state on restart", async () => {
            const user = userEvent.setup();
            const clearGameStateSpy = vi.spyOn(storage, "clearGameState");

            render(<App />);

            await waitFor(() => {
                expect(screen.queryByText(/Score:/i)).toBeInTheDocument();
            });

            EventBus.emit("game-over");

            await waitFor(() => {
                expect(screen.getByText(/Game Over/i)).toBeInTheDocument();
            });

            const restartButton = screen.getByText(/Restart/i);
            await user.click(restartButton);

            expect(clearGameStateSpy).toHaveBeenCalled();
        });
    });
});
