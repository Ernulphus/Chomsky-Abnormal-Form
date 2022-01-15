import React, { useState } from 'react'
import Canvas from './Canvas'

const Nfadiagram = (props) => {

  const states = new Map();
  states.set('q0', [100, 100]);
  const [machine, updateMachine] = useState(
    {
      Q: states,
      Sigma: [],
      q0: "q0",
      F: [],
      stateRadius: 30
    }
  );
  const [selected, updateSelected] = useState();

  const selectNear = (x, y) => {
    let nearest = selected;
    machine.Q.forEach( (value, key) => {
      if (Math.sqrt(Math.pow(value[0] - x, 2) + Math.pow(value[1] - y, 2)) < machine.stateRadius){
        nearest = key;
      }
    })
    if (nearest == selected) {
      updateSelected("");
    }
    else {
      updateSelected(nearest);
    }
  }

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    machine.Q.forEach((value, key) => {
        ctx.beginPath();
        ctx.arc(value[0], value[1], machine.stateRadius, 0, Math.PI * 2, true);
        if (key == selected){
          ctx.fillStyle = '#99AAFF'; // Color of selected state
          ctx.fill();
          ctx.fillStyle = '#111188';
        }
        else{
          ctx.fillStyle = '#000000';
          ctx.stroke();
        }
        ctx.moveTo(value[0] - machine.stateRadius, value[1] - machine.stateRadius);
        ctx.textAlign = "center";
        ctx.font = (machine.stateRadius) + "px serif";
        ctx.fillText(key, value[0], value[1]);
    })
  }

  const handleClick = (e) => {
    let canvX = e.clientX - e.target.offsetLeft;  // X position on canvas of click
    let canvY = e.clientY - e.target.offsetTop;   // Y position on canvas of click
    switch (e.detail) {
      case 1:
        selectNear(canvX, canvY);
        console.log(e);
        break;
      case 2:
        // Create a new state at the location of the double click
        machine.Q.set("q" + machine.Q.size, [canvX, canvY]);
        break;
      case 3:
        console.log("triple click");
        break;
      default:
        return;
    }
  };

  return (
    <div>
      <h2>Draw a diagram!</h2>
      <h3>Double-click to create a new state.</h3>
      <Canvas draw={draw} onClick={handleClick}/>
    </div>
  )
}

export default Nfadiagram