function generateTypeError(functionName, variableName, expectedType) {
  throw new Error(`${functionName} expected ${variableName} to be of type ${expectedType}`);
}

export default class Machine {
  constructor(params = {}) {
    const {
      states = ['q0'],
      alphabet = ['a', 'b'],
      transitionFunction = {},
      acceptStates = [],
    } = params;
    this.states = (states ? [...states] : ['q0']);
    this.alphabet = (alphabet ? [...alphabet] : ['a', 'b']);
    this.transitionFunction = (transitionFunction ? {...transitionFunction} : {});
    this.acceptStates = (acceptStates ? [...acceptStates] : []);
  }

  addState(name) {
    if (typeof name !== 'string') { generateTypeError('addState', 'name', 'string'); }
    if (this.states.includes(name)) return;
    this.states.push(name);
  }

  renameState(oldName, newName) {
    if (typeof oldName !== 'string') { generateTypeError('renameState', 'oldName', 'string'); }
    if (typeof newName !== 'string') { generateTypeError('renameState', 'newName', 'string'); }
    
    const stateIndex = this.states.indexOf(oldName);
    if (stateIndex === -1) { return null; }
    this.states[stateIndex] = newName;
    
    Object.keys(this.transitionFunction).forEach((state) => {
      const transitions = this.transitionFunction[state];
      transitions.forEach((transition, index) => {
        if (transition[1] === oldName) {
          const newTransition = [transition[0], newName];
          transitions[index] = newTransition;
        }
      });
      this.transitionFunction[newName] = transitions;
      delete this.transitionFunction[oldName];
    })

    return stateIndex;
  }

  hasState(name) {
    if (this.states.includes(name)) return true;
    return false;
  }

  getTransitions(fromState = '*') {
    if (fromState === '*') return this.transitionFunction;
    const transitionsFrom = (this.transitionFunction[fromState]
      ? this.transitionFunction[fromState]
      : []
    );
    return transitionsFrom;
  }

  addTransition(fromState, toState, letter) {
    if (typeof fromState !== 'string') { generateTypeError('addTransition', 'fromState', 'string'); }
    if (typeof toState !== 'string') { generateTypeError('addTransition', 'toState', 'string'); }
    if (typeof letter !== 'string') { generateTypeError('addTransition', 'letter', 'string'); }
    const transitionsFrom = this.getTransitions(fromState);
    transitionsFrom.push([letter, toState])
    this.transitionFunction[fromState] = transitionsFrom;
    return this.transitionFunction[fromState];
  }
}
