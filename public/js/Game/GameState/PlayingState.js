const PlayerNumber = {
    ONE: 1,
    TWO: 2
}

const InternalPlayingState = {
    playing: 0,
    paused: 1,
    finished: 2,
}

class PlayingState extends State {
    constructor(game) {
        super();
        this.game = game;
        this.background = new Sprite({sprites: './images/Background.png', position: {x: canvas.width / 2, y: canvas.height / 2}, targetSize: {x: canvas.width, y: canvas.height}});
        winnerTextElement.parentElement.style.marginTop = canvas.height / 2 - 40;
    }

    createPlayer({playerNumber, characterName, setAsCurrentPlayer=false}) {
        console.log(getCharacterDataFromName(characterName), characterName);
        const player = new Player(this.game, getCharacterDataFromName(characterName));
        player.position.y = 0;
        player.playerNumber = playerNumber;

        switch (playerNumber) {
            case PlayerNumber.ONE:
                player.position.x = player.combatModule.hurtbox.size.x + 20;
                player.facingRight = true;
                this.player = player;
                break;
            case PlayerNumber.TWO:
                player.position.x = canvas.width - player.combatModule.hurtbox.size.x - 20;
                player.facingRight = false;
                this.player2 = player;
                break;
            default:
                throw new Error('Unhandled player number in createPlayer');
        }
        this.updateHealthBarElement(playerNumber);

        if (setAsCurrentPlayer) {
            player.isCurrentPlayer = true;
            this.currentPlayer = player;
        }

        return player;
    }

    resetGame() {
        this.enterPlayingState();
        this.timeRemaining = 999 * 1000;
        this.lastTick = Date.now();
        this.updateTimer();
        this.enterPlayingState();
    }
    enter() {
        super.enter();
        showElementRecursive(playingElement);
        this.resetGame();
    }
    exit() {
        super.exit();
        this.player = null;
        this.player2 = null;
        hideElementRecursive(playingElement);
    }
    enterPlayingState() {
        this.internalState = InternalPlayingState.playing;
        winnerTextElement.classList.remove('finished');
        winnerHelperTextElement.classList.remove('finished');
    }

    enterFinishedState() {
        this.internalState = InternalPlayingState.finished;

        if (this.timeRemaining <= 0) {
            this.player.velocity.x = 0;
            this.player2.velocity.x = 0;
        }
        
        if (this.player.combatModule.health > this.player2.combatModule.health) {
            this.finishedText = "Player 1 Wins";
            this.player2.lostMatch = true;
        } else if (this.player2.combatModule.health > this.player.combatModule.health) {
            this.finishedText = "Player 2 Wins";
            this.player.lostMatch = true;
        } else {
            this.finishedText = 'Tie';
        }

        winnerTextElement.textContent = this.finishedText;
        winnerTextElement.classList.add('finished');
        winnerHelperTextElement.classList.add('finished');
    }

    updateInternalState() {
        if (this.currentPlayer?.combatModule?.getIsDead()) {
            setTimeout(() => {
                this.createPlayer(this.currentPlayer.playerNumber, selectedCharacterName || 'Ninja', true);
            }, 2000);
        }

        if (this.player?.combatModule?.getIsDead() || this.player2?.combatModule?.getIsDead()) {
            // this.enterFinishedState();
        } else if (this.timeRemaining <= 0) {
            // this.enterFinishedState();
        }

    }
    updateTimer() {
        let timeDelta = Date.now() - this.lastTick;
        this.timeRemaining -= timeDelta;
        timerElement.textContent = Math.max(Math.ceil(this.timeRemaining / 1000), 0).toFixed(0);
    }
    update() {
        super.update();
        this.updateInternalState();
        if (this.internalState != InternalPlayingState.paused) {
            if (this.player != null && this.player2 != null) this.updateTimer();
            this.handleCollisions();
            if (this.player != null) this.player.update();
            if (this.player2 != null) this.player2.update();
        }
        this.lastTick = Date.now();
    }

    setToDestroyPlayer(playerNumber) {
        switch (playerNumber) {
            case PlayerNumber.ONE:
                this.player = null;
                break;
            case PlayerNumber.TWO:
                this.player2 = null;
                break;
            default:
                throw new Error('Unhandled playerNumber in setToDestroyPlayer');
        }
        if (this.currentPlayer?.playerNumber == playerNumber) {
            this.currentPlayer = null;
        }
    }

    updatePlayer({playerNumber, playerData, characterName}) {
        let player = null;
        switch (playerNumber) {
            case PlayerNumber.ONE:
                if (this.player == null) this.createPlayer({playerNumber, characterName});
                player = this.player;
                break;
            case PlayerNumber.TWO:
                if (this.player2 == null) this.createPlayer({playerNumber, characterName});
                player = this.player2;
                break;
            default:
                throw new Error('Unhandled player number in updatePlayer');
        }

        for (const key in playerData) {
            switch (key) {
                case 'combatModule':
                    const combatModule = playerData[key];
                    const { attacking, lastAttackIndex, health } = combatModule;
                    if (attacking && player.combatModule.getIsAttacking() == false) {
                        player.combatModule.performAttack(lastAttackIndex);
                    }
                    player.combatModule.health = health;
                    this.updateHealthBarElement(playerNumber);
                break;
                case 'currentSprite':
                    player.switchSpriteByUrl(playerData[key].imageUrl);
                    break;
                default:
                    player[key] = playerData[key];
            }
        }
    }
    drawFilters() {
        ctx.fillStyle = 'rgba(255, 255, 255, .25)'
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    draw() {
        super.draw();
        if (this.internalState != InternalPlayingState.paused) {
            this.background.draw();
            this.drawFilters();
            if (this.player != null) this.player.draw();
            if (this.player2 != null) this.player2.draw();
            drawGuides();
        }
    }
    handleInputs() {
        super.handleInputs();
        switch(this.internalState) {
            case InternalPlayingState.playing:
                this.handlePlayingInput();
                break;
            case InternalPlayingState.paused:
                this.handlePausedInput();
                break;
            case InternalPlayingState.finished:
                this.handleFinishedInput();
                break;
            default:
                console.error("Invalid state: " + this.internalState);
        }
    }
    startPause() {
        this.internalState = InternalPlayingState.paused;
        this.pausePressed = true;
        this.lastPausedTime = Date.now();
        outerContainerElement.classList.add("paused");
    }
    endPause() {
        this.internalState = InternalPlayingState.playing;
        this.pausePressed = true;
        this.player.lastFrameDrawn += Date.now() - this.lastPausedTime;
        this.player.combatModule.lastAttackTime += Date.now() - this.lastPausedTime;
        this.player.combatModule.lastDamagedTime += Date.now() - this.lastPausedTime
        this.player2.lastFrameDrawn += Date.now() - this.lastPausedTime;
        this.player2.combatModule.lastAttackTime += Date.now() - this.lastPausedTime;
        this.player2.combatModule.lastDamagedTime += Date.now() - this.lastPausedTime;
        outerContainerElement.classList.remove("paused");
    }
    handleFinishedInput() {
        let inputManager = this.game.inputManager;

        let replayPressed, returnPressed;
        for (let key of inputManager.keysDown) {
            switch(key) {
                case 't':
                    replayPressed = true;
                    break;
                case 'b':
                    returnPressed = true;
                default:
                    break;
            }
        }

        if (replayPressed) {
            this.resetGame();
        } else if (returnPressed) {
            this.game.stateMachine.changeState(this.game.menuState);
        }
    }

    handlePausedInput() {
        let inputManager = this.game.inputManager;

        if (this.pausePressed && !inputManager.isKeyDown('1') && !inputManager.isKeyDown('9')) {
            this.pausePressed = false;
            return;
        } else if (this.pausePressed) {
            return;
        }

        let unpausePressed;
        for (let key of inputManager.keysDown) {
            switch(key) {
                case '1':
                case '9':
                    unpausePressed = true;
                default:
                    break;
            }
        }

        if (unpausePressed) {
            this.endPause();
        }
    }

    handlePlayingInput() {
        if (this.currentPlayer?.combatModule == null || this.currentPlayer?.combatModule.getIsDead()) return;
        let inputManager = this.game.inputManager;

        let leftPressed, rightPressed, jumpPressed, attackPressed, attack2Pressed; 
        for (let key of inputManager.keysDown) {
            switch(key) {
                case 'a':
                    leftPressed = true;
                    break;
                case 'd':
                    rightPressed = true;
                    break;
                case 'w':
                    jumpPressed = true;
                    break;
                case 'q':
                    attackPressed = true;
                case 'e':
                    attack2Pressed = true;
                default:
                    break;
            }
        }

        const player = this.currentPlayer;
        
        if (!player.combatModule.getIsReceivingDamage()) {
            if (leftPressed) {
                if (!player.combatModule.getIsAttacking()) {
                    player.velocity.x = -player.speed;
                    player.facingRight = false;
                }
            } else if (rightPressed) {
                if (!player.combatModule.getIsAttacking()) {
                    player.velocity.x = player.speed;
                    player.facingRight = true;
                }
            } else {
                if (player.grounded && !player.combatModule.getIsReceivingDamage()) {
                    player.velocity.x = 0;
                }
            }
            if (jumpPressed) {
                if (player.grounded && !player.combatModule.getIsAttacking()) {
                    player.velocity.y = -player.jumpSpeed;
                    player.grounded = false;
                }
            }
            if (attackPressed) {
                if (player.combatModule.getCanAttack()) {
                    player.combatModule.performAttack(0);
                    
                }
            }
            if (attack2Pressed) {
                if (player.combatModule.getCanAttack()) {
                    player.combatModule.performAttack(1);
                    
                }
            }
        }
    }

    updateHealthBarElement(playerNumber) {
        let player;
        let healthBarElement;
        switch (playerNumber) {
            case PlayerNumber.ONE:
                player = this.player;
                healthBarElement = p1HealthBarElement;
                break;
            case PlayerNumber.TWO:
                player = this.player2;
                healthBarElement = p2HealthBarElement;
                break;
            default:
                console.log(playerNumber);
                throw new Error('Unhandled playerNumber in updateHealthBarElement');
        }
        healthBarElement.style.width = Math.max(0, (player.combatModule.health / player.combatModule.maxHealth)) * 100 + "%";
    }

    handleCollisions() {
        let player = this.player;
        let player2 = this.player2;

        if (player == null || player2 == null) return;
    
        if (player.combatModule.getIsAttacking() && playerAttackCollision(player, player2)) {
            player.combatModule.damagePlayer(player2);
            this.updateHealthBarElement(PlayerNumber.TWO);
        }
    
        if (player2.combatModule.getIsAttacking() && playerAttackCollision(player2, player)) {
            player2.combatModule.damagePlayer(player);
            this.updateHealthBarElement(PlayerNumber.ONE)
        }
    }
}