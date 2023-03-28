import React, { useState } from 'react';
import Machine, { EPSILON } from '../classes/Machine';

const EMPTY_PARAMS = {
  states: ['q0', 'q1'],
  alphabet: [],
  transitionFunction: {
    q0: { [EPSILON]: ['q1'] },
  },
  acceptStates: ['q1'],
  initialState: 'q0',
};

export function replaceStateWithMachine(patientMachine, stateToReplace, replacementMachine) {
  const nameMap = {};
  replacementMachine.getStates().forEach((state) => {
    const index = patientMachine.getStates().length + Object.keys(nameMap).length;
    nameMap[state] = `q${index}`;
  });
  Object.keys(nameMap).forEach((state) => {
    patientMachine.addState(nameMap[state]);
  });

  replacementMachine.getAlphabet().forEach((letter) => {
    patientMachine.addLetter(letter);
  });

  Object.keys(replacementMachine.getTransitions()).forEach((stateFromOldName) => {
    Object.keys(replacementMachine.getTransitions(stateFromOldName)).forEach((letter) => {
      replacementMachine.getTransitions(stateFromOldName, letter).forEach((stateToOldName) => {
        const stateFromNewName = nameMap[stateFromOldName];
        const stateToNewName = nameMap[stateToOldName];
        patientMachine.addTransition(stateFromNewName, stateToNewName, letter);
      });
    });
  });

  const transitionsToReplacedState = patientMachine.getTransitionsTo(stateToReplace);
  const initialStateOldName = replacementMachine.getInitialState();
  Object.keys(transitionsToReplacedState).forEach((letter) => {
    transitionsToReplacedState[letter].forEach((stateFrom) => {
      patientMachine.addTransition(stateFrom, nameMap[initialStateOldName], letter);
    });
  });

  const transitionsFromReplacedState = patientMachine.getTransitions(stateToReplace);
  const acceptStatesOldNames = replacementMachine.getAcceptStates();
  Object.keys(transitionsFromReplacedState).forEach((letter) => {
    const statesTo = patientMachine.getTransitions(stateToReplace, letter);
    statesTo.forEach((stateTo) => {
      acceptStatesOldNames.forEach((oldName) => {
        patientMachine.addTransition(nameMap[oldName], stateTo, letter);
      });
    });
  });

  patientMachine.deleteState(stateToReplace);
  return patientMachine;
}

export function joinMachines(machine1, machine2) {
  const nameMap1 = {};
  const nameMap2 = {};
  machine1.getStates().forEach((state) => {
    const index = Object.keys(nameMap1).length + Object.keys(nameMap2).length;
    nameMap1[state] = `q${index}`;
  });
  machine2.getStates().forEach((state) => {
    const index = Object.keys(nameMap1).length + Object.keys(nameMap2).length;
    nameMap2[state] = `q${index}`;
  });

  const states = []
    .concat(Object.keys(nameMap1).map((oldName) => nameMap1[oldName]))
    .concat(Object.keys(nameMap2).map((oldName) => nameMap2[oldName]));

  const alphabet = machine1.getAlphabet();
  machine2.getAlphabet().forEach((letter) => {
    if (alphabet.includes(letter)) return;
    alphabet.push(letter);
  });

  const transitionFunction = {};
  const addTransitions = (machine, nameMap) => {
    const transitions = machine.getTransitions();
    Object.keys(transitions).forEach((stateFrom) => {
      const transitionsFrom = machine.getTransitions(stateFrom);
      Object.keys(transitionsFrom).forEach((letter) => {
        const oldStatesTo = machine.getTransitions(stateFrom, letter);
        const newStatesTo = oldStatesTo.map((oldName) => nameMap[oldName]);
        transitionFunction[stateFrom] = { [letter]: newStatesTo };
      });
    });
  };
  addTransitions(machine1, nameMap1);
  addTransitions(machine2, nameMap2);
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

export const TOKEN_TYPE = {
  parenthetical: '()',
  kleeneStar: '*',
  concatenation: 'concat',
  union: '|',
  symbol: 'symbol',
  empty: EPSILON,
};
export function splitRegexIntoTokens(regex) {
  const tokens = [];
  let remainingExpression = regex;
  while (remainingExpression.length > 0) {
    const newToken = {
      type: undefined,
      content: undefined,
    };
    switch (remainingExpression[0]) {
      case '(': {
        const [content, newRemainingExpression] = matchParentheses(remainingExpression);
        newToken.type = TOKEN_TYPE.parenthetical;
        newToken.content = content;
        remainingExpression = newRemainingExpression;
        break;
      }
      case '*':
        newToken.type = TOKEN_TYPE.kleeneStar;
        newToken.content = '*';
        remainingExpression = remainingExpression.slice(1);
        break;
      case '|':
        newToken.type = TOKEN_TYPE.union;
        newToken.content = '|';
        remainingExpression = remainingExpression.slice(1);
        break;
      default:
        newToken.type = TOKEN_TYPE.symbol;
        [newToken.content] = remainingExpression;
        remainingExpression = remainingExpression.slice(1);
    }
    tokens.push(newToken);
  }
  return tokens;
}

function symbolToMachine(symbol) {
  const states = ['q0', 'q1'];
  const alphabet = [symbol];
  const transitionFunction = {
    q0: { [symbol]: ['q1'] },
  };
  const acceptStates = ['q1'];
  const initialState = 'q0';
  const params = {
    states,
    alphabet,
    transitionFunction,
    acceptStates,
    initialState,
  };
  return new Machine(params);
}

function unionToMachine(machineA, machineB) {
  const states = ['q0', 'q1', 'q2', 'q3'];
  const alphabet = [];
  const transitionFunction = {
    q0: { [EPSILON]: ['q1', 'q2'] },
    q1: { [EPSILON]: ['q3'] },
    q2: { [EPSILON]: ['q3'] },
  };
  const acceptStates = ['q3'];
  const initialState = 'q0';
  const params = {
    states,
    alphabet,
    transitionFunction,
    acceptStates,
    initialState,
  };

  const machine = new Machine(params);
  replaceStateWithMachine(machine, 'q1', machineA);
  replaceStateWithMachine(machine, 'q2', machineB);
  return machine;
}

function kleeneStarToMachine(starMachine) {
  const states = ['q0', 'q1', 'q2'];
  const alphabet = [];
  const transitionFunction = {
    q0: { [EPSILON]: ['q1', 'q2'] },
    q1: { [EPSILON]: ['q0', 'q2'] },
  };
  const acceptStates = ['q2'];
  const initialState = 'q0';
  const params = {
    states,
    alphabet,
    transitionFunction,
    acceptStates,
    initialState,
  };

  const machine = new Machine(params);
  replaceStateWithMachine(machine, 'q1', starMachine);
  return machine;
}

export function regexToMachine(regex) {
  let tokens = splitRegexIntoTokens(regex);
  let machine = new Machine(EMPTY_PARAMS);
  while (tokens.length > 0) {
    const firstToken = tokens[0];
    const secondToken = (tokens.length > 1 ? tokens[1] : undefined);
    const thirdToken = (tokens.length > 2 ? tokens[2] : undefined);
    if (secondToken && secondToken.type === TOKEN_TYPE.kleeneStar) {
      const starMachine = regexToMachine(firstToken.content);
      machine = joinMachines(
        machine,
        kleeneStarToMachine(starMachine),
      );
      tokens = tokens.slice(2);
    } else if (secondToken && secondToken.type === TOKEN_TYPE.union) {
      if (!thirdToken) throw new Error('no second argument to union');
      const machineA = regexToMachine(firstToken.content);
      const machineB = regexToMachine(thirdToken.content);
      machine = joinMachines(
        machine,
        unionToMachine(machineA, machineB),
      );
      tokens = tokens.slice(3);
    } else {
      switch (firstToken.type) {
        case TOKEN_TYPE.parenthetical:
          machine = joinMachines(
            machine,
            regexToMachine(firstToken.content),
          );
          break;
        case TOKEN_TYPE.symbol:
          machine = joinMachines(
            machine,
            symbolToMachine(firstToken.content),
          );
          break;
        default:
      }
      tokens = tokens.slice(1);
    }
  }
  return machine;
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
