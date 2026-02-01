import { EnemySprite } from "../objects/sprites/Enemy";
import { EventBus } from "../EventBus";
import { LancelotSprite } from "../objects/sprites/Lancelot";
import { Scene } from "phaser";
import { WeaponSprite } from "../objects/sprites/Weapon";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    public lancelot: LancelotSprite;
    public enemy: EnemySprite;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.cameras.main.setBackgroundColor(0x87ceeb);

        const tileSize = 16;
        const scale = 8;
        const scaledTileSize = tileSize * scale;
        const groundY = this.cameras.main.height - scaledTileSize;

        for (let i = 0; i < 10; i++) {
            const frameIndex = 11 + i;
            const tile = this.add.image(
                i * scaledTileSize,
                groundY,
                "ground",
                frameIndex,
            );
            tile.setOrigin(0, 0);
            tile.setScale(scale);
            tile.setDepth(-1);
        }

        this.lancelot = new LancelotSprite(this, 200, 550, "lancelot");
        const lancelotWeapon = new WeaponSprite(this, 330, 550, "excalibur");
        this.enemy = EnemySprite.getRandomEnemy(this, 860, 550);
        const enemyWeapon = new WeaponSprite(this, 730, 550, "pickaxe");

        this.add.existing(this.lancelot);
        this.add.existing(lancelotWeapon);
        this.add.existing(this.enemy);
        this.add.existing(enemyWeapon);

        EventBus.emit("current-scene-ready", this);
    }

    public spawnNewEnemy() {
        // Fade out and destroy current enemy
        this.tweens.add({
            targets: [this.enemy],
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.enemy.destroy();

                this.enemy = EnemySprite.getRandomEnemy(this, 860, 550);

                this.add.existing(this.enemy);

                this.enemy.setAlpha(0);

                this.tweens.add({
                    targets: [this.enemy],
                    alpha: 1,
                    duration: 500,
                });
            },
        });
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

