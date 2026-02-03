import * as storage from "../../utils/storage";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { EventBus } from "../EventBus";
import { Game } from "./Game";

describe("Game.ts", () => {
    let mockScene: Game;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(storage, "loadGameState").mockReturnValue(null);

        mockScene = new Game();
    });

    describe("Scene Setup", () => {
        it("should have correct scene key", () => {
            expect(mockScene.scene.key).toBe("Game");
        });

        it("should load saved game state on create", () => {
            const loadSpy = vi.spyOn(storage, "loadGameState");

            mockScene.create();

            expect(loadSpy).toHaveBeenCalled();
        });

        it("should apply saved mute state", () => {
            const savedState = {
                score: 5,
                lancelotHealth: 3,
                enemyHealth: 3,
                enemySprite: "goblin",
                isMuted: true,
                currentWord: {
                    word: "test",
                    tr: "test",
                    kotous: "test",
                    case: "nom_p",
                    caseValue: "test",
                },
            };

            vi.spyOn(storage, "loadGameState").mockReturnValue(savedState);

            mockScene.create();

            expect(mockScene.isMuted).toBe(true);
        });
    });

    describe("Sound Toggle", () => {
        it("should toggle mute state", () => {
            mockScene.create();
            const initialMuted = mockScene.isMuted;

            (mockScene as unknown as { toggleSound: () => void }).toggleSound();

            expect(mockScene.isMuted).toBe(!initialMuted);
        });

        it("should emit sound-toggled event", () => {
            const emitSpy = vi.spyOn(EventBus, "emit");
            mockScene.create();

            (mockScene as unknown as { toggleSound: () => void }).toggleSound();

            expect(emitSpy).toHaveBeenCalledWith("sound-toggled");
        });

        it("should set mute state explicitly", () => {
            mockScene.create();

            mockScene.setMuted(true);
            expect(mockScene.isMuted).toBe(true);

            mockScene.setMuted(false);
            expect(mockScene.isMuted).toBe(false);
        });
    });

    describe("Enemy Spawning", () => {
        it("should emit enemy-spawned event after spawning new enemy", () => {
            const emitSpy = vi.spyOn(EventBus, "emit");
            mockScene.create();

            mockScene.tweens.add = vi.fn(
                (config: Phaser.Types.Tweens.TweenBuilderConfig) => {
                    const tween = {} as Phaser.Tweens.Tween;
                    config.onComplete?.(tween, []);
                    return tween;
                },
            );

            mockScene.spawnNewEnemy();

            expect(emitSpy).toHaveBeenCalledWith("enemy-spawned");
        });
    });

    describe("Scene Communication", () => {
        it("should emit current-scene-ready on create", () => {
            const emitSpy = vi.spyOn(EventBus, "emit");

            mockScene.create();

            expect(emitSpy).toHaveBeenCalledWith(
                "current-scene-ready",
                mockScene,
            );
        });

        it("should emit show-help when help button clicked", () => {
            const emitSpy = vi.spyOn(EventBus, "emit");
            mockScene.create();

            if (mockScene["helpButton"]) {
                const pointerdownHandler = (
                    mockScene["helpButton"].on as unknown as ReturnType<
                        typeof vi.fn
                    >
                ).mock.calls.find(
                    (call: unknown[]) => call[0] === "pointerdown",
                )?.[1] as (() => void) | undefined;

                if (pointerdownHandler) {
                    pointerdownHandler();
                    expect(emitSpy).toHaveBeenCalledWith("show-help");
                }
            }
        });
    });
});
