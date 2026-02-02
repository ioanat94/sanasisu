import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    title: GameObjects.Text;
    startButton: GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    create() {
        this.title = this.add.text(this.cameras.main.centerX, 100, "Sanasisu", {
            fontFamily: "BoldPixels",
            fontSize: "144px",
            color: "#3e2723",
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: "#8d6e63",
                blur: 0,
                fill: true,
            },
        });
        this.title.setOrigin(0.5, -0.75);

        this.tweens.add({
            targets: this.title,
            scale: { from: 1, to: 1.1 },
            duration: 1000,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1,
        });

        const buttonX = this.cameras.main.centerX;
        const buttonY = this.cameras.main.centerY + 100;

        const buttonBg = this.add.rectangle(
            buttonX,
            buttonY,
            200,
            60,
            0x8d6e63,
        );
        buttonBg.setStrokeStyle(4, 0x3e2723);
        buttonBg.setOrigin(0.5);
        buttonBg.setInteractive({ useHandCursor: true });

        this.startButton = this.add.text(buttonX, buttonY, "Start", {
            fontFamily: "BoldPixels",
            fontSize: "48px",
            color: "#3E2723",
        });
        this.startButton.setOrigin(0.5);

        buttonBg.on("pointerover", () => {
            buttonBg.setFillStyle(0x6d4c41);
            this.startButton.setColor("#FFFFFF");
        });

        buttonBg.on("pointerout", () => {
            buttonBg.setFillStyle(0x8d6e63);
            this.startButton.setColor("#3E2723");
        });

        buttonBg.on("pointerdown", () => {
            buttonBg.setFillStyle(0x5d4037);
            this.changeScene();
        });

        const music = this.sound.add("bgMusic", {
            loop: true,
            volume: 1,
        });
        music.play();

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("Game");
    }
}

