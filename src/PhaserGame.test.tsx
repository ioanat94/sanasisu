import { beforeEach, describe, expect, it, vi } from "vitest";

import { EventBus } from "./game/EventBus";
import { PhaserGame } from "./PhaserGame";
import { render } from "@testing-library/react";

vi.mock("./game/main", () => ({
    default: vi.fn(() => ({
        destroy: vi.fn(),
    })),
}));

describe("PhaserGame.tsx", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Component Lifecycle", () => {
        it("should render without crashing", () => {
            const { container } = render(<PhaserGame />);
            expect(container).toBeTruthy();
        });

        it("should create game instance on mount", () => {
            const StartGame = require("./game/main").default;
            render(<PhaserGame />);
            expect(StartGame).toHaveBeenCalledWith("game-container");
        });

        it("should only create game once", () => {
            const StartGame = require("./game/main").default;
            const { rerender } = render(<PhaserGame />);

            expect(StartGame).toHaveBeenCalledTimes(1);

            rerender(<PhaserGame />);
            expect(StartGame).toHaveBeenCalledTimes(1);
        });

        it("should destroy game on unmount", () => {
            const mockDestroy = vi.fn();
            const StartGame = require("./game/main").default;
            StartGame.mockReturnValue({ destroy: mockDestroy });

            const { unmount } = render(<PhaserGame />);
            unmount();

            expect(mockDestroy).toHaveBeenCalledWith(true);
        });
    });

    describe("Scene Communication", () => {
        it("should call currentActiveScene callback when scene is ready", async () => {
            const currentActiveSceneMock = vi.fn();
            render(<PhaserGame currentActiveScene={currentActiveSceneMock} />);

            const mockScene = { scene: { key: "TestScene" } };
            EventBus.emit("current-scene-ready", mockScene);

            expect(currentActiveSceneMock).toHaveBeenCalledWith(mockScene);
        });

        it("should clean up scene event listener on unmount", () => {
            const offSpy = vi.spyOn(EventBus, "off");
            const { unmount } = render(
                <PhaserGame currentActiveScene={vi.fn()} />,
            );

            unmount();

            expect(offSpy).toHaveBeenCalledWith(
                "current-scene-ready",
                expect.any(Function),
            );
        });
    });

    describe("Ref Forwarding", () => {
        it("should expose game and scene through ref", () => {
            const ref = { current: null };
            render(<PhaserGame ref={ref} />);

            expect(ref.current).toBeTruthy();
            expect(ref.current).toHaveProperty("game");
            expect(ref.current).toHaveProperty("scene");
        });

        it("should handle function ref", () => {
            const refFn = vi.fn();
            render(<PhaserGame ref={refFn} />);

            expect(refFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    game: expect.anything(),
                    scene: null,
                }),
            );
        });
    });
});
