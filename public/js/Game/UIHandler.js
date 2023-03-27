const p1ButtonElement = document.getElementById('joinP1Button');
const p2ButtonElement = document.getElementById('joinP2Button');

const menuDiv = document.getElementById('menuDiv');
const menuBackgroundElement = document.getElementById('menuBackground');
const menuBackgroundFilterElement = document.getElementById('menuBackgroundFilter');
hideElementRecursive(menuDiv);

const outerContainerElement = document.getElementById('outerContainerDiv');
const playingElement = document.getElementById('playingDiv');
const p1HealthBarElement = document.getElementById('playerOneHealthBar');
const p2HealthBarElement = document.getElementById('playerTwoHealthBar');
hideElementRecursive(playingElement);

const showAll = false;
const showGrid = false, showHurtboxes = false, showHitboxes = false;
const checkboxesDiv = document.getElementById('checkboxes');
hideElementRecursive(checkboxesDiv);

const timerElement = document.getElementById('timer');
const winnerTextElement = document.getElementById('winnerText');
const winnerHelperTextElement = document.getElementById('winnerHelperText');

const menuInputsElement = document.getElementById('menuInputs');
const roomInputsElement = document.getElementById('roomInputs');

const joinRoomButtonElement = document.getElementById('joinRoomButton');
const leaveRoomButtonElement = document.getElementById('leaveRoomButton');
const stopPlayingButtonElement = document.getElementById('stopPlayingButton');
const createRoomButtonElement = document.getElementById('createRoomButton');

let selectedRoomName = null;
const roomTextElement = document.getElementById('roomText');

let selectedCharacterName = 'Ninja';

const selectCharacter = (name) => {
    if (game.playingState.currentPlayer != null) {
        alert('Cannot change player while playing.');
        return;
    }
    const prevCharacterButton = document.getElementById('select-' + selectedCharacterName);
    if (prevCharacterButton) prevCharacterButton.classList.remove('selected');
    selectedCharacterName = name;
    const characterButton = document.getElementById('select-' + selectedCharacterName);
    characterButton.classList.add('selected');
}

const selectCharacterInputsElement = document.getElementById('selectCharacterInputs');
for (const characterData of characterDatas) {
    const { selectImage, name } = characterData;
    const characterButton = document.createElement('button')
    characterButton.id = 'select-' + name;
    characterButton.classList.add('character-button');
    if (name === 'Ninja') characterButton.classList.add('selected');
    const img = document.createElement('img');
    img.src = selectImage || './images/Zebra.png';
    characterButton.appendChild(img);
    const label = document.createElement('label');
    label.innerHTML = name;
    characterButton.appendChild(label);
    characterButton.addEventListener('click', () => selectCharacter(name));
    selectCharacterInputsElement.appendChild(characterButton);
}

const addButtonToContainer = ({ container, value, text }, handleJoinRoomClick) => {
    const button = document.createElement('button');
    button.value = value;
    button.innerHTML = text;
    container.appendChild(button);
    if (handleJoinRoomClick != null) {
        button.addEventListener('click', () => {
            handleJoinRoomClick({ selectedRoomName: value })
        })
    }
}

const roomsElement = document.getElementById('roomsContainer');

const resetRoomSelect = () => {
    while (roomsElement.lastElementChild) {
        roomsElement.removeChild(roomsElement.lastElementChild);
    }
    const label = document.createElement('label');
    label.innerHTML = 'Rooms'
    roomsElement.appendChild(label);
}
resetRoomSelect();

const addRoomToContainer = ({ name, users }, handleJoinRoomClick) => {
    const text = `${ name } (${ users.length } User${ users.length > 1 ? 's' : '' })`
    addButtonToContainer({ value: name, text, container: roomsElement }, handleJoinRoomClick)
}