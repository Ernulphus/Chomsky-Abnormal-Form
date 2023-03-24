import Machine from './Machine';

function arraysAreEquivalent(array1, array2) {
  if (array1.length !== array2.length) return false;
  for (let i = 0; i < array1.length; i += 1) {
    const element1 = array1[i];
    const element2 = array2[i];
    if (typeof element1 !== typeof element2) return false;
    if (Array.isArray(element1)) {
      if (!arraysAreEquivalent(element1, element2)) return false;
    }
    if (element1 !== element2) { return false; }
  }
  return true;
}

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
])('addTransition', ({ desc, states, transitions }) => {
  it(desc, () => {
    const machine = new Machine();
    states.forEach((state) => { machine.addState(state); });
    transitions.forEach((transition) => {
      const [from, to, letter] = transition;
      const transitionFunction = machine.addTransition(from, to, letter);
      const expectedElement = [letter, to];
      const wasAdded = transitionFunction.findIndex((element) => arraysAreEquivalent(expectedElement, element));
      expect(wasAdded).not.toBe(-1);
    });
  });
});

describe.each([
  {
    desc: 'renaming after addTransition updates transitions',
    states: ['q0', 'q1'],
    transitions: [['q0', 'q1', 'a']],
    rename: [['q0', 'initial']],
  },
])('addTransition', ({ desc, states, transitions, rename }) => {
  it(desc, () => {
    const machine = new Machine();
    states.forEach((state) => { machine.addState(state); });
    transitions.forEach((transition) => {
      const [from, to, letter] = transition;
      const transitionFunction = machine.addTransition(from, to, letter);
      const expectedElement = [letter, to];
      const wasAdded = transitionFunction.findIndex((element) => arraysAreEquivalent(expectedElement, element));
      expect(wasAdded).not.toBe(-1);
    });
    rename.forEach((update) => {
      const [oldName, newName] = update;
      const transition = machine.getTransitions(oldName);
      machine.renameState(oldName, newName);
      expect(machine.getTransitions(oldName)).toStrictEqual([]);
      expect(machine.getTransitions(newName)).toStrictEqual(transition);
    });
  });
});
