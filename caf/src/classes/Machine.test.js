import Machine from './Machine';

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
