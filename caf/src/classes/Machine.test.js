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
