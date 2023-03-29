import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types'; /* eslint-disable-line */
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

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
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      tabIndex="0"
      ref={canvasRef}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onContextMenu={onContextMenu}
      onKeyPress={onKeyPress}
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
