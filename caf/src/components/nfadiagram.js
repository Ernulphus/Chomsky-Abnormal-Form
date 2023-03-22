import React, { useState } from 'react'
import Canvas from './Canvas'

const Nfadiagram = (props) => {

  const states = new Map();
  states.set('q0', [100, 100]);
  const [machine, updateMachine] = useState(
    {
      Q: states,
      Sigma: ["a", "b"], // Alphabet of the language
      Delta: {}, // Transition function
      q0: "q0", // Initial state
      F: [], // Accept states
      stateRadius: 30 // This should prob just be a const but it would be too annoying to change
    }
  );
  const [selected, updateSelected] = useState();
  const [qName, updateQName] = useState("");
  const [enteringName, updateEnteringName] = useState(false);
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
        // alt click to 'delete' the selected state
        if (e.altKey && selected){
          // To not fuck things up, move this state to last state and delete last state
          machine.Q.set(selected, machine.Q.get("q" + (machine.Q.size - 1)));
          console.log("deleting");
          machine.Q.delete("q" + (machine.Q.size - 1));
          updateSelected(null);
        }
        else if (e.shiftKey && selected){
          // Create a transition to another state
          let dest = nearbyState(canvX,canvY);
          if (dest){
            machine.Delta.set(selected[machine.Sigma[0]].push(dest));
            console.log(machine.Delta);
            console.log("Adding transition")
          }
        }
        else {
          updateSelected(nearbyState(canvX, canvY));
        }
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
    if (e.buttons === 2 && selected) {
      machine.Q.set(selected, [canvX, canvY]);
    }
  }

  let handleKeyPress = (e) => {
    console.log(e.key)
    if (e.key === "Enter" && selected) {
      if (!enteringName) {updateEnteringName(true);}
      else {
        console.log(machine.Q.get(selected))
        machine.Q.set(qName, machine.Q.get(selected));
        machine.Q.delete(selected)
        updateEnteringName(false)
      }
    }
    else if (enteringName) {
      updateQName(qName + e.key);
      console.log(qName)
    }
  }

  let handleContextMenu = (e) => {
    e.preventDefault();
  }

  return (
    <div>
      <h2>Draw a diagram!</h2>
      <Canvas draw={draw} onClick={handleClick} onMouseMove={handleMouseMove} tabIndex="0" onContextMenu={handleContextMenu} onKeyPress={handleKeyPress}/>
      <h3>
        Double-click to create a new state. <br />
        Click on a state to select it. <br />
        Double-click a selected state to make it an accepting state. <br />
        Alt-click a selected state to delete it. <br />
        Shift-click a state to add a transition from the selected state. <br />
        Right-click and drag to move the selected state.
      </h3>
      
    </div>
  )
}

export default Nfadiagram