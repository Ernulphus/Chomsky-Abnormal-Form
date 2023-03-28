import Machine, { EPSILON } from './Machine';

describe.each([
  { name: 'q1', transition: [] },
  { name: undefined, transition: [] },
])('addState', ({ name, transition }) => {
  it(`${name}`, () => {
    const machine = new Machine();
    const nameIsValid = (typeof name === 'string');
    try {
      machine.addState(name);
    } catch {
      expect(nameIsValid).not.toBe(true);
    }
    expect(machine.hasState(name)).toBe(nameIsValid);
  });
});

describe.each([
  { states: ['q0', 'q1'] },
  { states: ['q0', 'q1', 'q2', 'q3'] },
])('getStates()', ({ states }) => {
  it(`${states}`, () => {
    const params = { states };
    const machine = new Machine(params);
    expect(machine.getStates()).toStrictEqual(states);
  });
});

describe.each([
  { states: ['q0'], transitionFunction: { q0: { a: ['q0'] } } },
  { states: ['q0', 'q1'], transitionFunction: { q1: { a: ['q0'] } } },
  {
    states: ['q0', 'q1', 'q2'],
    transitionFunction: {
      q0: { a: ['q1'], b: ['q2'] },
      q1: { a: ['q1'], b: ['q0'] },
      q2: { a: ['q0', 'q1'], b: ['q1'] },
    },
  }
])('deleteState', ({ states, transitionFunction }) => {
  it(states.toString(), () => {
    const params = { states, transitionFunction };
    const machine = new Machine(params);
    states.forEach((state) => {
      const newStates = machine.deleteState(state);
      const newTransitionFunction = machine.getTransitions();
      expect(newStates.includes(state)).toBe(false);
      expect(
        JSON.stringify(newTransitionFunction).match(state)
      ).toBe(null);
    });
  });
});

describe.each([
  { oldName: 'q1', newName: 'initial state' },
])('renameState', ({ oldName, newName }) => {
  it(`"${oldName}" => "${newName}"`, () => {
    const machine = new Machine();
    machine.addState(oldName);
    machine.renameState(oldName, newName);
    expect(machine.hasState(oldName)).toBe(false);
    expect(machine.hasState(newName)).toBe(true);
  });
});

describe.each([
  {
    desc: 'from q0 to q1 on "a"',
    states: ['q0', 'q1'],
    transitions: [['q0', 'q1', 'a']],
  },
  {
    desc: 'from q0 to q1 on "a", and q1 to q0 on "b"',
    states: ['q0', 'q1'],
    transitions: [['q0', 'q1', 'a'], ['q1', 'q0', 'b']],
  },
  {
    desc: 'renaming after addTransition updates transitions',
    states: ['q0', 'q1'],
    transitions: [['q0', 'q1', 'a']],
    rename: [['q1', 'end'], ['q0', 'initial'] ],
  },
])('addTransition', ({ desc, states, transitions, rename = [] }) => {
  it(desc, () => {
    const machine = new Machine();
    states.forEach((state) => { machine.addState(state); });
    transitions.forEach((transition) => {
      const [from, to, letter] = transition;
      const transitionFunction = machine.addTransition(from, to, letter);
      const wasAdded = transitionFunction[letter].includes(to);
      expect(wasAdded).not.toBe(false);
    });
    rename.forEach((update) => {
      const [oldName, newName] = update;
      const oldTransitions = JSON.stringify(machine.getTransitions());
      machine.renameState(oldName, newName);
      const newTransitions = JSON.stringify(machine.getTransitions());
      const expectedResult = oldTransitions.replaceAll(oldName, newName);
      expect(newTransitions).toBe(expectedResult);
    });
  });
});

describe.each([
  {
    stateFrom: 'q0',
    statesTo: [['a', 'q1']],
    letter: '*',
    expectedResult: { a: ['q1'] },
  },
  {
    stateFrom: 'q0',
    statesTo: [['a', 'q1']],
    letter: 'a',
    expectedResult: ['q1'],
  },
  {
    stateFrom: 'q0',
    statesTo: [[EPSILON, 'q1']],
    letter: '*',
    expectedResult: { EPSILON: ['q1'] },
  },
  {
    stateFrom: 'q0',
    statesTo: [[EPSILON, 'q1']],
    letter: EPSILON,
    expectedResult: ['q1'],
  },
])('getTransitions', ({
  stateFrom,
  statesTo,
  letter,
  expectedResult,
}) => {
  if (expectedResult.EPSILON) {
    expectedResult[EPSILON] = expectedResult.EPSILON;
    delete expectedResult.EPSILON;
  }
  it(
    `${stateFrom}, ${letter} => ${JSON.stringify(expectedResult)}`,
    () => {
      const states = [];
      const transitionFunction = {};
      states.push(stateFrom);
      transitionFunction[stateFrom] = {};
      statesTo.forEach(([letterTo, stateTo]) => {
        if (!states.includes(stateTo)) states.push(stateTo);
        if (!transitionFunction[stateFrom][letterTo]) {
          transitionFunction[stateFrom][letterTo] = [stateTo];
          return;
        }
        if (!transitionFunction[stateFrom][letterTo].includes(stateTo)) {
          transitionFunction[stateFrom][letterTo].push(stateTo);
        }
      });
      const params = { states, transitionFunction };
      const machine = new Machine(params);
      const result = machine.getTransitions(stateFrom, letter);
      expect(result).toStrictEqual(expectedResult);
    },
  );
});

describe.each([
  {
    regex: 'a*',
    params: {
      states: ['q0'],
      alphabet: ['a'],
      transitionFunction: { q0: { a: ['q0'] } },
      acceptStates: ['q0'],
      initialState: 'q0',
    },
    word: 'a',
    expectedResult: ['q0', 'q0'],
  },
  {
    regex: 'a*',
    params: {
      states: ['q0'],
      alphabet: ['a'],
      transitionFunction: { q0: { a: ['q0'] } },
      acceptStates: ['q0'],
      initialState: 'q0',
    },
    word: 'b',
    expectedResult: [],
  },
  {
    regex: 'a*',
    params: {
      states: ['q0'],
      alphabet: ['a'],
      transitionFunction: { q0: { a: ['q0'] } },
      acceptStates: ['q0'],
      initialState: 'q0',
    },
    word: 'aaa',
    expectedResult: ['q0','q0','q0','q0'],
  },
  {
    regex: 'a*(b+a)*',
    params: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitionFunction: {
        q0: { a: ['q0'], b: ['q1'] },
        q1: { a: ['q2'], b: ['q1']},
        q2: { a: ['q0'], b: ['q2'] },
      },
      acceptStates: ['q0', 'q2'],
      initialState: 'q0',
    },
    word: 'a',
    expectedResult: ['q0','q0'],
  },
  {
    regex: 'a*(b+a)*',
    params: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitionFunction: {
        q0: { a: ['q0'], b: ['q1'] },
        q1: { a: ['q2'], b: ['q1']},
        q2: { a: ['q0'], b: ['q2'] },
      },
      acceptStates: ['q0', 'q2'],
      initialState: 'q0',
    },
    word: 'ab',
    expectedResult: [],
  },
  {
    regex: 'a*(b+a)*',
    params: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitionFunction: {
        q0: { a: ['q0'], b: ['q1'] },
        q1: { a: ['q2'], b: ['q1']},
        q2: { a: ['q0'], b: ['q2'] },
      },
      acceptStates: ['q0', 'q2'],
      initialState: 'q0',
    },
    word: 'aba',
    expectedResult: ['q0','q0','q1','q2'],
  },
  {
    regex: '(a[ab]+)*',
    params: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitionFunction: {
        q0: { a: ['q1'] },
        q1: { a: ['q2'], b: ['q0', 'q2']},
        q2: { a: ['q0'], b: ['q2'] },
      },
      acceptStates: ['q0', 'q2'],
      initialState: 'q0',
    },
    word: '',
    expectedResult: ['q0'],
  },
  {
    regex: 'a*b',
    params: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitionFunction: {
        q0: { 'a': ['q0'], '\u03B5': ['q1'] },
        q1: { 'b': ['q2'] },
        q2: {},
      },
      acceptStates: ['q2'],
      initialState: 'q0',
    },
    word: 'b',
    expectedResult: ['q0', 'q1', 'q2'],
  },
  {
    regex: 'a*b',
    params: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a', 'b'],
      transitionFunction: {
        q0: { 'a': ['q0'], '\u03B5': ['q1'] },
        q1: { 'b': ['q2'] },
        q2: {},
      },
      acceptStates: ['q2'],
      initialState: 'q0',
    },
    word: 'aaab',
    expectedResult: ['q0', 'q0', 'q0', 'q0', 'q1', 'q2'],
  },
])('acceptsWord', ({ regex, params, word, expectedResult }) => {
  it(`/${regex}/ ${word} => ${expectedResult}`, () => {
    const machine = new Machine(params);
    const result = machine.acceptsWord(word);
    expect(
      JSON.stringify(result),
    ).toBe(
      JSON.stringify(expectedResult),
    );
  });
});
