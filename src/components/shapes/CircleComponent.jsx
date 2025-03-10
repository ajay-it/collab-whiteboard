import React, { useRef } from "react";
import { Ellipse } from "react-konva";

import { handleDragShape } from "../../events/konvaHandlers";

const CircleComponent = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  selectedTool,
}) => {
  const circleRef = useRef(null);
  const trRef = useRef(null);

  const handleTransform = (e) => {
    if (e.type === "transformend") {
      // transformer is changing scale of the node
      // and NOT its width or height
      // but in the state we have only width and height
      // to match the data better we will reset scale on transform end
      const node = circleRef.current;
      if (!node) return;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      // we will reset it back
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        x: node.x(),
        y: node.y(),
        width: node.width() * scaleX,
        height: node.height() * scaleY,
      });
    }
  };

  const handleDrag = (e) => {
    handleDragShape(e, { shapeProps, onChange });
  };

  return (
    <>
      <Ellipse
        ref={circleRef}
        {...shapeProps.attrs}
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={handleDrag}
        onDragMove={handleDrag}
        onDragEnd={handleDrag}
        onTransformEnd={handleTransform}
        draggable={selectedTool === "selection"}
      />

      {isSelected && <Transformer ref={trRef} flipEnabled={false} />}
    </>
  );
};

export default CircleComponent;
