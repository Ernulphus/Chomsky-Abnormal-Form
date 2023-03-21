export default class Machine {
  constructor(params = {}) {
    const {
      states = ['q0'],
      alphabet = ['a', 'b'],
      transitionFunction = [],
      acceptStates = [],
    } = params;
    this.states = (states ? [...states] : ['q0']);
    this.alphabet = (alphabet ? [...alphabet] : ['a', 'b']);
    this.transitionFunction = (transitionFunction ? [...transitionFunction] : []);
    this.acceptStates = (acceptStates ? [...acceptStates] : []);
  }

  addState(name) {
    if (typeof name !== 'string') {
      throw new Error('addState expects "name" to be a string');
    }
    if (this.states.includes(name)) return;
    this.states.push(name);
  }

  hasState(name) {
    if (this.states.includes(name)) return true;
    return false;
  }
}
