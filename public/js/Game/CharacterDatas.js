const wizardData = {
    name: 'Wizard',
    selectImage: './images/wizard/Select.png',
    maxHealth: 100,
    position: {x: canvas.width - 60, y: 0},
    facingRight: false,
    spriteOffset: {x: 0, y: 30},
    hurtbox: {offset: {x: 0, y: 0}, size: { x: 40, y: 100 }},
    targetSize: {x: 250 * 2, y: 250 * 2},
    sprites: {
        idle: {imageUrl: './images/wizard/Idle.png', maxFrames: 8, frameDuration: 100, size: {x: 250, y: 250}},
        run: {imageUrl: './images/wizard/Run.png', maxFrames: 8, frameDuration: 60, size: {x: 250, y: 250}},
        fall: {imageUrl: './images/wizard/Fall.png', maxFrames: 2, frameDuration: 100, size: {x: 250, y: 250}},
        jump: {imageUrl: './images/wizard/Jump.png', maxFrames: 2, frameDuration: 100, size: {x: 250, y: 250}},
        death: {imageUrl: './images/wizard/Death.png', maxFrames: 7, frameDuration: 100, size: {x: 250, y: 250}},
        takeHit: {imageUrl: './images/wizard/Take hit.png', maxFrames: 3, frameDuration: 100, size: {x: 250, y: 250}},
        attack1: {imageUrl: './images/wizard/Attack1.png', maxFrames: 8, frameDuration: 75, size: {x: 250, y: 250}},
        attack2: {imageUrl: './images/wizard/Attack2.png', maxFrames: 8, frameDuration: 90, size: {x: 250, y: 250}},
    },
    attackData: [
        { // antiair
            damage: 25,
            hitboxes: [
                {offset: {x:-80, y: -120}, size: {x: 0, y: 0},},
                {offset: {x:-80, y: -120}, size: {x: 0, y: 0},},
                {offset: {x:-80, y: -120}, size: {x: 0, y: 0},},
                {offset: {x: 140, y: -140}, size: {x: 140, y: 150},},
                {offset: {x: 130, y: -150}, size: {x: 100, y: 150},},
                {offset: {x: 120, y: -190}, size: {x: 100, y: 150},},
                {offset: {x: 120, y: -190}, size: {x: 100, y: 150},},
                {offset: {x: 0, y: 0}, size: {x: 0, y: 0}},
            ],
            spriteName: 'attack1',
            cooldown: 50,
        },
        {
            damage: 18,
            hitboxes: [
                {offset: {x:-80, y: -120}, size: {x: 0, y: 0},},
                {offset: {x:-80, y: -120}, size: {x: 0, y: 0},},
                {offset: {x:-80, y: -120}, size: {x: 0, y: 0},},
                {offset: {x: 80, y: -140}, size: {x: 140, y: 140},},
                {offset: {x: 80, y: -140}, size: {x: 160, y: 200},},
                {offset: {x: 80, y: -140}, size: {x: 150, y: 230},},
                {offset: {x: 60, y: -140}, size: {x: 140, y: 230},},
                {offset: {x: 0, y: 0}, size: {x: 0, y: 0}},
            ],
            spriteName: 'attack2',
            cooldown: 50,
        }
    ]
};

const ninjaData = {
    name: 'Ninja',
    selectImage: './images/hero/Select.png',
    maxHealth: 100,
    position: {x: 60, y: 0},
    hurtbox: {offset: {x: 0, y: 0}, size: { x: 30, y: 110 }},
    targetSize: {x: 200 * 2, y: 200 * 2},
    sprites: {
        idle: {imageUrl: './images/hero/Idle.png', maxFrames: 4, frameDuration: 100, size: {x: 200, y: 200}},
        run: {imageUrl: './images/hero/Run.png', maxFrames: 8, frameDuration: 60, size: {x: 200, y: 200}},
        fall: {imageUrl: './images/hero/Fall.png', maxFrames: 2, frameDuration: 100, size: {x: 200, y: 200}},
        jump: {imageUrl: './images/hero/Jump.png', maxFrames: 2, frameDuration: 100, size: {x: 200, y: 200}},
        death: {imageUrl: './images/hero/Death.png', maxFrames: 7, frameDuration: 100, size: {x: 200, y: 200}},
        takeHit: {imageUrl: './images/hero/Take hit.png', maxFrames: 3, frameDuration: 100, size: {x: 200, y: 200}},
        attack1: {imageUrl: './images/hero/Attack1.png', maxFrames: 4, frameDuration: 70, size: {x: 200, y: 200}},
        attack2: {imageUrl: './images/hero/Attack2.png', maxFrames: 4, frameDuration: 70, size: {x: 200, y: 200}},
    },
    attackData: [
        {
            damage: 20,
            hitboxes: [
                {offset: {x: 0, y: -60}, size: {x: 0, y: 0},},
                {offset: {x: 0, y: -60}, size: {x: 0, y: 0},},
                {offset: {x: 0, y: -65}, size: {x: 165, y: 120},},
                {offset: {x: 0, y: -60}, size: {x: 0, y: 0},},
            ],
            spriteName: 'attack1',
            cooldown: 50,
        },
        {
            damage: 17,
            hitboxes: [
                {offset: {x: 0, y: -60}, size: {x: 0, y: 0},},
                {offset: {x: 0, y: -60}, size: {x: 0, y: 0},},
                {offset: {x: 50, y: -110}, size: {x: 115, y: 190},},
                {offset: {x: 0, y: -60}, size: {x: 0, y: 0},},
            ],
            spriteName: 'attack2',
            cooldown: 50,
        }
    ]
};

const characterDatas = [ninjaData, wizardData];

const getCharacterDataFromName = (name) => {
    const characterData = characterDatas.find(d => d.name === name);
    console.log(name, characterData, 'klasdjskla');
    return structuredClone(characterData);
}