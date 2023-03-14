class Game {
    constructor() {
        this.gravity = 1.5;
        
        this.inputManager = new InputManager(this);

        this.stateMachine = new StateMachine(this);
        this.menuState = new MenuState(this);
        this.playingState = new PlayingState(this);
    }

    gameLoop() {
        const fps = 1000 / 80
        this.stateMachine.handleInputs();

        if (this.lastUpdated == null || this.lastUpdated + fps <= Date.now()) {
            this.stateMachine.update();
            this.lastUpdated = Date.now();
        }
        this.stateMachine.draw();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    start() {
        this.stateMachine.changeState(this.menuState);
        // this.stateMachine.changeState(this.playingState);
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}
