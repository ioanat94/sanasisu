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
    public lancelotWeapon: WeaponSprite;
    public enemyWeapon: WeaponSprite;
    private soundButton: Phaser.GameObjects.Image;
    private helpButton: Phaser.GameObjects.Image;
    private isMuted: boolean = false;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;

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
        this.lancelotWeapon = new WeaponSprite(this, 330, 550, "excalibur");
        this.enemy = EnemySprite.getRandomEnemy(this, 860, 550);
        this.enemyWeapon = new WeaponSprite(this, 730, 550, "pickaxe");

        this.add.existing(this.lancelot);
        this.add.existing(this.lancelotWeapon);
        this.add.existing(this.enemy);
        this.add.existing(this.enemyWeapon);

        this.soundButton = this.add.image(40, 40, "sound_on");
        this.soundButton.setScale(4);
        this.soundButton.setInteractive({ useHandCursor: true });
        this.soundButton.setDepth(100);

        this.soundButton.on("pointerdown", () => {
            this.toggleSound();
        });

        this.helpButton = this.add.image(100, 40, "help");
        this.helpButton.setScale(4);
        this.helpButton.setInteractive({ useHandCursor: true });
        this.helpButton.setDepth(100);

        this.helpButton.on("pointerdown", () => {
            EventBus.emit("show-help");
        });

        EventBus.emit("current-scene-ready", this);
    }

    public spawnNewEnemy() {
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

    private toggleSound() {
        this.isMuted = !this.isMuted;
        this.sound.mute = this.isMuted;

        if (this.isMuted) {
            this.soundButton.setTexture("sound_off");
        } else {
            this.soundButton.setTexture("sound_on");
        }
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

