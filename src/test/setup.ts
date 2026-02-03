import "@testing-library/jest-dom/vitest";

import { afterEach, vi } from "vitest";

import { cleanup } from "@testing-library/react";
import { createCanvas } from "canvas";

// Define Phaser mock type
type EventListener = (...args: unknown[]) => void;

// Create the Phaser mock object
const PhaserMock = {
    Scene: class {
        scene = { key: "MockScene", start: vi.fn() };
        add = {
            existing: vi.fn(),
            image: vi.fn(() => ({
                setScale: vi.fn().mockReturnThis(),
                setOrigin: vi.fn().mockReturnThis(),
                setDepth: vi.fn().mockReturnThis(),
                setInteractive: vi.fn().mockReturnThis(),
                on: vi.fn().mockReturnThis(),
                setTexture: vi.fn().mockReturnThis(),
                destroy: vi.fn(),
            })),
            rectangle: vi.fn(function (this: unknown) {
                const rect: Record<string, unknown> = {};
                rect.setStrokeStyle = vi.fn().mockReturnValue(rect);
                rect.setFillStyle = vi.fn().mockReturnValue(rect);
                rect.setSize = vi.fn().mockReturnValue(rect);
                return rect;
            }),
        };
        sound = {
            add: vi.fn(() => ({
                play: vi.fn(),
                stop: vi.fn(),
            })),
            mute: false,
        };
        load = {
            setPath: vi.fn(),
            spritesheet: vi.fn(),
            audio: vi.fn(),
            image: vi.fn(),
            font: vi.fn(),
            on: vi.fn(),
        };
        tweens = {
            add: vi.fn(() => ({
                pause: vi.fn(),
                resume: vi.fn(),
                stop: vi.fn(),
            })),
        };
        cameras = {
            main: {
                width: 1024,
                height: 768,
            },
        };
        anims = {
            create: vi.fn(),
            generateFrameNumbers: vi.fn(() => []),
        };

        constructor(key?: string) {
            if (key) {
                this.scene.key = key;
            }
        }

        preload() {}
        create() {}
    },
    Game: class {
        scene = { scenes: [], start: vi.fn(), stop: vi.fn(), key: "Game" };
        constructor() {}
        destroy = vi.fn();
    },
    AUTO: "AUTO",
    Utils: {
        Array: {
            GetRandom: <T>(arr: T[]): T =>
                arr[Math.floor(Math.random() * arr.length)],
        },
    },
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
                    this.events.get(event)!.forEach((fn) => fn(...args));
                }
            }
            off(event: string, fn?: EventListener) {
                if (fn) {
                    const fns = this.events.get(event) || [];
                    this.events.set(
                        event,
                        fns.filter((f) => f !== fn),
                    );
                } else {
                    this.events.delete(event);
                }
            }
            removeListener(event: string, fn?: EventListener) {
                this.off(event, fn);
            }
        },
    },
    GameObjects: {
        Sprite: class {
            scene: unknown;
            x: number;
            y: number;
            texture: { key: string };
            anims = {
                create: vi.fn(),
                generateFrameNumbers: vi.fn(() => []),
                play: vi.fn(),
            };
            constructor(scene: unknown, x: number, y: number, texture: string) {
                this.scene = scene;
                this.x = x;
                this.y = y;
                this.texture = { key: texture };
            }
            setScale = vi.fn().mockReturnThis();
            setFlipX = vi.fn().mockReturnThis();
            setFrame = vi.fn().mockReturnThis();
            play = vi.fn().mockReturnThis();
            on = vi.fn().mockReturnThis();
            once = vi.fn().mockReturnThis();
            destroy = vi.fn();
            setOrigin = vi.fn().mockReturnThis();
            setDepth = vi.fn().mockReturnThis();
            setAlpha = vi.fn().mockReturnThis();
        },
        Image: class {
            scene: unknown;
            x: number;
            y: number;
            constructor(scene: unknown, x: number, y: number) {
                this.scene = scene;
                this.x = x;
                this.y = y;
            }
            setScale = vi.fn().mockReturnThis();
            destroy = vi.fn();
            setOrigin = vi.fn().mockReturnThis();
            setDepth = vi.fn().mockReturnThis();
            setInteractive = vi.fn().mockReturnThis();
        },
    },
};

// Assign to global BEFORE importing any modules that use Phaser
global.Phaser = PhaserMock as unknown as typeof Phaser;

// Now mock the phaser module for ES imports
vi.mock("phaser", () => PhaserMock);

afterEach(() => {
    cleanup();
});

// Mock HTMLCanvasElement for Phaser
global.HTMLCanvasElement.prototype.getContext = function (contextId: string) {
    if (contextId === "2d" || contextId === "webgl" || contextId === "webgl2") {
        const canvas = createCanvas(800, 600);
        return canvas.getContext("2d");
    }
    return null;
} as HTMLCanvasElement["getContext"];

// jsdom provides localStorage that works with prototype mocking
