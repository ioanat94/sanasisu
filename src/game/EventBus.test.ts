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
}));

import { EventBus } from "./EventBus";

describe("EventBus.ts", () => {
    beforeEach(() => {
        // Clear all event listeners before each test
        // EventBus uses Phaser's EventEmitter which manages its own events
    });

    describe("Event Emission", () => {
        it("should emit events", () => {
            const listener = vi.fn();

            EventBus.on("test-event", listener);
            EventBus.emit("test-event");

            expect(listener).toHaveBeenCalledTimes(1);
        });

        it("should pass arguments to event listeners", () => {
            const listener = vi.fn();

            EventBus.on("test-event", listener);
            EventBus.emit("test-event", "arg1", "arg2", 123);

            expect(listener).toHaveBeenCalledWith("arg1", "arg2", 123);
        });

        it("should emit to multiple listeners", () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            const listener3 = vi.fn();

            EventBus.on("test-event", listener1);
            EventBus.on("test-event", listener2);
            EventBus.on("test-event", listener3);

            EventBus.emit("test-event");

            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
            expect(listener3).toHaveBeenCalledTimes(1);
        });

        it("should handle events with no listeners", () => {
            expect(() => EventBus.emit("non-existent-event")).not.toThrow();
        });
    });

    describe("Event Subscription", () => {
        it("should register event listeners", () => {
            const listener = vi.fn();

            EventBus.on("test-event", listener);
            EventBus.emit("test-event");

            expect(listener).toHaveBeenCalled();
        });

        it("should handle multiple events", () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();

            EventBus.on("event1", listener1);
            EventBus.on("event2", listener2);

            EventBus.emit("event1");
            EventBus.emit("event2");

            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
        });
    });

    describe("Event Unsubscription", () => {
        it("should remove specific listener", () => {
            const listener = vi.fn();

            EventBus.on("test-event", listener);
            EventBus.off("test-event", listener);
            EventBus.emit("test-event");

            expect(listener).not.toHaveBeenCalled();
        });

        it("should remove all listeners for an event", () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();

            EventBus.on("test-event", listener1);
            EventBus.on("test-event", listener2);
            EventBus.off("test-event");
            EventBus.emit("test-event");

            expect(listener1).not.toHaveBeenCalled();
            expect(listener2).not.toHaveBeenCalled();
        });

        it("should only remove specified listener, not others", () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();

            EventBus.on("test-event", listener1);
            EventBus.on("test-event", listener2);
            EventBus.off("test-event", listener1);
            EventBus.emit("test-event");

            expect(listener1).not.toHaveBeenCalled();
            expect(listener2).toHaveBeenCalledTimes(1);
        });
    });

    describe("Game Events", () => {
        it("should handle game-over event", () => {
            const listener = vi.fn();

            EventBus.on("game-over", listener);
            EventBus.emit("game-over");

            expect(listener).toHaveBeenCalled();
        });

        it("should handle show-help event", () => {
            const listener = vi.fn();

            EventBus.on("show-help", listener);
            EventBus.emit("show-help");

            expect(listener).toHaveBeenCalled();
        });

        it("should handle enemy-spawned event", () => {
            const listener = vi.fn();

            EventBus.on("enemy-spawned", listener);
            EventBus.emit("enemy-spawned");

            expect(listener).toHaveBeenCalled();
        });

        it("should handle sound-toggled event", () => {
            const listener = vi.fn();

            EventBus.on("sound-toggled", listener);
            EventBus.emit("sound-toggled");

            expect(listener).toHaveBeenCalled();
        });

        it("should handle current-scene-ready event", () => {
            const listener = vi.fn();
            const mockScene = { scene: { key: "Game" } };

            EventBus.on("current-scene-ready", listener);
            EventBus.emit("current-scene-ready", mockScene);

            expect(listener).toHaveBeenCalledWith(mockScene);
        });
    });
});
