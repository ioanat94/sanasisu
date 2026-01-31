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
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        const lancelot = new LancelotSprite(this, 100, 600, "lancelot");
        const lancelotWeapon = new WeaponSprite(this, 170, 600, "excalibur");
        const enemy = EnemySprite.getRandomEnemy(this, 900, 600);
        const enemyWeapon = new WeaponSprite(this, 830, 600, "pickaxe");

        this.add.existing(lancelot);
        this.add.existing(lancelotWeapon);
        this.add.existing(enemy);
        this.add.existing(enemyWeapon);

        setTimeout(() => {
            enemy.playDeath();
            enemyWeapon.playAttack();
        }, 1000);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

