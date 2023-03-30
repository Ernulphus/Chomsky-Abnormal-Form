export const EPSILON = '\u03B5';

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
    this.transitionFunction = (transitionFunction ? { ...transitionFunction } : {});
    this.acceptStates = (acceptStates ? [...acceptStates] : []);
    this.initialState = (states.includes(initialState) ? initialState : this.states[0]);
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
    if (oldName === newName) return stateIndex;
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

    if (this.initialState === oldName) this.initialState = newName;

    if (this.acceptStates.includes(oldName)) {
      this.acceptStates.push(newName);
      this.acceptStates = this.acceptStates.filter((state) => state !== oldName);
    }

    return stateIndex;
  }

  deleteState(stateToRemove) {
    if (typeof stateToRemove !== 'string') { generateTypeError('deleteState', 'stateToRemove', 'string'); }
    if (this.getInitialState === stateToRemove) throw new Error('cannot delete initialState');

    const transitionsTo = this.getTransitionsTo(stateToRemove);
    Object.keys(transitionsTo).forEach((letter) => {
      transitionsTo[letter].forEach((stateFrom) => {
        this.removeTransition(stateFrom, stateToRemove, letter);
      });
    });
    const transitionsFrom = this.getTransitions(stateToRemove);
    Object.keys(transitionsFrom).forEach((letter) => {
      transitionsFrom[letter].forEach((stateTo) => {
        this.removeTransition(stateToRemove, stateTo, letter);
      });
    });

    if (this.transitionFunction[stateToRemove]) delete this.transitionFunction[stateToRemove];
    this.states = this.states.filter((state) => state !== stateToRemove);
    return this.states;
  }

  getStates() {
    return [...this.states];
  }

  hasState(name) {
    if (this.states.includes(name)) return true;
    return false;
  }

  addLetter(letter) {
    if (this.alphabet.includes(letter)) return this.alphabet;
    this.alphabet.push(letter);
    return this.alphabet;
  }

  deleteLetter(letter) {
    this.alphabet = this.alphabet.filter((cha) => cha !== letter);
    return this.alphabet;
  }

  setAlphabet(alphabet) {
    this.alphabet = alphabet;
    return this.alphabet;
  }

  getAlphabet() {
    return [...this.alphabet];
  }

  getTransitions(fromState = '*', letter = '*') {
    if (fromState === '*') return this.transitionFunction;
    const transitionsFrom = (this.transitionFunction[fromState]
      ? this.transitionFunction[fromState]
      : {}
    );
    if (letter === '*') return transitionsFrom;
    if (transitionsFrom[letter]) return transitionsFrom[letter];
    return [];
  }

  getTransitionsTo(state) {
    const transitions = {};
    this.states.forEach((fromState) => {
      const statesFrom = this.getTransitions(fromState);
      Object.keys(statesFrom).forEach((letter) => {
        if (!statesFrom[letter].includes(state)) return;
        if (!transitions[letter]) { transitions[letter] = [fromState]; return; }
        transitions[letter].push(fromState);
      });
    });
    return transitions;
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

  removeTransition(fromState, toState, letter) {
    if (typeof fromState !== 'string') { generateTypeError('addTransition', 'fromState', 'string'); }
    if (typeof toState !== 'string') { generateTypeError('addTransition', 'toState', 'string'); }
    if (typeof letter !== 'string') { generateTypeError('addTransition', 'letter', 'string'); }
    this.transitionFunction[fromState][letter] = this.transitionFunction[fromState][letter]
      .filter((oldToState) => oldToState !== toState);
    return this.transitionFunction[fromState];
  }

  ensureTransitionSafety() {
    Object.keys(this.transitionFunction).forEach((fromState) => {
      if (!this.hasState(fromState)) {
        console.log('deleting', fromState);
        delete this.transitionFunction[fromState];
        return;
      }

      Object.keys(this.transitionFunction[fromState]).forEach((letter) => {
        if (letter !== EPSILON && !this.alphabet.includes(letter)) {
          delete this.transitionFunction[fromState][letter];
          return;
        }
        this.transitionFunction[fromState][letter] = this.transitionFunction[fromState][letter]
          .filter((toState) => this.hasState(toState));
      });
    });
  }

  findEpsilonTransition() {
    for (let stateIndex = 0; stateIndex < this.states.length; stateIndex += 1) {
      const state = this.states[stateIndex];
      const epsilonTransitions = this.getTransitions(state, [EPSILON]);
      if (epsilonTransitions.length > 0 && epsilonTransitions[0]) {
        return [state, epsilonTransitions[0]];
      }
    }
    return null;
  }

  removeEpsilonTransitions() {
    this.ensureTransitionSafety();
    let epsilonTransition = this.findEpsilonTransition();
    while (epsilonTransition) {
      const [stateFrom, stateTo] = epsilonTransition;
      const transitionsTo = this.getTransitionsTo(stateFrom);
      const transitionsFrom = this.getTransitions(stateFrom);
      Object.keys(transitionsTo).forEach((letter) => {
        transitionsTo[letter].forEach((newStateFrom) => {
          this.addTransition(newStateFrom, stateTo, letter);
        });
      });
      Object.keys(transitionsFrom).forEach((letter) => {
        transitionsFrom[letter].forEach((newStateTo) => {
          if (stateTo === newStateTo && letter === EPSILON) return;
          this.addTransition(stateTo, newStateTo, letter);
        });
      });
      if (this.initialState === stateFrom) this.setInitialState(stateTo);
      if (this.acceptStates.includes(stateFrom)) this.addAcceptState(stateTo);
      this.deleteState(stateFrom);
      this.ensureTransitionSafety();
      epsilonTransition = this.findEpsilonTransition();
    }
  }

  getAcceptStates() {
    return this.acceptStates;
  }

  hasAcceptState(state) {
    return this.acceptStates.includes(state);
  }

  addAcceptState(state) {
    if (this.acceptStates.includes(state)) return this.acceptStates;
    this.acceptStates.push(state);
    return this.acceptStates;
  }

  deleteAcceptState(state) {
    this.acceptStates = this.acceptStates.filter((x) => x !== state);
    return this.acceptStates;
  }

  setInitialState(state) {
    this.initialState = state;
  }

  getInitialState() {
    return this.initialState;
  }

  acceptsWord(word, state = this.initialState) {
    if (typeof word !== 'string') { generateTypeError('acceptsWord', 'word', 'string'); }
    if (typeof state !== 'string') { generateTypeError('acceptsWord', 'state', 'string'); }

    const letter = word[0] ? word[0] : '';
    const remainingWord = word.slice(1);
    const epsilonPaths = this
      .getTransitions(state, EPSILON)
      .filter((toState) => toState !== state)
      .map((toState) => this.acceptsWord(word, toState));
    const letterPaths = this
      .getTransitions(state, letter)
      .map((toState) => this.acceptsWord(remainingWord, toState));
    const validPaths = epsilonPaths
      .concat(letterPaths)
      .filter((path) => path.length > 0);

    if (validPaths.length === 0) {
      if (this.acceptStates.includes(state) && word.length === 0) return [state];
      return [];
    }
    return [state, ...validPaths[0]];
  }
}
