class StateMachine {
    constructor(game) {
        this.game = game;
        this.currentState = null;
    }
    changeState(newState) {
        if (this.currentState) this.currentState.exit();
        newState.enter();
        this.currentState = newState;
    }
    update() {
        if (this.currentState) this.currentState.update();
    }
    draw() {
        if (this.currentState) this.currentState.draw();
    }
    handleInputs() {
        if (this.currentState) this.currentState.handleInputs();
    }
}