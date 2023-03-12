/* example params:
attackData:
[
    {
        damage: 15,
        hitboxes: [
            {offset: {x: 0, y: -60}, size: {x: 0, y: 0},},
            {offset: {x: 0, y: -60}, size: {x: 160, y: 120},},
            {offset: {x: 0, y: -60}, size: {x: 160, y: 120},},
            {offset: {x: 0, y: -60}, size: {x: 160, y: 120},},
        ],
        spriteName: 'attack1',
        cooldown: 50,
    }
]
*/

class CombatModule extends PlayerModule {
    constructor(player, maxHealth, hurtbox, attackData) {
        super(player);
        this.lastAttackIndex = 0;
        this.lastAttackTime = -999999;
        this.lastDamagedTime = -999999;
        this.attacking = false;
        this.attackData = attackData;

        for (let i = 0; i < this.attackData.length; ++i) {
            let spriteName = this.attackData[i].spriteName;
            this.attackData[i].duration = this.player.sprites[spriteName].frameDuration * this.player.sprites[spriteName].maxFrames;
        }

        this.hurtbox = hurtbox;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
        if (this.hurtbox && !this.hurtbox.offset) {
            this.hurtbox.offset = {x: 0, y: 0};
        }
    }

    getIsDead() {
        return this.health <= 0;
    }

    getRecoverDuration() {
        return this.player.sprites['takeHit'].frameDuration * this.player.sprites['takeHit'].maxFrames;
    }

    getIsReceivingDamage() {
        return this.receivingDamage;
    }

    performAttack(i) {
        this.attacking = true;
        this.lastAttackIndex = i;
        this.getLastAttackData().unitsHitList = []
        this.lastAttackTime = Date.now();
    }

    getCanRecover() {
        if (!this.getIsReceivingDamage()) return true;
        return Date.now() >= this.getNextRecoverTime();
    }

    getCanAttack() {
        return !this.getIsAttacking() && Date.now() >= this.getNextAttackTime();
    }

    getLastAttackTime() {
        return this.lastAttackTime;
    }

    getNextAttackTime() {
        return this.getLastAttackTime() + this.getLastAttackData().duration + this.getLastAttackData().cooldown;
    }

    getAttackFinished() {
        return this.getLastAttackTime() + this.getLastAttackData().duration;
    }

    getIsAttacking() {
        return this.attacking;
    }

    getNextRecoverTime() {
        return this.lastDamagedTime + this.getRecoverDuration();
    }

    damagePlayer(targetPlayer) {
        if (!this.canDamagePlayer(targetPlayer)) {
            return;
        }

        targetPlayer.combatModule.health -= this.getLastAttackData().damage;
        this.getLastAttackData().unitsHitList.push(targetPlayer);
        targetPlayer.combatModule.receivingDamage = true;
        targetPlayer.combatModule.lastDamagedTime = Date.now();
        targetPlayer.combatModule.attacking = false;
        
        if (!targetPlayer.combatModule.getIsDead()) {
            if (this.player.position.x > targetPlayer.position.x) {
                targetPlayer.facingRight = true;
                targetPlayer.velocity.x = -10;
            } else {
                targetPlayer.facingRight = false;
                targetPlayer.velocity.x = 10;
            }
        }
    }

    getLastAttackData() {
        return this.attackData[this.lastAttackIndex];
    }

    getActiveAttackHitbox() {
        const spriteName = this.getLastAttackData().spriteName;
        const timePerFrame = this.getLastAttackData().duration / this.player.sprites[spriteName].maxFrames;
        // hitbox index determined by which frame attack animation is currently on
        let i = (Math.floor((Date.now() - this.getLastAttackTime()) / timePerFrame) || 0) % this.player.sprites[spriteName].maxFrames;
        return this.getLastAttackData().hitboxes[i];
    }

    canDamagePlayer(targetPlayer) {
        for (let unitHit of this.getLastAttackData().unitsHitList) {
            if (unitHit == targetPlayer) return false;
        }
        return true;
    }
    
    update() {
        if (this.getIsReceivingDamage()) {
            if (this.player.facingRight) {
                this.player.velocity.x += .5;
                if (this.player.velocity.x > 0) this.player.velocity.x = 0;
            } else {
                this.player.velocity.x -= .5;
                if (this.player.velocity.x < 0) this.player.velocity.x = 0;
            }
            
        } else if (this.getIsAttacking()) {
            if (this.player.grounded) this.player.velocity.x = 0;
            if (Date.now() >= this.getAttackFinished()) {
                this.attacking = false;
            }
        }

        if (this.getIsReceivingDamage() && this.getCanRecover()) {
            this.receivingDamage = false;
        } 
    }

    draw() {
        if (showHurtboxes) {
            ctx.strokeStyle = 'green';
            ctx.strokeRect(this.player.position.x - (this.hurtbox.size.x / 2), this.player.position.y - (this.hurtbox.size.y / 2) + this.hurtbox.offset.y,
            this.hurtbox.size.x, this.hurtbox.size.y);
        }

        if (showHitboxes && this.getIsAttacking()) {
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.translate(this.player.position.x, this.player.position.y);
            ctx.scale(this.player.facingRight ? 1 : -1, 1);

            let currentHitbox = this.getActiveAttackHitbox();

            ctx.strokeRect(currentHitbox.offset.x, currentHitbox.offset.y,
                currentHitbox.size.x, currentHitbox.size.y);
            ctx.restore();
        }
    }
}
