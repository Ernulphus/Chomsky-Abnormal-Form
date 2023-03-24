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
      initialState = 'q0',
    } = params;
    this.states = (states ? [...states] : ['q0']);
    this.alphabet = (alphabet ? [...alphabet] : ['a', 'b']);
    this.transitionFunction = (transitionFunction ? {...transitionFunction} : {});
    this.acceptStates = (acceptStates ? [...acceptStates] : []);
    this.initialState = (initialState ? initialState : this.states[0]);
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

    Object.keys(this.transitionFunction).forEach((fromState) => {
      const transitionsFrom = this.transitionFunction[fromState];
      Object.keys(transitionsFrom).forEach((letter) => {
        const destinations = transitionsFrom[letter];
        if (destinations.includes(oldName)) destinations.push(newName);
        const newDestinations = destinations.filter((toState) => toState !== oldName);
        transitionsFrom[letter] = newDestinations;
      });
    });
    if (Object.keys(this.transitionFunction).includes(oldName)) {
      this.transitionFunction[newName] = this.transitionFunction[oldName];
      delete this.transitionFunction[oldName];
    }

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
      : {}
    );
    return transitionsFrom;
  }

  addTransition(fromState, toState, letter) {
    if (typeof fromState !== 'string') { generateTypeError('addTransition', 'fromState', 'string'); }
    if (typeof toState !== 'string') { generateTypeError('addTransition', 'toState', 'string'); }
    if (typeof letter !== 'string') { generateTypeError('addTransition', 'letter', 'string'); }
    const transitionsFrom = this.getTransitions(fromState);
    if (transitionsFrom[letter]) {
      transitionsFrom[letter].push(toState);
    } else {
      transitionsFrom[letter] = [toState];
    }
    this.transitionFunction[fromState] = transitionsFrom;
    return this.transitionFunction[fromState];
  }

  acceptsWord(word, state = this.initialState) {
    if (typeof word !== 'string') { generateTypeError('acceptsWord', 'word', 'string'); }

    if (word.length === 0) {
      if (this.acceptStates.includes(state)) return [state];
      return [];
    }

    const letter = word[0];
    const remainingWord = word.slice(1);
    const transitionsFromState = this.getTransitions(state);
    const letterTransitions = transitionsFromState[letter];
    if (!letterTransitions) return [];
    const paths = letterTransitions.map((toState) => this.acceptsWord(remainingWord, toState));
    const validPaths = paths.filter((path) => path.length > 0);
    if (validPaths.length === 0) return [];
    return [state, ...validPaths[0]];
  }
}
