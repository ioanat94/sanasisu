import { Game } from "../../scenes/Game";

class EnemySprite extends Phaser.GameObjects.Sprite {
    private static readonly COLUMNS = 8;
    private static readonly FRAME_COUNT = 4;

    private static readonly ENEMY_ANIMATIONS = {
        goblin: { idle: 0, hit: 6, death: 7 },
        hobgoblin: { idle: 0, hit: 6, death: 7 },
        golem: { idle: 0, hit: 8, death: 9 },
        slime: { idle: 1, hit: 11, death: 12 },
        bandit: { idle: 1, hit: 7, death: 8 },
        orc: { idle: 0, hit: 6, death: 7 },
        demon: { idle: 1, hit: 7, death: 8 },
        devil: { idle: 1, hit: 7, death: 8 },
        dinosaur: { idle: 0, hit: 8, death: 9 },
        satyr: { idle: 0, hit: 6, death: 7 },
        thief: { idle: 1, hit: 8, death: 9 },
        troll: { idle: 0, hit: 7, death: 8 },
    };

    private maxHealth: number = 3;
    private currentHealth: number = 3;
    private hearts: Phaser.GameObjects.Image[] = [];
    private heartX: number;
    private heartY: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
    ) {
        super(scene, x, y, texture, frame);

        this.setScale(8);
        this.setFlipX(true);
        this.heartX = x;
        this.heartY = y - 100;

        const animConfig =
            EnemySprite.ENEMY_ANIMATIONS[
                texture as keyof typeof EnemySprite.ENEMY_ANIMATIONS
            ];

        if (!animConfig) {
            console.error(`No animation config found for enemy: ${texture}`);
            return;
        }

        const getFrameRange = (row: number) => ({
            start: row * EnemySprite.COLUMNS,
            end: row * EnemySprite.COLUMNS + EnemySprite.FRAME_COUNT - 1,
        });

        this.anims.create({
            key: `${texture}-idle`,
            frames: this.anims.generateFrameNumbers(
                texture,
                getFrameRange(animConfig.idle),
            ),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: `${texture}-hit`,
            frames: this.anims.generateFrameNumbers(
                texture,
                getFrameRange(animConfig.hit),
            ),
            frameRate: 8,
        });

        this.anims.create({
            key: `${texture}-death`,
            frames: this.anims.generateFrameNumbers(
                texture,
                getFrameRange(animConfig.death),
            ),
            frameRate: 8,
        });

        this.play(`${texture}-idle`);

        scene.add.existing(this);

        this.updateHearts();
    }

    private updateHearts() {
        this.hearts.forEach((heart) => heart.destroy());
        this.hearts = [];

        const heartSpacing = 75;
        const startX = this.heartX - heartSpacing;

        for (let i = 0; i < this.maxHealth; i++) {
            const heartTexture =
                i < this.currentHealth ? "heart_full" : "heart_empty";
            const heart = this.scene.add
                .image(startX + i * heartSpacing, this.heartY, heartTexture)
                .setScale(8);
            this.hearts.push(heart);
        }
    }

    takeDamage(amount: number = 1) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.updateHearts();

        if (this.currentHealth > 0) {
            this.playHit();
        } else {
            this.playDeath();

            const texture = this.texture.key;

            this.once(`animationcomplete-${texture}-death`, () => {
                const gameScene = this.scene as Game;
                if (gameScene.spawnNewEnemy) {
                    gameScene.spawnNewEnemy();
                } else {
                    console.error("spawnNewEnemy method not found on scene");
                }
            });
        }
    }

    public getHealth(): number {
        return this.currentHealth;
    }

    public setHealth(health: number): void {
        this.currentHealth = Math.max(0, Math.min(health, this.maxHealth));
        this.updateHearts();
    }

    public getTexture(): string {
        return this.texture.key;
    }

    playHit() {
        const texture = this.texture.key;
        this.play(`${texture}-hit`);
        this.once(`animationcomplete-${texture}-hit`, () => {
            this.play(`${texture}-idle`);
        });

        setTimeout(() => {
            const hitSfx = this.scene.sound.add("enemyHit", {
                loop: false,
                volume: 1,
            });
            hitSfx.play();
        }, 200);
    }

    playDeath() {
        const deathSfx = this.scene.sound.add("enemyDeath", {
            loop: false,
            volume: 1,
        });
        deathSfx.play();

        const texture = this.texture.key;
        this.play(`${texture}-death`);
    }

    static getRandomEnemy(
        scene: Phaser.Scene,
        x: number,
        y: number,
    ): EnemySprite {
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
        const randomTexture = Phaser.Utils.Array.GetRandom(enemies);
        return new EnemySprite(scene, x, y, randomTexture);
    }

    static createEnemy(
        scene: Phaser.Scene,
        x: number,
        y: number,
        textureName: string,
    ): EnemySprite {
        return new EnemySprite(scene, x, y, textureName);
    }
}

export { EnemySprite };
