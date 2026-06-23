import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x7ec8ff);

        const highScore = this.getHighScore();

        this.add.text(512, 150, 'Cat Fish Catch', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#1f2a44', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 285, 'Catch fish for points.\nDodge cucumbers. Three hits ends the game.\nRare hearts restore one life.', {
            fontFamily: 'Arial', fontSize: 34, color: '#102030',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 438, `High Score: ${highScore}`, {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#1f2a44', strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 520, 'Move: Arrow Keys or A/D\nStart: Space or Click', {
            fontFamily: 'Arial', fontSize: 28, color: '#102030',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {

            this.scene.start('Game');

        });

        this.input.once('pointerdown', () => {

            this.scene.start('Game');

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
}
