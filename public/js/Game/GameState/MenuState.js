let menuDiv = document.getElementById("menuDiv");
let menuBackgroundElement = document.getElementById("menuBackground");
let menuBackgroundFilterDiv = document.getElementById("menuBackgroundFilter");
hideElementRecursive(menuDiv);

class MenuState extends State {
    constructor(game) {
        super();
        menuBackgroundElement.width = canvas.width;
        menuBackgroundElement.height = canvas.height;
        menuBackgroundFilterDiv.style.width = canvas.width;
        menuBackgroundFilterDiv.style.height = canvas.height;
        this.game = game;
    }
    enter() {
        super.enter();
        showElementRecursive(menuDiv);
            
        // const clickListener = {
        //     type: 'click',
        //     callback: (e) => this.game.stateMachine.changeState(this.game.playingState),
        // };
        // this.addEventListener(clickListener);
    }
    handleInputs() {
        super.handleInputs();
        let inputManager = this.game.inputManager;
        
        // let startPressed;
        // for (let key of inputManager.keysDown) {
        //     switch(key) {
        //         case 't':
        //             startPressed = true;
        //         default:
        //             break;
        //     }
        // }

        // if (startPressed) {
        //     this.game.stateMachine.changeState(this.game.playingState);
        // }
    }
    exit() {
        super.exit();
        hideElementRecursive(menuDiv);
    }
    update() {
        super.update();
    }
}