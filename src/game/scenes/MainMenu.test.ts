import { beforeEach, describe, expect, it, vi } from "vitest";

type EventListener = (...args: unknown[]) => void;

vi.mock("phaser", () => ({
    Events: {
        EventEmitter: class {
            events = new Map<string, EventListener[]>();
            on(event: string, fn: EventListener) {
                if (!this.events.has(event)) {
                    this.events.set(event, []);
                }
                this.events.get(event)!.push(fn);
            }
            emit(event: string, ...args: unknown[]) {
                if (this.events.has(event)) {
                    this.events
                        .get(event)!
                        .forEach((fn: EventListener) => fn(...args));
                }
            }
            off(event: string, fn?: EventListener) {
                if (fn) {
                    const fns = this.events.get(event) || [];
                    this.events.set(
                        event,
                        fns.filter((f: EventListener) => f !== fn),
                    );
                } else {
                    this.events.delete(event);
                }
            }
        },
    },
    Scene: class {
        scene = { key: "MainMenu" };
        add = {
            text: vi.fn(() => ({
                setOrigin: vi.fn().mockReturnThis(),
            })),
            rectangle: vi.fn(() => ({
                setStrokeStyle: vi.fn().mockReturnThis(),
                setOrigin: vi.fn().mockReturnThis(),
                setInteractive: vi.fn().mockReturnThis(),
                on: vi.fn(),
            })),
        };
        sound = {
            add: vi.fn(() => ({
                play: vi.fn(),
                stop: vi.fn(),
            })),
        };
        tweens = {
            add: vi.fn(),
        };
        cameras = {
            main: {
                centerX: 512,
                centerY: 384,
            },
        };
    },
}));

import { EventBus } from "../EventBus";
import { MainMenu } from "./MainMenu";

describe("MainMenu.ts", () => {
    let scene: MainMenu;

    beforeEach(() => {
        vi.clearAllMocks();
        scene = new MainMenu();
    });

    describe("Scene Setup", () => {
        it("should have correct scene key", () => {
            expect(scene.scene.key).toBe("MainMenu");
        });

        it("should create title text", () => {
            const addTextSpy = vi.spyOn(scene.add, "text");

            scene.create();

            expect(addTextSpy).toHaveBeenCalledWith(
                expect.any(Number),
                100,
                "Sanasisu",
                expect.objectContaining({
                    fontFamily: "BoldPixels",
                    fontSize: "144px",
                }),
            );
        });

        it("should create start button", () => {
            const addTextSpy = vi.spyOn(scene.add, "text");

            scene.create();

            const startButtonCall = addTextSpy.mock.calls.find(
                (call) => call[2] === "Start",
            );

            expect(startButtonCall).toBeDefined();
        });

        it("should create button background", () => {
            const addRectangleSpy = vi.spyOn(scene.add, "rectangle");

            scene.create();

            expect(addRectangleSpy).toHaveBeenCalled();
        });
    });

    describe("Title Animation", () => {
        it("should create pulsing animation for title", () => {
            const addTweenSpy = vi.spyOn(scene.tweens, "add");

            scene.create();

            expect(addTweenSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    targets: expect.anything(),
                    yoyo: true,
                    repeat: -1,
                }),
            );
        });
    });

    describe("Scene Communication", () => {
        it("should emit current-scene-ready event", () => {
            const emitSpy = vi.spyOn(EventBus, "emit");

            scene.create();

            expect(emitSpy).toHaveBeenCalledWith("current-scene-ready", scene);
        });
    });

    describe("Button Interactions", () => {
        it("should make button interactive", () => {
            const addRectangleSpy = vi.spyOn(scene.add, "rectangle");
            scene.create();

            expect(addRectangleSpy).toHaveBeenCalled();
        });
    });
});
