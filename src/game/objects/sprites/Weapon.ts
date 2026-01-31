class WeaponSprite extends Phaser.GameObjects.Sprite {
    private floatTween: Phaser.Tweens.Tween;
    private static readonly COLUMNS = 4;
    private static readonly FRAME_COUNT = 4;

    private static readonly WEAPON_ANIMATIONS = {
        excalibur: { attack: 2 },
        pickaxe: { attack: 1 },
    };

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

        const animConfig =
            WeaponSprite.WEAPON_ANIMATIONS[
                texture as keyof typeof WeaponSprite.WEAPON_ANIMATIONS
            ];

        if (!animConfig) {
            console.error(`No animation config found for weapon: ${texture}`);
            return;
        }

        const getFrameRange = (row: number) => ({
            start: row * WeaponSprite.COLUMNS,
            end: row * WeaponSprite.COLUMNS + WeaponSprite.FRAME_COUNT - 1,
        });

        this.anims.create({
            key: "attack",
            frames: this.anims.generateFrameNumbers(
                texture,
                getFrameRange(animConfig.attack),
            ),
            frameRate: 8,
        });

        this.floatTween = scene.tweens.add({
            targets: this,
            y: y + 10, // Move down 10 pixels
            duration: 1000,
            ease: "Sine.easeInOut",
            yoyo: true, // Return to start
            repeat: -1, // Repeat forever
        });

        this.setFrame(0);

        scene.add.existing(this);
    }

    playAttack() {
        this.floatTween.pause();
        this.play("attack");
        this.once("animationcomplete-attack", () => {
            this.setFrame(0);
            this.floatTween.resume();
        });
    }
}

export { WeaponSprite };
