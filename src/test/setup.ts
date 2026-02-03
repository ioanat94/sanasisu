import "@testing-library/jest-dom/vitest";

import { afterEach, vi } from "vitest";

import { cleanup } from "@testing-library/react";

afterEach(() => {
    cleanup();
});

const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

global.localStorage = localStorageMock as Storage;

global.Phaser = {
    Utils: {
        Array: {
            GetRandom: (arr: any[]) =>
                arr[Math.floor(Math.random() * arr.length)],
        },
    },
    GameObjects: {
        Sprite: class {
            scene: any;
            x: number;
            y: number;
            texture: any;
            anims: any;
            constructor(scene: any, x: number, y: number, texture: string) {
                this.scene = scene;
                this.x = x;
                this.y = y;
                this.texture = { key: texture };
                this.anims = {
                    create: vi.fn(),
                    generateFrameNumbers: vi.fn(() => []),
                    play: vi.fn(),
                };
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
            scene: any;
            x: number;
            y: number;
            constructor(scene: any, x: number, y: number) {
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
    Scene: class {
        add = {
            existing: vi.fn(),
            image: vi.fn(() => ({
                setScale: vi.fn().mockReturnThis(),
                setOrigin: vi.fn().mockReturnThis(),
                setDepth: vi.fn().mockReturnThis(),
                setInteractive: vi.fn().mockReturnThis(),
                destroy: vi.fn(),
            })),
        };
        sound = {
            add: vi.fn(() => ({
                play: vi.fn(),
                stop: vi.fn(),
            })),
            mute: false,
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
    },
    Events: {
        EventEmitter: class {
            events: Map<string, Function[]> = new Map();
            on(event: string, fn: Function) {
                if (!this.events.has(event)) {
                    this.events.set(event, []);
                }
                this.events.get(event)!.push(fn);
            }
            emit(event: string, ...args: any[]) {
                if (this.events.has(event)) {
                    this.events.get(event)!.forEach((fn) => fn(...args));
                }
            }
            off(event: string, fn?: Function) {
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
        },
    },
} as any;
