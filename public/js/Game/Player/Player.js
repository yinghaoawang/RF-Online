class Player extends Sprite {
    constructor(game, {spriteOffset={x: 0, y:0}, position={x: 0, y: 0}, targetSize, maxHealth = 100, hurtbox={offset: {x: 0, y: 0}, size: {x:80, y:150}}, facingRight=true, speed=8, jumpSpeed=40, velocity={x:0, y:0}, sprites, attackData}) {
        super({position, spriteOffset, targetSize, facingRight, sprites});
        this.game = game;
        this.combatModule = new CombatModule(this, maxHealth, hurtbox, attackData);
        
        this.position = position;
        this.speed = speed;
        this.jumpSpeed = jumpSpeed;
        this.velocity = velocity;

        this.grounded = false;
    }

    update() {
        this.combatModule.update();

        this.velocity.y += game.gravity;

        this.position.x += this.velocity.x;

        // bounds
        // horizontal
        let hurtbox = this.combatModule.hurtbox;
        if (this.position.x - hurtbox.size.x / 2 < 0) {
            this.position.x = hurtbox.size.x / 2;
        }
        if (this.position.x + hurtbox.size.x / 2 > canvas.width) {
            this.position.x = canvas.width - hurtbox.size.x / 2;
        }
        // vertical
        if (-hurtbox.offset.y + hurtbox.size.y / 2 + this.position.y + this.velocity.y > canvas.height - 70) {
            this.position.y = canvas.height - 70 - (-hurtbox.offset.y + hurtbox.size.y / 2);
            this.grounded = true;
        } else {
            this.position.y += this.velocity.y;
        }

        if (this.combatModule.getIsDead() || this.lostMatch) {
            this.switchSprite('death');
        } else if (this.combatModule.getIsReceivingDamage()) {
            this.switchSprite('takeHit');
        } else if (this.combatModule.getIsAttacking()) {
            this.switchSprite(this.combatModule.getLastAttackData().spriteName);
        } else if (!this.grounded) {
            if (this.velocity.y > 0) {
                this.switchSprite('fall');
            } else {
                this.switchSprite('jump');
            }
        } else {
            if (this.velocity.x != 0) {
                this.switchSprite('run');
            } else {
                this.switchSprite('idle')
            }
        }

    }

    draw() {
        // stay on dead frame if dead
        if (this.combatModule.getIsDead() || this.lostMatch) {
            if (this.currentFrame == this.sprites['death'].maxFrames - 1) {
                this.animatingFrames = false
            }
        }
        
        super.draw();

        this.combatModule.draw();
    }
}