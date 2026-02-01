class LancelotSprite extends Phaser.GameObjects.Sprite {
    private maxHealth: number = 3;
    private currentHealth: number = 2;
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
        this.heartX = x;
        this.heartY = y - 100;

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

        // Initialize hearts
        this.updateHearts();
    }

    private updateHearts() {
        // Clear existing hearts
        this.hearts.forEach((heart) => heart.destroy());
        this.hearts = [];

        // Render hearts based on current health
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
        }
    }

    heal(amount: number = 1) {
        this.currentHealth = Math.min(
            this.maxHealth,
            this.currentHealth + amount,
        );
        this.updateHearts();
    }

    getHealth(): number {
        return this.currentHealth;
    }

    getMaxHealth(): number {
        return this.maxHealth;
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
