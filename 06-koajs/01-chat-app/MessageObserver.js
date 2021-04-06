class MessageObserver {
  constructor() {
    this.listenersList = [];
  }

  addListener(listener) {
    this.listenersList = [...this.listenersList, listener];
  }

  removeListener(oldListener) {
    this.listenersList = this.listenersList.filter((listener) => listener !== oldListener);
  }

  notifyListeners(value) {
    this.listenersList.forEach((listener) => {
      if (typeof listener === 'function') {
        listener(value);
        this.removeListener(listener);
      }
    });
  }
}

module.exports = MessageObserver;
