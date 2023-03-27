import { convertRegex } from './RegexConverter';
import { EPSILON } from '../classes/Machine';

function generateWord(length, alphabet) {
  let word = '';
  for (let iter = 0; iter < length; iter += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    word = word.concat(alphabet[index]);
  }
  return word;
}

const generalAlphabet = Array.from('abcdefghijklmnopqrstuvwxyz');

describe(EPSILON, () => {
  it(`q0: ${EPSILON} => [q1], ((q1))`, () => {
    const machine = convertRegex(EPSILON);
    const acceptStates = machine.getAcceptStates();
    expect(acceptStates).toStrictEqual(['q1']);
    const transitionFunction = machine.getTransitions();
    expect(transitionFunction).toStrictEqual({
      q0: {
        [EPSILON]: ['q1'],
      },
    });
  });
});

describe('ab', () => {
  it(`q0: a => [q1], q1: b => [q2], ((q2))`, () => {
    const machine = convertRegex('ab');
    const acceptStates = machine.getAcceptStates();
    expect(acceptStates).toStrictEqual(['q2']);
    const transitionFunction = machine.getTransitions();
    expect(transitionFunction).toStrictEqual({
      q0: {
        a: ['q1'],
      },
      q1: {
        b: ['q2'],
      },
    });
  });
});
