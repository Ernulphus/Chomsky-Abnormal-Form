import React, { useState } from 'react';
import Machine, { EPSILON } from '../classes/Machine';

export function joinMachines(machine1, machine2) {
  const states = []
    .concat(machine1.getStates())
    .concat(machine2.getStates());

  const alphabet = machine1.getAlphabet();
  machine2.getAlphabet().forEach((letter) => {
    if (alphabet.includes(letter)) return;
    alphabet.push(letter);
  });

  const transitionFunction = {};
  const addTransitions = (machine) => {
    const transitions = machine.getTransitions();
    Object.keys(transitions).forEach((stateFrom) => {
      const transitionsFrom = machine.getTransitions(stateFrom);
      Object.keys(transitionsFrom).forEach((letter) => {
        const statesTo = machine.getTransitions(stateFrom, letter);
        transitionFunction[stateFrom] = { [letter]: statesTo };
      });
    });
  };
  addTransitions(machine1);
  addTransitions(machine2);
  transitionFunction[machine1.getAcceptStates()[0]] = {
    [EPSILON]: [machine2.getInitialState()],
  };

  const acceptStates = machine2.getAcceptStates();
  const initialState = machine1.getInitialState();

  const params = {
    states,
    alphabet,
    transitionFunction,
    acceptStates,
    initialState,
  };
  return new Machine(params);
}

export function matchParentheses(string) {
  if (string[0] !== '(') return ['', string];
  let unclosedParenAmount = 0;
  for (let i = 0; i < string.length; i += 1) {
    if (string[i] === '(') unclosedParenAmount += 1;
    if (string[i] === ')') unclosedParenAmount -= 1;
    if (unclosedParenAmount === 0) {
      return [
        string.slice(1, i),
        string.slice(i + 1),
      ];
    }
  }
  throw new Error('unbalanced parentheses');
}

function RegexConverter() {
  const [regex, setRegex] = useState('');

  return (
    <div>
      <input
        placeholder="Enter regular expression here"
        onChange={setRegex}
        value={regex}
      />
    </div>
  );
}

export default RegexConverter;
