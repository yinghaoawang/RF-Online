class State {
    constructor() {
        this.eventListeners = [];
    }
    addEventListener(listenerData) {
        addEventListener(listenerData.type, listenerData.callback);
        this.eventListeners.push(listenerData);
    }
    update() {}
    draw() {}
    handleInputs() {}
    enter() {}
    exit() {
        for (let i = 0; i < this.eventListeners.length; ++i) {
            let eventListener = this.eventListeners[i];
            removeEventListener(eventListener.type, eventListener.callback);
            this.eventListeners.splice(i, 1);
            --i;
        }
    }
}