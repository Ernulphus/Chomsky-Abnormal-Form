import React, { useState } from 'react';
import Machine, { EPSILON } from '../classes/Machine';

function epsilonToMachine(prefix) {
  const states = [`${prefix}0`, `${prefix}1`];
  const alphabet = [];
  const transitionFunction = {
    [states[0]]: {
      [EPSILON]: [states[1]],
    },
  };
  const acceptStates = [states[1]];
  const initialState = states[0];
  const params = {
    states,
    alphabet,
    transitionFunction,
    acceptStates,
    initialState,
  };
  return new Machine(params);
}

function sequenceToMachine(regex, prefix) {
  const states = [`${prefix}0`];
  Array.from(regex).forEach((letter, index) => {
    states.push(`${prefix}${index + 1}`);
  });
  const alphabet = [];
  Array.from(regex).forEach((letter) => {
    if (alphabet.includes(letter)) return;
    alphabet.push(letter);
  });
  const transitionFunction = {};
  Array.from(regex).forEach((letter, index) => {
    const stateFrom = states[index];
    const stateTo = states[index + 1];
    const transition = { [letter]: [stateTo] };
    transitionFunction[stateFrom] = transition;
  });
  const acceptStates = [`${prefix}${regex.length}`];
  const initialState = [`${prefix}0`];
  const params = {
    states,
    alphabet,
    transitionFunction,
    acceptStates,
    initialState,
  };
  return new Machine(params);
}

export function convertRegex(regex) {
  if (regex === EPSILON) return epsilonToMachine('q');
  return sequenceToMachine(regex, 'q');
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
