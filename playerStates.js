import { Dust, Fire, Splash } from './particles.js';

const states = {
    SITTING: 0,
    RUNNING: 1,
    JUMPING: 2,
    FALLING: 3,
    ROLLING: 4,
    DIVING: 5,
    HIT: 6,
};

class State {
    constructor(state, game) {
        this.state = state;
        this.game = game;
        this.player = game.player; // Direct reference to the player instance
    }
}

export class Sitting extends State {
    constructor(game) {
        super('SITTING', game);
    }

    enter() {
        this.player.frameX = 0;
        this.player.maxFrame = 8;
        this.player.frameY = 5;
    }

    handleInput(input) {
        if (input.includes('ArrowLeft') || input.includes('ArrowRight')) {
            this.player.setState(states.RUNNING);
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        }
    }
}

export class Running extends State {
    constructor(game) {
        super('RUNNING', game);
    }

    enter() {
        this.player.frameX = 0;
        this.player.maxFrame = 6;
        this.player.frameY = 3;
    }

    handleInput(input) {
        // Add dust effect
        this.game.particles.unshift(
            new Dust(
                this.game,
                this.player.x + this.player.width * 0.6,
                this.player.y + this.player.height
            )
        );
        if (input.includes('ArrowDown')) {
            this.player.setState(states.SITTING);
        } else if (input.includes('ArrowUp')) {
            this.player.setState(states.JUMPING);
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        }
    }
}

export class Jumping extends State {
    constructor(game) {
        super('JUMPING', game);
    }

    enter() {
        if (this.player.onGround()) {
            this.player.vy -= 27;
        }
        this.player.frameX = 0;
        this.player.maxFrame = 6;
        this.player.frameY = 1;
    }

    handleInput(input) {
        if (this.player.vy > this.player.weight) {
            this.player.setState(states.FALLING);
        } else if (input.includes('Enter')) {
            this.player.setState(states.ROLLING);
        } else if (input.includes('ArrowDown')) {
            this.player.setState(states.DIVING);
        }
    }
}

export class Falling extends State {
    constructor(game) {
        super('FALLING', game);
    }

    enter() {
        this.player.frameX = 0;
        this.player.maxFrame = 6;
        this.player.frameY = 2;
    }

    handleInput(input) {
        if (this.player.onGround()) {
            this.player.setState(states.RUNNING);
        } else if (input.includes('ArrowDown')) {
            this.player.setState(states.DIVING);
        }
    }
}

export class Rolling extends State {
    constructor(game) {
        super('ROLLING', game);
    }

    enter() {
        this.player.frameX = 0;
        this.player.maxFrame = 6;
        this.player.frameY = 6;
    }

    handleInput(input) {
        // Add fire effect
        this.game.particles.unshift(new Fire( this.game, this.game.player.x + this.game.player.width * 0.6,this.game.player.y + this.game.player.height * 0.5 ));
        if (!input.includes('Enter') && this.game.player.onGround()) {
            this.game.player.setState(states.RUNNING, 1);
        } else if (!input.includes('Enter') && !this.game.player.onGround()) {
            this.game.player.setState(states.FALLING, 1);
        } else if (input.includes('Enter') && input.includes('ArrowUp') && this.game.player.onGround()) {
            this.game.player.vy -= 27;
        } else if (input.includes('ArrowDown')) {
            this.game.player.setState(states.DIVING, 0);
        }
    }
}

export class Diving extends State {
    constructor(game) {
        super('DIVING', game);
    }

    enter() {
        this.player.frameX = 0;
        this.player.maxFrame = 6;
        this.player.frameY = 2;
        this.player.vy = 15; // Set vertical velocity
    }

    handleInput(input) {
        this.game.particles.unshift(
            new Fire(
                this.game,
                this.player.x + this.player.width * 0.5,
                this.player.y + this.player.height
            )
        );
        if (this.player.onGround()) {
            this.player.setState(states.RUNNING);
            for (let i = 0; i < 30; i++) {
                this.game.particles.unshift(
                    new Splash(
                        this.game,
                        this.player.x + this.player.width * 0.5,
                        this.player.y + this.player.height
                    )
                );
            }
        } else if (input.includes('Enter') && this.player.onGround()) {
            this.player.setState(states.ROLLING);
        }
    }
}

export class HIT extends State {
    constructor(game) {
        super('HIT', game);  // Make sure the 'State' constructor takes care of this.
    }

    enter() {
        this.player.frameX = 0;
        this.player.maxFrame = 10;  // The number of frames for the hit animation
        this.player.frameY = 4;     // The frameY for the hit animation (set it to the correct value)
    }

    handleInput(input) {
        // Transition to RUNNING if on the ground after hit animation finishes
        if (this.player.frameX >= this.player.maxFrame && this.player.onGround()) {
            this.player.setState(1);  // Set to RUNNING state (index 1 in player.states)
        }
        // Transition to FALLING if not on the ground after hit animation finishes
        else if (this.player.frameX >= this.player.maxFrame && !this.player.onGround()) {
            this.player.setState(3);  // Set to FALLING state (index 3 in player.states)
        }
    }
}
