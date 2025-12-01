// Simple event emitter for auth state changes
class AuthEventEmitter {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  emit() {
    this.listeners.forEach(callback => callback());
  }
}

export default new AuthEventEmitter();
