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
  let movingState = null;

  const distance = (x1, x2, y1, y2) => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  }

  const nearbyState = (x, y) => {
    let nearest = null;
    machine.Q.forEach( (value, key) => {
      if (distance(value[0], x, value[1], y) < machine.stateRadius){
        nearest = key;
      }
    })
    return nearest;

  }

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    machine.Q.forEach((value, key) => {
        ctx.beginPath();
        ctx.arc(value[0], value[1], machine.stateRadius, 0, Math.PI * 2, true);
        if (key === selected){
          ctx.fillStyle = '#99AAFF'; // Color of selected state
          ctx.fill();
          ctx.fillStyle = '#111188';
        }
        else{
          ctx.fillStyle = '#000000';
          ctx.stroke();
        }
        if (machine.F.includes(key)){
          ctx.beginPath();
          ctx.arc(value[0], value[1], machine.stateRadius * 0.8, 0, Math.PI * 2, true)
          ctx.stroke();
        }
        ctx.moveTo(value[0] - machine.stateRadius, value[1] - machine.stateRadius);
        ctx.textAlign = "center";
        ctx.font = (machine.stateRadius) + "px serif";
        ctx.fillText(key, value[0], value[1] + 5);
    }) // End forEach
  }

  const handleClick = (e) => {
    let canvX = e.clientX - e.target.offsetLeft;  // X position on canvas of click
    let canvY = e.clientY - e.target.offsetTop;   // Y position on canvas of click
    switch (e.detail) {
      case 1:
        updateSelected(nearbyState(canvX, canvY));
        break;
      case 2:
        if (selected){
          let index = machine.F.indexOf(selected);
          if (index > -1){
            machine.F.splice(index, 1);
          }
          else{
            machine.F.push(selected);
          }
        }
        else {
          // If no state is selected,
          // Create a new state at the location of the double click
          machine.Q.set("q" + machine.Q.size, [canvX, canvY]);
        }
        break;
      case 3:
        break;
      default:
        return;
    }
  };

  let handleMouseMove = (e) => {
    let canvX = e.clientX - e.target.offsetLeft;  // X position on canvas of click
    let canvY = e.clientY - e.target.offsetTop;   // Y position on canvas of click
    if (e.buttons === 1) {
      let clicked = nearbyState(canvX, canvY);
      if (clicked === selected) {
        let x = machine.Q.get(clicked)[0];
        let y = machine.Q.get(clicked)[1];
        machine.Q.set(clicked, [canvX, canvY]);
      }
    }
  }

  let handleKeyPress = (e) => {
    console.log(e);
  }

  return (
    <div>
      <h2>Draw a diagram!</h2>
      <h3>Double-click to create a new state.</h3>
      <Canvas draw={draw} onClick={handleClick} onMouseMove={handleMouseMove} onKeyPress={handleKeyPress}/>
    </div>
  )
}

export default Nfadiagram