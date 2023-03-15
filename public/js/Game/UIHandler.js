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
const showGrid = false, showHurtboxes = true, showHitboxes = true;
const checkboxesDiv = document.getElementById('checkboxes');
hideElementRecursive(checkboxesDiv);

const timerElement = document.getElementById('timer');
const winnerTextElement = document.getElementById('winnerText');
const winnerHelperTextElement = document.getElementById('winnerHelperText');

const menuInputsElement = document.getElementById('menuInputs');
const roomInputsElement = document.getElementById('roomInputs');

const roomsDropdownElement = document.getElementById('roomsDropdown');
const joinRoomButtonElement = document.getElementById('joinRoomButton');
const leaveRoomButtonElement = document.getElementById('leaveRoomButton');
const createRoomButtonElement = document.getElementById('createRoomButton');

let selectedRoomName = null;
const roomTextElement = document.getElementById('roomText');

roomsDropdownElement.addEventListener('change', function() {
    if (this.value == '') {
        selectedRoomName = null;
        joinRoomButtonElement.setAttribute('disabled', true);
    } else {
        selectedRoomName = this.value;
        joinRoomButtonElement.removeAttribute('disabled');
    }
});

const addOptionToDropdown = ({ select, value, text }) => {
    const option = document.createElement('option');
    option.value = value;
    option.innerHTML = text;
    select.appendChild(option);
}

const resetRoomSelect = () => {
    for (let i = 0; i < roomsDropdownElement.length; i++) {
        roomsDropdownElement.remove(i);
        i--;
    }
    addOptionToDropdown({ value: '', text: 'Select a Room', select: roomsDropdownElement });
}
resetRoomSelect();

const addRoomToSelect = ({ name, users }) => {
    const text = `${ name } (${ users.length } User${ users.length > 1 ? 's' : '' })`
    addOptionToDropdown({ value: name, text, select: roomsDropdownElement })
}