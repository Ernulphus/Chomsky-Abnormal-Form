import React, { useState } from 'react';
import Canvas from './Canvas';

function initializeStates() {
  const states = new Map();
  states.set('q0', [100, 100]);
  return states;
}

function NFADiagram() {
  const [selected, updateSelected] = useState();

  const stateRadius = 30;
  const [machineStates] = useState(initializeStates());
  const [alphabet] = useState(['a', 'b']);
  const [transitionFunction] = useState([]);
  const [acceptStates] = useState([]);

  const distance = (x1, x2, y1, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

  const nearbyState = (x, y) => {
    let nearest = null;
    machineStates.forEach((value, key) => {
      if (distance(value[0], x, value[1], y) < stateRadius) {
        nearest = key;
      }
    });
    return nearest;
  };

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    machineStates.forEach((value, key) => {
      ctx.beginPath();
      ctx.arc(value[0], value[1], stateRadius, 0, Math.PI * 2, true);
      if (key === selected) {
        ctx.fillStyle = '#99AAFF'; // Color of selected state
        ctx.fill();
        ctx.fillStyle = '#111188';
      } else {
        ctx.fillStyle = '#000000';
        ctx.stroke();
      }
      if (acceptStates.includes(key)) {
        ctx.beginPath();
        ctx.arc(value[0], value[1], stateRadius * 0.8, 0, Math.PI * 2, true);
        ctx.stroke();
      }
      ctx.moveTo(value[0] - stateRadius, value[1] - stateRadius);
      ctx.textAlign = 'center';
      ctx.font = `${stateRadius}px serif`;
      ctx.fillText(key, value[0], value[1] + 5);
    }); // End forEach
  };

  const handleClick = (e) => {
    const canvX = e.clientX - e.target.offsetLeft; // X position on canvas of click
    const canvY = e.clientY - e.target.offsetTop; // Y position on canvas of click
    switch (e.detail) {
      case 1:
        // alt click to 'delete' the selected state
        if (e.altKey && selected) {
          // To not fuck things up, move this state to last state and delete last state
          machineStates.set(selected, machineStates.get(`q${machineStates.size - 1}`));
          console.log('deleting');
          machineStates.delete(`q + ${machineStates.size - 1}`);
          updateSelected(null);
        } else if (e.shiftKey && selected) {
          // Create a transition to another state
          const dest = nearbyState(canvX, canvY);
          if (dest) {
            transitionFunction.push({
              [selected]: { [alphabet[0]]: dest },
            });
            console.log(transitionFunction);
            console.log('Adding transition');
          }
        } else {
          updateSelected(nearbyState(canvX, canvY));
        }
        break;
      case 2:
        if (selected) {
          const index = acceptStates.indexOf(selected);
          if (index > -1) {
            acceptStates.splice(index, 1);
          } else {
            acceptStates.push(selected);
          }
        } else {
          // If no state is selected,
          // Create a new state at the location of the double click
          machineStates.set(`q${machineStates.size}`, [canvX, canvY]);
        }
        break;
      case 3:
        break;
      default:
    }
  };

  const handleMouseMove = (e) => {
    const canvX = e.clientX - e.target.offsetLeft; // X position on canvas of click
    const canvY = e.clientY - e.target.offsetTop; // Y position on canvas of click
    if (e.buttons === 2 && selected) {
      machineStates.set(selected, [canvX, canvY]);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <h2>Draw a diagram!</h2>
      <Canvas
        draw={draw}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
      />
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
