import Character from './Character.js';
import GameEnv from './GameEnv.js';
import playGoombaDeath from './Audio.js';
import GameControl from './GameControl.js';

export class Goomba extends Character {
    // constructors sets up Character object 
    constructor(canvas, image, data, xPercentage, yPercentage, name, minPosition){
        super(canvas, image, data, 0.0, 0.2);

        //Invincibility
        this.invincible = false;

        //Unused but must be Defined
        this.name = name;
        this.y = yPercentage;

        //Initial Position of Goomba
        this.x = xPercentage * GameEnv.innerWidth;

        //Access in which a Goomba can travel    
        this.minPosition = minPosition * GameEnv.innerWidth;
        this.maxPosition = this.x + xPercentage * GameEnv.innerWidth;

        this.immune = 0;

        //Define Speed of Enemy
        if (["easy", "normal"].includes(GameEnv.difficulty)) {
            this.speed = this.speed * Math.floor(Math.random() * 1.5 + 2);
        } else if (GameEnv.difficulty === "hard") {
            this.speed = this.speed * Math.floor(Math.random() * 3 + 3);
        } else {
            this.speed = this.speed * 5
        }
    }

    update() {
        super.update();
        
        // Check for boundaries
        if (this.x <= this.minPosition || (this.x + this.canvasWidth >= this.maxPosition)) {
            this.speed = -this.speed;
        };

        //Random Event 2: Time Stop All Goombas
        if (GameControl.randomEventId === 2 && GameControl.randomEventState === 1) {
            this.speed = 0;
            if (this.name === "goombaSpecial") {
                GameControl.endRandomEvent();
            };
        };

        //Random Event 3: Kill a Random Goomba
        //Whichever Goomba recieves this message first will die, then end the event so the other Goombas don't die
        if (GameControl.randomEventId === 3 && GameControl.randomEventState === 1) {
            this.destroy();
            GameControl.endRandomEvent();
        };

        // Every so often change direction
        switch(GameEnv.difficulty) {
            case "normal":
                if (Math.random() < 0.005) this.speed = -this.speed;
                break;
            case "hard":
                if (Math.random() < 0.01) this.speed = -this.speed;
                break;
            case "impossible":
                if (Math.random() < 0.02) this.speed = -this.speed;
                break;
        }

         //Chance for Goomba to turn Gold
         if (["normal","hard"].includes(GameEnv.difficulty)) {
            if (Math.random() < 0.00001) {
                this.canvas.style.filter = 'brightness(1000%)';
                this.immune = 1;
            }
        }
        
        //Immunize Goomba & Texture It
        if (GameEnv.difficulty === "hard") {
                this.canvas.style.filter = "invert(100%)";
                this.canvas.style.scale = 1.25;
                this.immune = 1;
        } else if (GameEnv.difficulty === "impossible") {
            this.canvas.style.filter = 'brightness(1000%)';
            this.immune = 1;
        }

        // Move the enemy
        this.x -= this.speed;

        this.playerBottomCollision = false;
    }
    
    // Player action on collisions
    collisionAction() {
        if (this.collisionData.touchPoints.other.id === "tube") {
            if (this.collisionData.touchPoints.other.left || this.collisionData.touchPoints.other.right) {
                this.speed = -this.speed;            
            }
        }

        if (this.collisionData.touchPoints.other.id === "player") {
            // Collision: Top of Goomba with Bottom of Player
            if (this.collisionData.touchPoints.other.bottom && this.immune === 0) {
                this.canvas.style.transition = "transform 2s, opacity 1s";
                this.canvas.style.transformOrigin = "bottom"; // Set the transform origin to the bottom
                this.canvas.style.transform = "scaleY(0)"; // Make the Goomba flat
                this.speed = 0;
                GameEnv.invincible = true;
                playGoombaDeath();

                // Set a timeout to make GameEnv.invincible false after 2000 milliseconds (2 seconds)
                setTimeout(function () {
                GameEnv.invincible = false;
                }, 2000);
            }
        }


        if (this.collisionData.touchPoints.other.id === "goomba") {
            if (GameEnv.difficulty !== "impossible" && (this.collisionData.touchPoints.other.left || this.collisionData.touchPoints.other.right)) {
                this.speed = -this.speed;      
            }
        }
        if (this.collisionData.touchPoints.other.id === "blockPlatform") {
            if (this.collisionData.touchPoints.other.left || this.collisionData.touchPoints.other.right) {
                this.speed = -this.speed;            
            }
        }
    }
}

export default Goomba;