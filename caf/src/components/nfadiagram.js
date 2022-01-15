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
  )

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000000'
    machine.Q.forEach((value, key) => {
        ctx.beginPath();
        ctx.arc(value[0], value[1], machine.stateRadius, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.moveTo(value[0] - machine.stateRadius, value[1] - machine.stateRadius);
        ctx.textAlign = "center";
        ctx.font = (machine.stateRadius) + "px serif";
        ctx.fillText(key, value[0], value[1]);
    })
  }

  const handleClick = (e) => {
    switch (e.detail) {
      case 1:
        console.log("click");
        break;
      case 2:
        console.log(e);
        machine.Q.set("q" + machine.Q.size, [e.clientX - e.target.offsetLeft, e.clientY - e.target.offsetTop]);
        console.log(machine);
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