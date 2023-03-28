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
  const transitions1 = machine1.getTransitions();
  const transitions2 = machine2.getTransitions();
  Object.keys(transitions1).forEach((stateFrom) => {
    const transitionsFrom = machine1.getTransitions(stateFrom);
    Object.keys(transitionsFrom).forEach((letter) => {
      const statesTo = machine1.getTransitions(stateFrom, letter);
      transitionFunction[stateFrom] = { [letter]: statesTo };
    });
  });
  Object.keys(transitions2).forEach((stateFrom) => {
    const transitionsFrom = machine2.getTransitions(stateFrom);
    Object.keys(transitionsFrom).forEach((letter) => {
      const statesTo = machine2.getTransitions(stateFrom, letter);
      transitionFunction[stateFrom] = { [letter]: statesTo };
    });
  });
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

export function convertRegex(regex) {
  return new Machine();
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
