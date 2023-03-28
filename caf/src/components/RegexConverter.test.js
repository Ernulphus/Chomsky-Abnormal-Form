import {
  joinMachines,
  matchParentheses,
  regexToMachine,
  splitRegexIntoTokens,
  TOKEN_TYPE,
} from './RegexConverter';
import Machine, { EPSILON } from '../classes/Machine';

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
])('regexToMachine', ({ regex }) => {
  const machine = regexToMachine(regex);
  const states = machine.getStates();
  it(`${regex} => ${states}`, () => {
  });
});

describe('joinMachines()', () => {
  it('joins 2 NFAs', () => {
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
      states: ['q2', 'q3'],
      alphabet: ['b'],
      transitionFunction: {
        q2: { b: ['q3'] },
      },
      acceptStates: ['q3'],
      initialState: 'q2',
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
    expect(joinedMachine.getStates())
      .toStrictEqual(expectedParams.states);
    expect(joinedMachine.getAlphabet())
      .toStrictEqual(expectedParams.alphabet);
    expect(joinedMachine.getTransitions())
      .toStrictEqual(expectedParams.transitionFunction);
    expect(joinedMachine.getAcceptStates())
      .toStrictEqual(expectedParams.acceptStates);
    expect(joinedMachine.getInitialState())
      .toBe(expectedParams.initialState);
  });
});
