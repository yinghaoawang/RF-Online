const p1Button = document.getElementById('joinP1Button');
const p2Button = document.getElementById('joinP2Button');

const menuDiv = document.getElementById('menuDiv');
const menuBackgroundElement = document.getElementById('menuBackground');
const menuBackgroundFilterDiv = document.getElementById('menuBackgroundFilter');
hideElementRecursive(menuDiv);

const outerContainerDiv = document.getElementById('outerContainerDiv');
const playingDiv = document.getElementById('playingDiv');
const p1HealthBarElement = document.getElementById('playerOneHealthBar');
const p2HealthBarElement = document.getElementById('playerTwoHealthBar');
hideElementRecursive(playingDiv);

const showAll = false;
const showGrid = false, showHurtboxes = true, showHitboxes = true;
const checkboxesDiv = document.getElementById('checkboxes');
hideElementRecursive(checkboxesDiv);

const timerElement = document.getElementById('timer');
const winnerTextElement = document.getElementById('winnerText');
const winnerHelperTextElement = document.getElementById('winnerHelperText');

const roomsDropdownElement = document.getElementById('roomsDropdown');
const joinRoomButtonElement = document.getElementById('joinRoomButton');
let selectedRoomName = null;

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
    }
    addOptionToDropdown({ value: '', text: 'Select a Room', select: roomsDropdownElement });
}
resetRoomSelect();

const addRoomToSelect = ({ name, users }) => {
    const text = `${ name } (${ users.length }/2)`
    addOptionToDropdown({ value: name, text, select: roomsDropdownElement })
}