import { Sitting, Running, Jumping, Falling, Rolling, Diving, HIT } from "./playerStates.js";
import { CollisionAnimation } from './collisionAnimation.js'; // Ensure proper import
import { FloatingMessages } from './floatingMessages';

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.vy = 0;
        this.weight = 1;
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 5; // Initialize maxFrame
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0;
        this.maxSpeed = 10;

        // State instances
        this.states = [
            new Sitting(this.game),
            new Running(this.game),
            new Jumping(this.game),
            new Falling(this.game),
            new Rolling(this.game),
            new Diving(this.game),
            new HIT(this.game) // Ensure this matches the export name
        ];
        this.currentState = null; // Safety initialization
    }

    initializeStates() {
        this.states = [
            new Sitting(this.game),
            new Running(this.game),
            new Jumping(this.game),
            new Falling(this.game),
            new Rolling(this.game),
            new HIT(this.game)
        ];
        this.setState(0); // Set initial state to Sitting
    }

    handleInput(input) {
        if (input.includes('ArrowDown')) {
            this.player.setState(states.SITTING);
        } else if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING);
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        }
    }

    update(input, deltaTime) {
        this.checkCollision();
        if (this.currentState) {
            this.currentState.handleInput(input);
        }

        // Horizontal movement
        this.x += this.speed;
        if (input.includes('ArrowRight') && this.currentState !== this.states[6]) this.speed = this.maxSpeed;
        else if (input.includes('ArrowLeft') && this.currentState !== this.states[6]) this.speed = -this.maxSpeed;
        else this.speed = 0;

        // Horizontal Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;

        // Vertical movement
        this.y += this.vy;
        if (!this.onGround()) this.vy += this.weight;
        else this.vy = 0;

        // Vertical boundaries
        if (this.y > this.game.height - this.height - this.game.groundMargin) {
            this.y = this.game.height - this.height - this.game.groundMargin;
        }

        // Sprite animation
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
            this.width, this.height, this.x, this.y, this.width, this.height);
    }

    onGround() {
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }

    setState(stateIndex) {
        // Check if the stateIndex is within the valid range
        if (stateIndex < 0 || stateIndex >= this.states.length) {
            console.error(`State index ${stateIndex} is out of bounds.`);
            return;
        }
        
        const newState = this.states[stateIndex];
        this.currentState = newState;
        this.currentState.enter();
    }

    checkCollision() {
        this.game.enemies.forEach((enemy) => {
            if (
                enemy.x < this.x + this.width &&
                enemy.x + enemy.width > this.x &&
                enemy.y < this.y + this.height &&
                enemy.y + enemy.height > this.y
            ) {
                enemy.markedForDeletion = true;
                this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
                    // This part checks for 'Rolling' (index 4) or 'Diving' (index 5)
                    this.game.score++;
                    this.game.floatingMessages.push(new FloatingMessages('+1', enemy.x, enemy.y, 1500, 50));
                } else {
                    // Here, you're setting the state to index 6, which does not exist in your array
                    // Change this to 3, which corresponds to the Falling state
                    this.setState(3); // Use Falling state (index 3)
                    this.game.score -= 5;
                    this.game.lives--;
                    if (this.game.lives <= 0) this.game.gameOver = true;
                }
                
            }
        });
    }
}
