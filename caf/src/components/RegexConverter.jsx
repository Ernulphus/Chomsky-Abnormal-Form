import React, { useState } from 'react';
import propTypes from 'prop-types';
import Machine, { EPSILON } from '../classes/Machine';

export function printTransitionFunction(machine) {
  const states = machine.getStates();
  const alphabet = machine.getAlphabet().concat([EPSILON]);
  const maxLengths = {};
  let output = machine.getInitialState().concat('\n  |');
  states.forEach((state) => {
    maxLengths[state] = 1;
    Object.keys(machine.getTransitions(state)).forEach((letter) => {
      if (machine.getTransitions(state, letter).length > maxLengths[state]) {
        maxLengths[state] = machine.getTransitions(state, letter).length;
      }
    });
    let toString = state;
    while (toString.length < maxLengths[state] * 3) { toString = toString.concat(' '); }
    output = output.concat(` ${toString}|`);
  });
  alphabet.forEach((letter) => {
    let rowString = `${letter} |`;
    states.forEach((state) => {
      let toString = machine.getTransitions(state, letter).join();
      while (toString.length < maxLengths[state] * 3) { toString = toString.concat(' '); }
      rowString = rowString.concat(` ${toString}|`);
    });
    output = output.concat(`\n${rowString}`);
  });
  output = output.concat('\n').concat(machine.getAcceptStates().join());
  console.log(output);
}

const EMPTY_PARAMS = {
  states: ['q0', 'q1'],
  alphabet: [],
  transitionFunction: {
    q0: { [EPSILON]: ['q1'] },
  },
  acceptStates: ['q1'],
  initialState: 'q0',
};

function ensureNameOrder(machine) {
  const initialNames = machine.getStates();
  initialNames.forEach((name, index) => {
    machine.renameState(name, `q${index}`);
  });
}

export function replaceStateWithMachine(patientMachine, stateToReplace, replacementMachine) {
  const nameMap = {};
  replacementMachine.getStates().forEach((oldName) => {
    const index = patientMachine.getStates().length + Object.keys(nameMap).length;
    nameMap[oldName] = `q${index}`;
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
  ensureNameOrder(patientMachine);
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
        const newStateFrom = nameMap[stateFrom];
        if (!transitionFunction[newStateFrom]) {
          transitionFunction[newStateFrom] = { [letter]: newStatesTo };
          return;
        }
        if (!transitionFunction[newStateFrom][letter]) {
          transitionFunction[newStateFrom][letter] = newStatesTo;
          return;
        }
        transitionFunction[newStateFrom][letter] =
        transitionFunction[newStateFrom][letter].concat(newStatesTo);
      });
    });
  };
  addTransitions(machine1, nameMap1);
  addTransitions(machine2, nameMap2);

  const oldM1Final = machine1.getAcceptStates()[0];
  const oldM2Initial = machine1.getInitialState();
  const newM1Final = nameMap1[oldM1Final];
  const newM2Initial = nameMap2[oldM2Initial];
  transitionFunction[newM1Final] = {
    [EPSILON]: [newM2Initial],
  };

  const [oldAcceptState] = machine2.getAcceptStates();
  const acceptStates = [nameMap2[oldAcceptState]];
  const initialState = nameMap1[machine1.getInitialState()];

  const params = {
    states,
    alphabet,
    transitionFunction,
    acceptStates,
    initialState,
  };

  const newMachine = new Machine(params);
  return newMachine;
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

export function symbolToMachine(symbol) {
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

export function unionToMachine(machineA, machineB) {
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
  replaceStateWithMachine(machine, 'q1', machineB);
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

    const kleeneStar = tokens.length > 1 && tokens[1].type === TOKEN_TYPE.kleeneStar;
    const parenthetical = tokens[0].type === TOKEN_TYPE.parenthetical;
    const union = tokens.length > 2 && tokens[1].type === TOKEN_TYPE.union;
    const symbol = tokens[0].type === TOKEN_TYPE.symbol;

    if (kleeneStar) {
      const starMachine = regexToMachine(firstToken.content);
      machine = joinMachines(
        machine,
        kleeneStarToMachine(starMachine),
      );
      tokens = tokens.slice(2);
    } else if (union) {
      const thirdToken = (tokens.length > 2 ? tokens[2] : undefined);
      const machineA = regexToMachine(firstToken.content);
      const machineB = regexToMachine(thirdToken.content);
      machine = joinMachines(
        machine,
        unionToMachine(machineA, machineB),
      );
      tokens = tokens.slice(3);
    } else if (parenthetical) {
      const parenContent = regexToMachine(firstToken.content);
      machine = joinMachines(
        machine,
        parenContent,
      );
      tokens = tokens.slice(1);
    } else if (symbol) {
      machine = joinMachines(
        machine,
        symbolToMachine(firstToken.content),
      );
      tokens = tokens.slice(1);
    } else {
      throw new Error('invalid token');
    }
  }
  ensureNameOrder(machine);
  machine.removeEpsilonTransitions();
  ensureNameOrder(machine);
  return machine;
}

function MachineDetails({ machine }) {
  if (!machine) return null;
  const states = machine.getStates();
  const alphabet = machine.getAlphabet();
  const alphabetWithEpsilon = [EPSILON].concat(alphabet);

  const transitionTableHeaders = states.map((state) => <th key={state}>{state}</th>);
  const transitionTableRows = alphabetWithEpsilon.map((letter) => {
    const cells = [<td key={letter}>{letter}</td>];
    states.forEach((stateFrom) => {
      cells.push((
        <td key={`${stateFrom}${letter}`}>
          {machine.getTransitions(stateFrom, letter).join(', ')}
        </td>
      ));
    });
    return <tr>{cells}</tr>;
  });

  return (
    <div>
      <section>
        <h2>States</h2>
        {states.join(', ')}
      </section>
      <section>
        <h2>Alphabet</h2>
        {alphabet.join(', ')}
      </section>
      <section>
        <h2>Transition Function</h2>
        <table>
          <thead>
            <tr>
              <th>From:</th>
              {transitionTableHeaders}
            </tr>
          </thead>
          <tbody>
            {transitionTableRows}
          </tbody>
        </table>
      </section>
    </div>
  );
}

MachineDetails.propTypes = {
  machine: propTypes.instanceOf(Object),
};

MachineDetails.defaultProps = {
  machine: null,
};

function RegexConverter({ sendNewMachine }) {
  const [regex, setRegex] = useState('');
  const [machine, setMachine] = useState();

  const submitHandler = () => {
    const newMachine = regexToMachine(regex);
    setMachine(newMachine);
    sendNewMachine(newMachine);
  };

  return (
    <div>
      <input
        placeholder="Enter regular expression here"
        onChange={(e) => { setRegex(e.target.value); }}
        value={regex}
      />
      <button type="button" onClick={submitHandler}>
        Convert
      </button>
      <MachineDetails machine={machine} />
    </div>
  );
}

RegexConverter.propTypes = {
  sendNewMachine: propTypes.func,
};

RegexConverter.defaultProps = {
  sendNewMachine: () => {},
};

export default RegexConverter;
