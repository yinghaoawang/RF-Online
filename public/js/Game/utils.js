// player1 is the attacker, player2 is the attackee
function playerAttackCollision(p1, p2) {
    let p1Hitbox = p1.combatModule.getActiveAttackHitbox();
    let p2Hurtbox = p2.combatModule.hurtbox;

    let rectA = {
        x: p1.position.x + (p1.facingRight ? p1Hitbox.offset.x : -p1Hitbox.offset.x -p1Hitbox.size.x),
        y: p1.position.y + p1Hitbox.offset.y,
        w: p1Hitbox.size.x, h: p1Hitbox.size.y
    };
    let rectB = {
        x: p2.position.x - p2Hurtbox.size.x / 2,
        y: p2.position.y - p2Hurtbox.size.y / 2 + p2Hurtbox.offset.y,
        w: p2Hurtbox.size.x, h: p2Hurtbox.size.y
    };
    console.log(rectA, rectB);

    return rectCollision(rectA, rectB);
}

function rectCollision(rectA, rectB) {
    return rectA.x < rectB.x + rectB.w &&
        rectA.x + rectA.w > rectB.x &&
        rectA.y < rectB.y + rectB.h &&
        rectA.h + rectA.y > rectB.y;
}

function drawGuides(gridWidth = 50, gridHeight = 50) {
    if (!showGrid) return;

    ctx.strokeStyle = 'white';
    for (let i = 0; i <= canvas.width; i += gridWidth) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    for (let i = 0; i <= canvas.height; i += gridHeight) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function hideElementRecursive(element) {
    element.classList.add("hidden");
    for (let childElement of element.children) {
        hideElementRecursive(childElement);
    }
}
function showElementRecursive(element) {
    element.classList.remove("hidden");
    for (let childElement of element.children) {
        showElementRecursive(childElement);
    }
}
