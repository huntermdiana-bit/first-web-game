import { Input, Math as PhaserMath, Scene } from 'phaser';

const PLAYER_SPEED = 520;
const STARTING_LIVES = 3;
const MAX_LIVES = 3;
const FISH_SCORE = 1;
const OBJECT_SIZE = 44;
const STRAIGHT_DROP_CHANCE = 65;
const LIFE_PICKUP_CHANCE = 7;
const CAT_NORMAL = '\u{1F431}';
const CAT_HAPPY = '\u{1F63A}';
const CAT_SHOCKED = '\u{1F640}';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x7ec8ff);

        this.score = 0;
        this.lives = STARTING_LIVES;
        this.highScore = this.getHighScore();
        this.dropSpeed = 180;
        this.spawnDelay = 900;
        this.isGameOver = false;
        this.fallingObjects = [];

        this.add.rectangle(512, 730, 1024, 76, 0x71bd4b);
        this.add.text(512, 724, 'Catch fish. Avoid cucumbers. Grab hearts for lives!', {
            fontFamily: 'Arial', fontSize: 24, color: '#102030',
            align: 'center'
        }).setOrigin(0.5);

        this.player = this.add.text(512, 650, CAT_NORMAL, {
            fontFamily: 'Arial', fontSize: 64
        }).setOrigin(0.5);

        this.scoreText = this.add.text(24, 22, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffffff',
            stroke: '#1f2a44', strokeThickness: 5
        });

        this.livesText = this.add.text(24, 62, 'Lives: 3', {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffffff',
            stroke: '#1f2a44', strokeThickness: 5
        });

        this.highScoreText = this.add.text(24, 102, `Best: ${this.highScore}`, {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffffff',
            stroke: '#1f2a44', strokeThickness: 5
        });

        this.speedText = this.add.text(24, 142, 'Speed: 1', {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffffff',
            stroke: '#1f2a44', strokeThickness: 5
        });

        this.controlsText = this.add.text(1000, 24, 'A/D or Left/Right', {
            fontFamily: 'Arial', fontSize: 22, color: '#102030'
        }).setOrigin(1, 0);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('A,D,SPACE');

        this.spawnTimer = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnFallingObject,
            callbackScope: this,
            loop: true
        });

        this.spawnFallingObject();
    }

    update (time, delta)
    {
        if (this.isGameOver)
        {
            if (Input.Keyboard.JustDown(this.keys.SPACE))
            {
                this.scene.restart();
            }

            return;
        }

        const seconds = delta / 1000;
        const movingLeft = this.cursors.left.isDown || this.keys.A.isDown;
        const movingRight = this.cursors.right.isDown || this.keys.D.isDown;

        if (movingLeft)
        {
            this.player.x -= PLAYER_SPEED * seconds;
        }
        else if (movingRight)
        {
            this.player.x += PLAYER_SPEED * seconds;
        }

        this.player.x = PhaserMath.Clamp(this.player.x, 38, 986);

        for (let index = this.fallingObjects.length - 1; index >= 0; index -= 1)
        {
            const item = this.fallingObjects[index];

            item.x += item.velocityX * seconds;
            item.y += item.velocityY * seconds;

            if (item.x < 24 || item.x > 1000)
            {
                item.velocityX *= -1;
            }

            if (this.isTouchingPlayer(item))
            {
                this.handleCatch(item, index);
            }
            else if (item.y > 820)
            {
                this.removeFallingObject(index);
            }
        }
    }

    spawnFallingObject ()
    {
        if (this.isGameOver)
        {
            return;
        }

        const itemKind = this.pickFallingObjectKind();
        const item = this.add.text(PhaserMath.Between(50, 974), -40, this.getItemEmoji(itemKind), {
            fontFamily: 'Arial', fontSize: 46
        }).setOrigin(0.5);

        item.kind = itemKind;
        item.velocityX = this.getItemDrift();
        item.velocityY = this.dropSpeed + PhaserMath.Between(-20, 30);
        this.fallingObjects.push(item);
    }

    pickFallingObjectKind ()
    {
        const canDropLife = this.score >= 3 && this.lives < MAX_LIVES;

        if (canDropLife && PhaserMath.Between(1, 100) <= LIFE_PICKUP_CHANCE)
        {
            return 'life';
        }

        if (PhaserMath.Between(1, 100) <= Math.min(25 + this.score, 45))
        {
            return 'cucumber';
        }

        return 'fish';
    }

    getItemEmoji (kind)
    {
        if (kind === 'life')
        {
            return '\u{1F49A}';
        }

        if (kind === 'cucumber')
        {
            return '\u{1F952}';
        }

        return '\u{1F41F}';
    }

    getItemDrift ()
    {
        const driftChance = Math.max(STRAIGHT_DROP_CHANCE - this.score, 35);

        if (PhaserMath.Between(1, 100) <= driftChance)
        {
            return 0;
        }

        return PhaserMath.Between(60, 130) * PhaserMath.RND.sign();
    }

    handleCatch (item, index)
    {
        if (item.kind === 'fish')
        {
            this.score += FISH_SCORE;
            this.scoreText.setText(`Score: ${this.score}`);
            this.updateDifficulty();
            this.playEatAnimation(item.x, item.y);
        }
        else if (item.kind === 'life')
        {
            this.lives = Math.min(this.lives + 1, MAX_LIVES);
            this.livesText.setText(`Lives: ${this.lives}`);
            this.playLifeAnimation(item.x, item.y);
        }
        else
        {
            this.lives -= 1;
            this.livesText.setText(`Lives: ${this.lives}`);
            this.playHitAnimation(item.x, item.y);

            if (this.lives <= 0)
            {
                this.endGame();
            }
        }

        this.removeFallingObject(index);
    }

    updateDifficulty ()
    {
        const speedBonus = Math.min(this.score * 12, 260);
        const delayBonus = Math.min(this.score * 16, 430);

        this.dropSpeed = 180 + speedBonus;
        this.spawnTimer.delay = Math.max(470, this.spawnDelay - delayBonus);
        this.speedText.setText(`Speed: ${this.getSpeedLevel()}`);
    }

    getSpeedLevel ()
    {
        return Math.floor(this.score / 3) + 1;
    }

    playEatAnimation (x, y)
    {
        this.setCatMood(CAT_HAPPY, 240);
        this.player.setScale(1.18);

        this.tweens.add({
            targets: this.player,
            scale: 1,
            duration: 180,
            ease: 'Back.Out'
        });

        this.showFloatingText('+1 yum!', x, y - 18, '#fff4a3');

        if (this.score > 0 && this.score % 3 === 0)
        {
            this.showFloatingText('Speed up!', this.player.x, this.player.y - 72, '#ffffff');
        }
    }

    playLifeAnimation (x, y)
    {
        this.setCatMood(CAT_HAPPY, 300);
        this.showFloatingText('+1 life', x, y - 18, '#9dffb0');
    }

    playHitAnimation (x, y)
    {
        this.setCatMood(CAT_SHOCKED, 420);
        this.cameras.main.shake(120, 0.006);

        this.tweens.add({
            targets: this.player,
            x: this.player.x + 12,
            angle: -8,
            yoyo: true,
            repeat: 3,
            duration: 45,
            onComplete: () => {
                this.player.angle = 0;
            }
        });

        this.showFloatingText('yikes!', x, y - 18, '#ff9a9a');
    }

    setCatMood (emoji, duration)
    {
        this.player.setText(emoji);

        if (this.catMoodTimer)
        {
            this.catMoodTimer.remove(false);
        }

        this.catMoodTimer = this.time.delayedCall(duration, () => {
            if (!this.isGameOver)
            {
                this.player.setText(CAT_NORMAL);
                this.player.setScale(1);
                this.player.angle = 0;
            }
        });
    }

    showFloatingText (message, x, y, color)
    {
        const text = this.add.text(x, y, message, {
            fontFamily: 'Arial Black', fontSize: 24, color,
            stroke: '#102030', strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 48,
            alpha: 0,
            scale: 1.25,
            duration: 500,
            ease: 'Cubic.Out',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    isTouchingPlayer (item)
    {
        return PhaserMath.Distance.Between(this.player.x, this.player.y, item.x, item.y) < OBJECT_SIZE;
    }

    removeFallingObject (index)
    {
        const [item] = this.fallingObjects.splice(index, 1);
        item.destroy();
    }

    endGame ()
    {
        this.isGameOver = true;
        this.spawnTimer.remove(false);
        const isNewHighScore = this.score > this.highScore;

        if (isNewHighScore)
        {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
            this.highScoreText.setText(`Best: ${this.highScore}`);
        }

        for (const item of this.fallingObjects)
        {
            item.destroy();
        }

        this.fallingObjects = [];

        this.add.rectangle(512, 384, 660, 360, 0x102030, 0.9);
        this.add.rectangle(512, 384, 620, 320).setStrokeStyle(4, 0xffffff, 0.75);

        this.add.text(512, 270, isNewHighScore ? 'New High Score!' : 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 58, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 360, `Score: ${this.score}\nBest: ${this.highScore}\nSpeed: ${this.getSpeedLevel()}`, {
            fontFamily: 'Arial Black', fontSize: 34, color: '#ffdf6e',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 445, 'Press Space or click Restart', {
            fontFamily: 'Arial', fontSize: 26, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const restartButton = this.add.rectangle(512, 520, 220, 58, 0xffdf6e).setInteractive({ useHandCursor: true });
        this.add.text(512, 520, 'Restart', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#102030',
            align: 'center'
        }).setOrigin(0.5);

        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    getHighScore ()
    {
        try
        {
            return Number(localStorage.getItem('catFishCatchHighScore')) || 0;
        }
        catch (error)
        {
            return 0;
        }
    }

    saveHighScore (score)
    {
        try
        {
            localStorage.setItem('catFishCatchHighScore', String(score));
        }
        catch (error)
        {
            // The game can still run if localStorage is unavailable.
        }
    }
}
