class Player extends Sprite {
    constructor({position={x:50, y:0}, size={x:80, y:150}, speed=8, jumpSpeed=40, velocity={x:0, y:0}}) {
        super({position, size});
        this.position = position;
        this.size = size;
        this.speed = speed;
        this.jumpSpeed = jumpSpeed;
        this.velocity = velocity;

        this.grounded = false;
        this.attack = {
            isAttacking: false,
            lastAttackTime: -999999,

            offset: {
                x: 35,
                y: -40
            },
            size: {
                x: 50,
                y: 25
            },
            duration: .15,
            cooldown: .35,
        }
    }

    performAttack() {
        console.log('attacking');
        this.attack.isAttacking = true;
        this.attack.lastAttackTime = Date.now();
    }

    getCanAttack() {
        return !this.getIsAttacking() && Date.now() >= this.getNextAttackTime();
    }

    getNextAttackTime() {
        return this.attack.lastAttackTime + this.attack.duration * 1000 + this.attack.cooldown * 1000;
    }

    getIsAttacking() {
        if (this.attack.isAttacking) return true;
        return false;
    }

    update() {
        if (this.getIsAttacking()) {
            if (Date.now() >= this.attack.lastAttackTime + this.attack.duration * 1000) {
                this.attack.isAttacking = false;
            }
        }

        this.velocity.y += gravity;

        this.position.x += this.velocity.x;

        if (this.size.y + this.position.y + this.velocity.y > canvas.height - 70) {
            this.position.y = canvas.height - 70 - this.size.y;
            this.grounded = true;
        } else {
            this.position.y += this.velocity.y;
        }

    }

    getCenter() {
        return {
            x: this.position.x + this.size.x / 2,
            y: this.position.y + this.size.y / 2
        }
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.size.x, this.size.y);

        ctx.strokeStyle = 'red';
        ctx.strokeRect(this.position.x, this.position.y, this.size.x, this.size.y);

        if (this.attack.isAttacking) {
            ctx.strokeStyle = 'lime';
            ctx.strokeRect(this.getCenter().x + this.attack.offset.x, this.getCenter().y + this.attack.offset.y,
                this.attack.size.x, this.attack.size.y);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.getCenter().x + this.attack.offset.x, this.getCenter().y + this.attack.offset.y,
                this.attack.size.x, this.attack.size.y);
        }
    }
}