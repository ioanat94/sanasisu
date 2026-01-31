class LancelotSprite extends Phaser.GameObjects.Sprite {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number,
    ) {
        super(scene, x, y, texture, frame);

        this.setScale(4);

        this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.anims.create({
            key: "idle",
            frames: this.anims.generateFrameNumbers("lancelot", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.anims.create({
            key: "hit",
            frames: this.anims.generateFrameNumbers("lancelot", {
                start: 64,
                end: 67,
            }),
            frameRate: 8,
        });

        this.anims.create({
            key: "death",
            frames: this.anims.generateFrameNumbers("lancelot", {
                start: 72,
                end: 75,
            }),
            frameRate: 8,
        });

        this.play("idle");

        scene.add.existing(this);
    }

    playHit() {
        this.play("hit");
        this.once("animationcomplete-hit", () => {
            this.play("idle");
        });
    }

    playDeath() {
        this.play("death");
    }
}

export { LancelotSprite };
