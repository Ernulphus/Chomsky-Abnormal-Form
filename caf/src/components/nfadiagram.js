import React from 'react'
import Canvas from './Canvas'

const Nfadiagram = (props) => {

  const draw = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000000'

  }

  return (
    <div>
      <h2>Draw a diagram!</h2>
      <h3>Double-click to create a new state.</h3>
      <Canvas draw={draw}/>
    </div>
  )
}

export default Nfadiagram