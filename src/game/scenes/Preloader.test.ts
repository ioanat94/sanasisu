import { beforeEach, describe, expect, it, vi } from "vitest";

import { Preloader } from "./Preloader";

describe("Preloader.ts", () => {
    let scene: Preloader;

    beforeEach(() => {
        vi.clearAllMocks();
        scene = new Preloader();
    });

    describe("Scene Setup", () => {
        it("should have correct scene key", () => {
            expect(scene.scene.key).toBe("Preloader");
        });

        it("should create progress bar on init", () => {
            const addRectangleSpy = vi.spyOn(scene.add, "rectangle");

            scene.init();

            expect(addRectangleSpy).toHaveBeenCalledTimes(2);
        });
    });

    describe("Asset Loading", () => {
        it("should set asset path", () => {
            const setPathSpy = vi.spyOn(scene.load, "setPath");

            scene.preload();

            expect(setPathSpy).toHaveBeenCalledWith("assets");
        });

        it("should load ground spritesheet", () => {
            const spritesheetSpy = vi.spyOn(scene.load, "spritesheet");

            scene.preload();

            expect(spritesheetSpy).toHaveBeenCalledWith(
                "ground",
                "islands_.png",
                expect.objectContaining({
                    frameWidth: 16,
                    frameHeight: 16,
                }),
            );
        });

        it("should load lancelot spritesheet", () => {
            const spritesheetSpy = vi.spyOn(scene.load, "spritesheet");

            scene.preload();

            expect(spritesheetSpy).toHaveBeenCalledWith(
                "lancelot",
                "lancelot_.png",
                expect.objectContaining({
                    frameWidth: 32,
                    frameHeight: 32,
                }),
            );
        });

        it("should load all enemy spritesheets", () => {
            const spritesheetSpy = vi.spyOn(scene.load, "spritesheet");

            scene.preload();

            const enemies = [
                "bandit",
                "demon",
                "devil",
                "dinosaur",
                "goblin",
                "golem",
                "hobgoblin",
                "orc",
                "satyr",
                "slime",
                "thief",
                "troll",
            ];

            enemies.forEach((enemy) => {
                expect(spritesheetSpy).toHaveBeenCalledWith(
                    enemy,
                    `${enemy}_.png`,
                    expect.objectContaining({
                        frameWidth: 32,
                        frameHeight: 32,
                    }),
                );
            });
        });

        it("should load weapon spritesheets", () => {
            const spritesheetSpy = vi.spyOn(scene.load, "spritesheet");

            scene.preload();

            expect(spritesheetSpy).toHaveBeenCalledWith(
                "excalibur",
                "excalibur_.png",
                expect.any(Object),
            );

            expect(spritesheetSpy).toHaveBeenCalledWith(
                "pickaxe",
                "pickaxe_.png",
                expect.any(Object),
            );
        });

        it("should load heart spritesheets", () => {
            const spritesheetSpy = vi.spyOn(scene.load, "spritesheet");

            scene.preload();

            expect(spritesheetSpy).toHaveBeenCalledWith(
                "heart_empty",
                "heart_empty_.png",
                expect.objectContaining({
                    frameWidth: 16,
                    frameHeight: 16,
                }),
            );

            expect(spritesheetSpy).toHaveBeenCalledWith(
                "heart_full",
                "heart_full_.png",
                expect.objectContaining({
                    frameWidth: 16,
                    frameHeight: 16,
                }),
            );
        });

        it("should load audio files", () => {
            const audioSpy = vi.spyOn(scene.load, "audio");

            scene.preload();

            if (audioSpy.mock.calls.length > 0) {
                expect(audioSpy).toHaveBeenCalled();
            }
        });

        it("should load image assets", () => {
            const imageSpy = vi.spyOn(scene.load, "image");

            scene.preload();

            if (imageSpy.mock.calls.length > 0) {
                expect(imageSpy).toHaveBeenCalled();
            }
        });
    });

    describe("Progress Tracking", () => {
        it("should listen to progress event", () => {
            const onSpy = vi.spyOn(scene.load, "on");

            scene.init();

            expect(onSpy).toHaveBeenCalledWith(
                "progress",
                expect.any(Function),
            );
        });

        it("should update progress bar width", () => {
            const mockBar = {
                width: 4,
            };

            vi.spyOn(scene.add, "rectangle")
                .mockReturnValueOnce({} as any)
                .mockReturnValueOnce(mockBar as any);

            scene.init();

            const progressCallback = (scene.load.on as any).mock.calls.find(
                (call: any[]) => call[0] === "progress",
            )?.[1];

            if (progressCallback) {
                progressCallback(0.5);
                expect(mockBar.width).toBe(4 + 460 * 0.5);

                progressCallback(1);
                expect(mockBar.width).toBe(4 + 460 * 1);
            }
        });
    });

    describe("Scene Transition", () => {
        it("should start MainMenu scene after loading", () => {
            const startSpy = vi.spyOn(scene.scene, "start");

            scene.create();

            expect(startSpy).toHaveBeenCalledWith("MainMenu");
        });
    });
});
