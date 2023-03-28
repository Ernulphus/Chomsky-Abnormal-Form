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

    this.acceptStates.push(newName);
    this.acceptStates = this.acceptStates.filter((state) => state !== oldName);

    return stateIndex;
  }

  deleteState(stateToRemove) {
    this.states = this.states.filter((state) => state !== stateToRemove);

    if (this.transitionFunction[stateToRemove]) delete this.transitionFunction[stateToRemove];
    Object.keys(this.transitionFunction).forEach((fromState) => {
      Object.keys(this.transitionFunction[fromState]).forEach((letter) => {
        let toStates = this.transitionFunction[fromState][letter];
        if (!toStates) return;
        toStates = toStates.filter((toState) => toState !== stateToRemove);
        this.transitionFunction[fromState][letter] = toStates;
      });
    });
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
    Object.keys(this.transitionFunction).forEach((fromState) => {
      Object.keys(this.transitionFunction[fromState]).forEach((letter) => {
        const toStates = this.transitionFunction[fromState][letter];
        if (!toStates.includes(state)) return;
        if (transitions[letter]) {
          transitions[letter].push(fromState);
        } else {
          transitions[letter] = [fromState];
        }
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

    if (word.length === 0) {
      if (this.acceptStates.includes(state)) return [state];
      return [];
    }

    const letter = word[0];
    const remainingWord = word.slice(1);
    const epsilonPaths = this
      .getTransitions(state, EPSILON)
      .map((toState) => this.acceptsWord(word, toState));
    const letterPaths = this
      .getTransitions(state, letter)
      .map((toState) => this.acceptsWord(remainingWord, toState));
    const validPaths = epsilonPaths
      .concat(letterPaths)
      .filter((path) => path.length > 0);
    if (validPaths.length === 0) return [];
    return [state, ...validPaths[0]];
  }
}
