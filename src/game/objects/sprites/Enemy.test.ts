import { beforeEach, describe, expect, it, vi } from "vitest";

import { EnemySprite } from "../../objects/sprites/Enemy";

describe("Enemy.ts", () => {
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
        it("should create an enemy sprite", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            expect(enemy).toBeDefined();
            expect(enemy.x).toBe(100);
            expect(enemy.y).toBe(200);
        });

        it("should set scale to 8", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            expect(enemy.setScale).toHaveBeenCalledWith(8);
        });

        it("should flip the sprite horizontally", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            expect(enemy.setFlipX).toHaveBeenCalledWith(true);
        });

        it("should create idle, hit, and death animations", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            expect(enemy.anims.create).toHaveBeenCalledTimes(3);
        });

        it("should add itself to the scene", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            expect(mockScene.add.existing).toHaveBeenCalledWith(enemy);
        });
    });

    describe("Health Management", () => {
        it("should start with 3 health", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            expect(enemy.getHealth()).toBe(3);
        });

        it("should reduce health when taking damage", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            enemy.takeDamage(1);
            expect(enemy.getHealth()).toBe(2);

            enemy.takeDamage(1);
            expect(enemy.getHealth()).toBe(1);
        });

        it("should not go below 0 health", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            enemy.takeDamage(5);
            expect(enemy.getHealth()).toBe(0);
        });

        it("should allow setting health", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            enemy.setHealth(2);
            expect(enemy.getHealth()).toBe(2);
        });

        it("should clamp health between 0 and max", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            enemy.setHealth(10);
            expect(enemy.getHealth()).toBe(3);

            enemy.setHealth(-5);
            expect(enemy.getHealth()).toBe(0);
        });
    });

    describe("Animations", () => {
        it("should play hit animation when damaged but alive", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");
            const playSpy = vi.spyOn(enemy, "play");

            enemy.takeDamage(1);

            expect(playSpy).toHaveBeenCalledWith("goblin-hit");
        });

        it("should play death animation when health reaches 0", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");
            const playSpy = vi.spyOn(enemy, "play");

            enemy.takeDamage(3);

            expect(playSpy).toHaveBeenCalledWith("goblin-death");
        });

        it("should play hit sound when taking damage", () => {
            vi.useFakeTimers();
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            enemy.playHit();
            vi.advanceTimersByTime(200);

            expect(mockScene.sound.add).toHaveBeenCalledWith("enemyHit", {
                loop: false,
                volume: 1,
            });

            vi.useRealTimers();
        });

        it("should play death sound when dying", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            enemy.playDeath();

            expect(mockScene.sound.add).toHaveBeenCalledWith("enemyDeath", {
                loop: false,
                volume: 1,
            });
        });
    });

    describe("Texture", () => {
        it("should return correct texture key", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            expect(enemy.getTexture()).toBe("goblin");
        });

        it("should support all enemy types", () => {
            const enemyTypes = [
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

            enemyTypes.forEach((type) => {
                const enemy = new EnemySprite(mockScene, 100, 200, type);
                expect(enemy.getTexture()).toBe(type);
            });
        });
    });

    describe("Static Methods", () => {
        it("should create enemy with specific texture using createEnemy", () => {
            const enemy = EnemySprite.createEnemy(mockScene, 100, 200, "troll");

            expect(enemy).toBeInstanceOf(EnemySprite);
            expect(enemy.getTexture()).toBe("troll");
        });

        it("should create random enemy using getRandomEnemy", () => {
            const enemy = EnemySprite.getRandomEnemy(mockScene, 100, 200);

            expect(enemy).toBeInstanceOf(EnemySprite);

            const validEnemies = [
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

            expect(validEnemies).toContain(enemy.getTexture());
        });
    });

    describe("Hearts Display", () => {
        it("should create hearts for health display", () => {
            new EnemySprite(mockScene, 100, 200, "goblin");

            expect(mockScene.add.image).toHaveBeenCalledTimes(3);
        });

        it("should update hearts when health changes", () => {
            const enemy = new EnemySprite(mockScene, 100, 200, "goblin");

            mockScene.add.image.mockClear();

            enemy.takeDamage(1);

            expect(mockScene.add.image).toHaveBeenCalledTimes(3);
        });
    });
});
