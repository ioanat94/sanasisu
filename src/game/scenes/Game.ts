import { EnemySprite } from "../objects/sprites/Enemy";
import { EventBus } from "../EventBus";
import { LancelotSprite } from "../objects/sprites/Lancelot";
import { Scene } from "phaser";
import { WeaponSprite } from "../objects/sprites/Weapon";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

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

        const lancelot = new LancelotSprite(this, 200, 550, "lancelot");
        const lancelotWeapon = new WeaponSprite(this, 330, 550, "excalibur");
        const enemy = EnemySprite.getRandomEnemy(this, 860, 550);
        const enemyWeapon = new WeaponSprite(this, 730, 550, "pickaxe");

        this.add.existing(lancelot);
        this.add.existing(lancelotWeapon);
        this.add.existing(enemy);
        this.add.existing(enemyWeapon);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

