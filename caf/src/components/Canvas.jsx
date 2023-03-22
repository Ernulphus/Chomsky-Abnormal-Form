import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types'; /* eslint-disable-line */

function Canvas({
  draw,
  onClick,
  onMouseMove,
  onContextMenu,
  onKeyPress,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    let animationFrameId;

    const render = () => {
      frameCount += 1;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return (
    <canvas
      width="700"
      height="400"
      tabIndex="0"
      ref={canvasRef}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onContextMenu={onContextMenu}
      onKeyPress={(e) => { console.log(e); onKeyPress(e); }}
    />
  );
}

export default Canvas;

Canvas.propTypes = {
  draw: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onMouseMove: PropTypes.func.isRequired,
  onContextMenu: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
};
