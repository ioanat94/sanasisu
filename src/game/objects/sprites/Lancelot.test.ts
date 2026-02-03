import { beforeEach, describe, expect, it, vi } from "vitest";

import { EventBus } from "../../EventBus";
import { LancelotSprite } from "../../objects/sprites/Lancelot";

describe("Lancelot.ts", () => {
    let mockScene: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockScene = {
            add: {
                existing: vi.fn(),
                image: vi.fn(() => ({
                    setScale: vi.fn().mockReturnThis(),
                    destroy: vi.fn(),
                })),
            },
            sound: {
                add: vi.fn(() => ({
                    play: vi.fn(),
                })),
            },
            anims: {
                create: vi.fn(),
                generateFrameNumbers: vi.fn(),
            },
        };
    });

    describe("Constructor", () => {
        it("should create a lancelot sprite", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            expect(lancelot).toBeDefined();
            expect(lancelot.x).toBe(100);
            expect(lancelot.y).toBe(200);
        });

        it("should set scale to 8", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            expect(lancelot.setScale).toHaveBeenCalledWith(8);
        });

        it("should create idle, hit, and death animations", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            expect(lancelot.anims.create).toHaveBeenCalledTimes(3);
        });

        it("should add itself to the scene", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            expect(mockScene.add.existing).toHaveBeenCalledWith(lancelot);
        });

        it("should start playing idle animation", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            expect(lancelot.play).toHaveBeenCalledWith("idle");
        });
    });

    describe("Health Management", () => {
        it("should start with 3 health", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            expect(lancelot.getHealth()).toBe(3);
        });

        it("should reduce health when taking damage", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            lancelot.takeDamage(1);
            expect(lancelot.getHealth()).toBe(2);

            lancelot.takeDamage(1);
            expect(lancelot.getHealth()).toBe(1);
        });

        it("should not go below 0 health", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            lancelot.takeDamage(5);
            expect(lancelot.getHealth()).toBe(0);
        });

        it("should allow setting health", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            lancelot.setHealth(2);
            expect(lancelot.getHealth()).toBe(2);
        });

        it("should clamp health between 0 and max", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            lancelot.setHealth(10);
            expect(lancelot.getHealth()).toBe(3);

            lancelot.setHealth(-5);
            expect(lancelot.getHealth()).toBe(0);
        });
    });

    describe("Animations", () => {
        it("should play hit animation when damaged but alive", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );
            const playSpy = vi.spyOn(lancelot, "play");

            lancelot.takeDamage(1);

            expect(playSpy).toHaveBeenCalledWith("hit");
        });

        it("should play death animation when health reaches 0", () => {
            vi.useFakeTimers();
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );
            const playSpy = vi.spyOn(lancelot, "play");

            lancelot.takeDamage(3);
            vi.advanceTimersByTime(400);

            expect(playSpy).toHaveBeenCalledWith("death");

            vi.useRealTimers();
        });

        it("should play hit sound when taking damage", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            lancelot.playHit();

            expect(mockScene.sound.add).toHaveBeenCalledWith("lancelotHit", {
                loop: false,
                volume: 1,
            });
        });

        it("should play death sound when dying", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            lancelot.playDeath();

            expect(mockScene.sound.add).toHaveBeenCalledWith("lancelotDeath", {
                loop: false,
                volume: 1,
            });
        });
    });

    describe("Game Over", () => {
        it("should emit game-over event when death animation completes", () => {
            vi.useFakeTimers();
            const emitSpy = vi.spyOn(EventBus, "emit");
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            lancelot.takeDamage(3);
            vi.advanceTimersByTime(400);

            const onceCalls = (lancelot.once as any).mock.calls;
            const deathCallback = onceCalls.find(
                (call: any[]) => call[0] === "animationcomplete-death",
            );
            if (deathCallback) {
                deathCallback[1]();
            }

            expect(emitSpy).toHaveBeenCalledWith("game-over");

            vi.useRealTimers();
        });
    });

    describe("Hearts Display", () => {
        it("should create hearts for health display", () => {
            new LancelotSprite(mockScene, 100, 200, "lancelot");

            expect(mockScene.add.image).toHaveBeenCalledTimes(3);
        });

        it("should update hearts when health changes", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            mockScene.add.image.mockClear();

            lancelot.takeDamage(1);

            expect(mockScene.add.image).toHaveBeenCalledTimes(3);
        });

        it("should display correct heart textures based on health", () => {
            const lancelot = new LancelotSprite(
                mockScene,
                100,
                200,
                "lancelot",
            );

            mockScene.add.image.mockClear();
            lancelot.setHealth(2);

            const calls = mockScene.add.image.mock.calls;

            expect(calls[0][2]).toBe("heart_full");
            expect(calls[1][2]).toBe("heart_full");
            expect(calls[2][2]).toBe("heart_empty");
        });
    });
});
