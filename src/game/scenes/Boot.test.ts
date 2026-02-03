import { beforeEach, describe, expect, it, vi } from "vitest";

import { Boot } from "./Boot";

describe("Boot.ts", () => {
    let scene: Boot;

    beforeEach(() => {
        vi.clearAllMocks();
        scene = new Boot();
    });

    describe("Scene Setup", () => {
        it("should have correct scene key", () => {
            expect(scene.scene.key).toBe("Boot");
        });

        it("should start Preloader scene on create", () => {
            const startSpy = vi.spyOn(scene.scene, "start");

            scene.create();

            expect(startSpy).toHaveBeenCalledWith("Preloader");
        });
    });

    describe("Preload", () => {
        it("should have preload method", () => {
            expect(typeof scene.preload).toBe("function");
        });

        it("should not crash when preload is called", () => {
            expect(() => scene.preload()).not.toThrow();
        });
    });
});
