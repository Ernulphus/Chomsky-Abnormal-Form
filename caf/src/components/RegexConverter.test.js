import {
  joinMachines,
  matchParentheses,
} from './RegexConverter';
import Machine, { EPSILON } from '../classes/Machine';

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
