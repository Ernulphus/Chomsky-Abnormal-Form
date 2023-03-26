import React, { useState } from 'react';
import Canvas from './Canvas';
import Machine from '../classes/Machine';

const MOUSE_BUTTON = {
  leftClick: 0,
  auxClick: 1,
  rightClick: 2,
  backClick: 3,
  forwardClick: 4,
};

const CLICKS = {
  singleClick: 1,
  doubleClick: 2,
};

function generateInitialCoordinates(states) {
  const coordinates = {};
  states.forEach((state, index) => {
    coordinates[state] = [(index + 1) * 100, 100];
  });
  return coordinates;
}

function NFADiagram() {
  const [selected, setSelected] = useState();
  const [enteringName, setEnteringName] = useState(false);
  const [stateName, setStateName] = useState('');
  const [stateCounter, setStateCounter] = useState(1);

  const [machine] = useState(new Machine());
  const [stateCoords] = useState(generateInitialCoordinates(machine.states));

  const [word, setWord] = useState('');
  const [wordResult, setWordResult] = useState('');

  const stateRadius = 30;
  const distance = (x1, x2, y1, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

  // Returns the state clicked on, or null if there's none
  const nearbyState = (mouseX, mouseY) => {
    let nearest = null;
    Object.keys(stateCoords).forEach((key) => {
      const [stateX, stateY] = stateCoords[key];
      if (distance(stateX, mouseX, stateY, mouseY) < stateRadius) {
        nearest = key;
      }
    });
    return nearest;
  };

  const drawStates = (ctx) => {
    Object.keys(stateCoords).forEach((key) => {
      const [x, y] = stateCoords[key];
      ctx.beginPath();
      ctx.arc(x, y, stateRadius, 0, Math.PI * 2, true);
      if (key === selected) {
        ctx.fillStyle = '#99AAFF'; // Color of selected state
      } else {
        ctx.fillStyle = '#FFFFFF';
      }
      ctx.fill();
      ctx.stroke();
      if (machine.getAcceptStates().includes(key)) {
        ctx.beginPath();
        ctx.arc(x, y, stateRadius * 0.8, 0, Math.PI * 2, true);
        ctx.stroke();
      }
      ctx.moveTo(x - stateRadius, y - stateRadius);
      ctx.textAlign = 'center';
      ctx.font = `${stateRadius}px serif`;
      ctx.fillStyle = '#000000';
      ctx.fillText(key, x, y + 5);
      ctx.stroke();
    }); // End of drawing states
  };

  const drawTransitions = (ctx) => {
    const delta = machine.getTransitions();
    Object.keys(delta).forEach((fromState) => {
      Object.keys(delta[fromState]).forEach((letter) => {
        delta[fromState][letter].forEach((toState) => {
          ctx.beginPath();
          const [fromX, fromY] = stateCoords[fromState];
          const [toX, toY] = stateCoords[toState];
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.moveTo((toX + fromX) / 2, (toY + toY) / 2);
          ctx.stroke();
        });
      });
    });
  };

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawTransitions(ctx);
    drawStates(ctx);
  };

  const handleClick = (e) => {
    const canvX = e.clientX - e.target.offsetLeft; // X position on canvas of click
    const canvY = e.clientY - e.target.offsetTop; // Y position on canvas of click
    const deleteSelected = e.altKey && selected;
    const newTransition = e.shiftKey && selected;
    switch (e.detail) {
      case CLICKS.singleClick:
      {
        if (deleteSelected) {
          machine.deleteState(selected);
          delete stateCoords[selected];
          setSelected(null);
          break;
        }
        if (newTransition) {
          const dest = nearbyState(canvX, canvY);
          if (dest) {
            console.log(machine.addTransition(selected, dest, machine.alphabet[0]));
          }
          break;
        }
        // Click with no keys pressed
        setSelected(nearbyState(canvX, canvY));
        break;
      }
      case CLICKS.doubleClick:
      {
        if (selected) {
          // Turn selected state into an accept state
          if (machine.hasAcceptState(selected)) {
            machine.deleteAcceptState(selected);
          } else {
            machine.addAcceptState(selected);
          }
          break;
        }
        // If no state is selected,
        // Create a new state at the location of the double click
        const newName = `q${stateCounter}`;
        setStateCounter(stateCounter + 1);
        machine.addState(newName);
        stateCoords[newName] = [canvX, canvY];

        break;
      }
      case 3:
      {
        break;
      }
      default:
    }
  };

  const handleMouseMove = (e) => {
    const canvX = e.clientX - e.target.offsetLeft; // X position on canvas of click
    const canvY = e.clientY - e.target.offsetTop; // Y position on canvas of click
    if (e.buttons === MOUSE_BUTTON.rightClick && selected) {
      stateCoords[selected] = [canvX, canvY];
    }
  };

  const handleKeyPress = (e) => {
    if (!selected) return;

    if (e.key === 'Enter') {
      if (!enteringName) { setEnteringName(true); return; }
      setEnteringName(false);
      setStateName('');
      return;
    }
    const newStateName = `${stateName}${e.key}`;
    setStateName(newStateName);
    setSelected(newStateName);
    machine.renameState(selected, newStateName);
    stateCoords[newStateName] = stateCoords[selected];
    delete stateCoords[selected];
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const updateWord = (e) => {
    setWord(e.target.value);
  };

  const checkWord = () => {
    const path = machine.acceptsWord(word);
    if (path.length) {
      setWordResult('Word is in the language of this machine!');
    } else {
      setWordResult('Word is not in this language.');
    }
  };

  return (
    <div>
      <h2>Draw a diagram!</h2>
      <Canvas
        draw={draw}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
        onKeyPress={handleKeyPress}
      />
      <input onChange={updateWord} />
      <button type="button" onClick={checkWord}>Enter</button>
      {wordResult && <h2>{wordResult}</h2>}
      <h3>
        Double-click to create a new state.
        <br />
        Click on a state to select it.
        <br />
        Double-click a selected state to make it an accepting state.
        <br />
        Alt-click a selected state to delete it.
        <br />
        Shift-click a state to add a transition from the selected state.
        <br />
        Right-click and drag to move the selected state.
      </h3>
    </div>
  );
}

export default NFADiagram;
