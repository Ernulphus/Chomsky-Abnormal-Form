import {
  printTransitionFunction,
  joinMachines,
  matchParentheses,
  regexToMachine,
  splitRegexIntoTokens,
  TOKEN_TYPE,
  symbolToMachine,
  unionToMachine,
} from './RegexConverter';
import Machine, { EPSILON } from '../classes/Machine';

describe.each([
  { letter: 'a', expected: true },
  { letter: 'b', expected: true },
  { letter: 'ab', expected: false },
  { letter: 'c', expected: false },
])('unionToMachine', ({ letter, expected }) => {
  it(`a|b, ${letter} => ${expected}`, () => {
    const machineA = symbolToMachine('a');
    const machineB = symbolToMachine('b');
    const machine = unionToMachine(machineA, machineB);
    const response = machine.acceptsWord(letter).length > 0;
    expect(response).toBe(expected);
  });
});

describe.each([
  {
    regex: 'ab',
    expected: [
      {
        type: TOKEN_TYPE.symbol,
        content: 'a',
      },
      {
        type: TOKEN_TYPE.symbol,
        content: 'b',
      },
    ],
  },
  {
    regex: '(ab)c',
    expected: [
      {
        type: TOKEN_TYPE.parenthetical,
        content: 'ab',
      },
      {
        type: TOKEN_TYPE.symbol,
        content: 'c',
      },
    ],
  },
  {
    regex: 'a*',
    expected: [
      {
        type: TOKEN_TYPE.symbol,
        content: 'a',
      },
      {
        type: TOKEN_TYPE.kleeneStar,
        content: '*',
      },
    ],
  },
  {
    regex: 'a|b',
    expected: [
      {
        type: TOKEN_TYPE.symbol,
        content: 'a',
      },
      {
        type: TOKEN_TYPE.union,
        content: '|',
      },
      {
        type: TOKEN_TYPE.symbol,
        content: 'b',
      },
    ],
  },
])('splitRegexIntoTokens', ({ regex, expected }) => {
  const printableExpected = [];
  expected.forEach(({ type, content }) => {
    printableExpected.push(`[${type} ${content}]`);
  });
  it(`${regex} => ${printableExpected}`, () => {
    const tokens = splitRegexIntoTokens(regex);
    expect(tokens).toStrictEqual(expected);
  });
});

describe.each([
  { string: '(a)a', expected: ['a', 'a'] },
  { string: '((a)', expected: 'unbalanced parentheses' },
  { string: '(a))', expected: ['a', ')'] },
])('matchParentheses', ({ string, expected }) => {
  it(`${string} => [${expected}]`, () => {
    try {
      expect(matchParentheses(string)).toStrictEqual(expected);
    } catch (err) {
      expect(err.message).toBe(expected);
    }
  });
});

describe.each([
  { regex: 'a' },
  { regex: 'ab' },
  { regex: '(ab)c' },
  { regex: '(ab)|c' },
  { regex: '(ab)*c' },
  { regex: '((ab)*bc)' },
  { regex: '(abc)|(def)' },
  { regex: '((abc)*abc)|(def)' },
])('regexToMachine', ({ regex }) => {
  const machine = regexToMachine(regex);
  const jsRegex = new RegExp(`^(${regex})$`);
  const words = [
    'a',
    'ab',
    'abc',
    'c',
    'ababc',
    'd',
    '',
    'abbc',
    'bc',
    'ababbc',
    'def',
    'abcabcdef',
  ];
  words.forEach((word) => {
    const shouldAccept = jsRegex.test(word);
    it(`/${regex}/: ${word} => ${shouldAccept}`, () => {
      const path = machine.acceptsWord(word);
      const result = path.length > 0;
      expect(result).toBe(shouldAccept);
    });
  });
});

describe('symbolToMachine', () => {
  it('q0 =a=> q1', () => {
    const expected = {
      q0: { a: ['q1'] },
    };
    const transitionFunction = symbolToMachine('a').getTransitions();
    expect(transitionFunction).toStrictEqual(expected);
  });
});

describe('joinMachines()', () => {
  const params1 = {
    states: ['q0', 'q1'],
    alphabet: ['a'],
    transitionFunction: {
      q0: { a: ['q1'] },
    },
    acceptStates: ['q1'],
    initialState: 'q0',
  };
  const params2 = {
    states: ['q0', 'q1'],
    alphabet: ['b'],
    transitionFunction: {
      q0: { b: ['q1'] },
    },
    acceptStates: ['q1'],
    initialState: 'q0',
  };
  const machine1 = new Machine(params1);
  const machine2 = new Machine(params2);
  const joinedMachine = joinMachines(machine1, machine2);
  const expectedParams = {
    states: ['q0', 'q1', 'q2', 'q3'],
    alphabet: ['a', 'b'],
    transitionFunction: {
      q0: { a: ['q1'] },
      q1: { [EPSILON]: ['q2'] },
      q2: { b: ['q3'] },
    },
    acceptStates: ['q3'],
    initialState: 'q0',
  };

  it('states are correct', () => {
    expect(joinedMachine.getStates())
      .toStrictEqual(expectedParams.states);
  });
  it('alphabet is correct', () => {
    expect(joinedMachine.getAlphabet())
      .toStrictEqual(expectedParams.alphabet);
  });
  it('transitions are correct', () => {
    expect(joinedMachine.getTransitions())
      .toStrictEqual(expectedParams.transitionFunction);
  });
  it('acceptStates are correct', () => {
    expect(joinedMachine.getAcceptStates())
      .toStrictEqual(expectedParams.acceptStates);
  });
  it('initialState is correct', () => {
    expect(joinedMachine.getInitialState())
      .toBe(expectedParams.initialState);
  });
});

