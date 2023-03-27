# hunter-codefest-2022-chomsky-abnormal-form

## Boaz Kaufman - Ernulphus  
## Sam Ebersole - AVespaIsNotAMotorCycle  
  
### Idea: create an app similar to [Evan Wallace's FSM designer](https://madebyevan.com/fsm/) that the user can actually run.  

### Machine Class
Represents an NFA.
Has the following methods:
- [X] constructor({ states, alphabet, transitionFunction, acceptStates, intialState })
Creates a new Machine object. Optionally takes an object as its argument, which may contain the following key/val pairs:
  - states: an array of strings describing the names of the machine's states
  - alphabet: an array of characters (size 1 strings) describing accepted letters
  - transitionFunction: an object of the form
  `{  
     state1: {  
       a: [state2, state3],  
       b: [state1],  
     },  
     state2: {  
       a: [state1],  
       b: [state3],  
     },  
     state3: {  
       b: [state3],  
     },  
   }`
  - acceptStates: an array of strings
  - initialState: a string
- [X] addState(name)
Creates a new state with name `name` and with with no transitions to or from it.
- [X] renameState(oldName, newName)
Renames state `oldName` to `newName` and returns the index of the state in `states`.
- [X] hasState(name)
Returns true or false, depending on whether state `name` exists.
- [X] deleteState(state): remove a state, returns the new list of states
- [ ] setStates: replace `states` with given array
- [X] addLetter(letter): adds `letter` to alphabet, returns alphabet
- [X] deleteLetter(letter): removes `letter` from alphabet, returns alphabet
- [X] setAlphabet(alphabet): sets alphabet to `alphabet`, returns alphabet
- [X] getTransitions(fromState)
If a value is passed for `fromState`, it returns all transitions leading from `fromState`.
Otherwise, it returns `transitionFunction`.
- [X] addTransition(fromState, toState, letter)
Adds a transition from `fromState` to `toState` for `letter`.
Returns all transitions from `fromState`.
- [ ] deleteTransition
- [ ] setTransitions: replace transitionFunction with a given object
- [X] addAcceptState(state): append `state` to acceptStates and return acceptStates
- [X] deleteAcceptState(state): remove `state` from acceptStates and return acceptStates
- [ ] setAcceptStates
- [ ] setInitialState
- [X] acceptsWord(word, state)
Takes required parameter `word`, a string, and optional parameter `state`, a string corresponding to the name of a state in `states`. `state` is `initialState` by default. Returns an array of states representing the path to the accept state if the word is accepted, and an empty array if not.

### MVP: User can design a nondeterministic finite state machine and submit strings in the language to run on it. Site is hosted.  
  - [X] Site displays a diagram canvas and stores an object representing the machine
  - [X] Creating a state in the diagram updates representation of the machine
  - [X] Button to submit a string to be run on the machine
  
### Other goals
- [ ] Convert to/from deterministic FAs (HMU 2.3.5)
- [ ] Convert to/from regular expressions (HMU 3.2)
- [ ] State minimization (HMU 4.4.3)

### Sources
- [Hopcroft, Motwani, and Ullman. "Introduction to Automata Theory"](https://drive.google.com/file/d/1g4hUYRvxS7RJSSK9PnZhcbIAkUYvFMSA/view?usp=sharing)
- [Canvas with React.js](https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258)
- [React Diagrams](https://github.com/projectstorm/react-diagrams)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
