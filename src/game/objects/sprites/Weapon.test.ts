import { beforeEach, describe, expect, it, vi } from "vitest";

import { WeaponSprite } from "../../objects/sprites/Weapon";

describe("Weapon.ts", () => {
    let mockScene: Phaser.Scene;

    beforeEach(() => {
        vi.clearAllMocks();

        mockScene = {
            add: {
                existing: vi.fn(),
            },
            sound: {
                add: vi.fn(() => ({
                    play: vi.fn(),
                })) as unknown as Phaser.Sound.BaseSoundManager["add"],
            },
            anims: {
                create: vi.fn(),
                generateFrameNumbers: vi.fn(),
            } as unknown as Phaser.Animations.AnimationManager,
            tweens: {
                add: vi.fn(() => ({
                    pause: vi.fn(),
                    resume: vi.fn(),
                    stop: vi.fn(),
                })),
            },
        } as unknown as Phaser.Scene;
    });

    describe("Constructor", () => {
        it("should create a weapon sprite", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            expect(weapon).toBeDefined();
            expect(weapon.x).toBe(100);
            expect(weapon.y).toBe(200);
        });

        it("should set scale to 8", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            expect(weapon.setScale).toHaveBeenCalledWith(8);
        });

        it("should create attack animation", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            expect(weapon.anims.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    key: "attack",
                }),
            );
        });

        it("should add itself to the scene", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            expect(mockScene.add.existing).toHaveBeenCalledWith(weapon);
        });

        it("should create floating tween animation", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            expect(mockScene.tweens.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    targets: weapon,
                    y: 210,
                    duration: 1000,
                    ease: "Sine.easeInOut",
                    yoyo: true,
                    repeat: -1,
                }),
            );
        });

        it("should set initial frame to 0", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            expect(weapon.setFrame).toHaveBeenCalledWith(0);
        });
    });

    describe("Weapon Types", () => {
        it("should support excalibur weapon", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            expect(weapon.texture.key).toBe("excalibur");
        });

        it("should support pickaxe weapon", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "pickaxe");

            expect(weapon.texture.key).toBe("pickaxe");
        });

        it("should log error for unsupported weapon type", () => {
            const consoleSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});

            new WeaponSprite(
                mockScene,
                100,
                200,
                "invalid_weapon" as unknown as string,
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                "No animation config found for weapon: invalid_weapon",
            );

            consoleSpy.mockRestore();
        });
    });

    describe("Attack Animation", () => {
        it("should pause float tween during attack", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");
            const mockTween = vi.mocked(mockScene.tweens.add).mock.results[0]
                .value;

            weapon.playAttack();

            expect(mockTween.pause).toHaveBeenCalled();
        });

        it("should play attack animation", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");
            const playSpy = vi.spyOn(weapon, "play");

            weapon.playAttack();

            expect(playSpy).toHaveBeenCalledWith("attack");
        });

        it("should play attack sound", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");

            weapon.playAttack();

            expect(mockScene.sound.add).toHaveBeenCalledWith(
                "excaliburAttack",
                {
                    loop: false,
                    volume: 0.5,
                },
            );
        });

        it("should play correct sound for different weapons", () => {
            const pickaxe = new WeaponSprite(mockScene, 100, 200, "pickaxe");

            pickaxe.playAttack();

            expect(mockScene.sound.add).toHaveBeenCalledWith("pickaxeAttack", {
                loop: false,
                volume: 0.5,
            });
        });

        it("should resume float tween after attack completes", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");
            const mockTween = vi.mocked(mockScene.tweens.add).mock.results[0]
                .value;

            weapon.playAttack();

            const onceCalls = (
                weapon.once as unknown as ReturnType<typeof vi.fn>
            ).mock.calls;
            const attackCallback = onceCalls.find(
                (call: unknown[]) => call[0] === "animationcomplete-attack",
            ) as [string, () => void] | undefined;
            if (attackCallback) {
                attackCallback[1]();
            }

            expect(mockTween.resume).toHaveBeenCalled();
        });

        it("should reset to frame 0 after attack completes", () => {
            const weapon = new WeaponSprite(mockScene, 100, 200, "excalibur");
            const setFrameSpy = vi.spyOn(weapon, "setFrame");

            weapon.playAttack();

            const onceCalls = (
                weapon.once as unknown as ReturnType<typeof vi.fn>
            ).mock.calls;
            const attackCallback = onceCalls.find(
                (call: unknown[]) => call[0] === "animationcomplete-attack",
            ) as [string, () => void] | undefined;
            if (attackCallback) {
                attackCallback[1]();
            }

            expect(setFrameSpy).toHaveBeenCalledWith(0);
        });
    });

    describe("Float Animation", () => {
        it("should create continuous floating effect", () => {
            new WeaponSprite(mockScene, 100, 200, "excalibur");

            const tweenConfig = vi.mocked(mockScene.tweens.add).mock
                .calls[0][0] as Phaser.Types.Tweens.TweenBuilderConfig;

            expect(tweenConfig.repeat).toBe(-1);
            expect(tweenConfig.yoyo).toBe(true);
        });

        it("should float 10 pixels down and back", () => {
            new WeaponSprite(mockScene, 100, 200, "excalibur");

            const tweenConfig = vi.mocked(mockScene.tweens.add).mock
                .calls[0][0] as Phaser.Types.Tweens.TweenBuilderConfig;

            expect(tweenConfig.y).toBe(210);
        });
    });
});
