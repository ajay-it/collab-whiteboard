import React, { memo, useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";

const RectangleComponent = memo(
  ({ shapeProps, isSelected, onSelect, onChange }) => {
    const rectRef = useRef(null);
    const trRef = useRef(null);

    const handleTransform = (e) => {
      if (e.type === "transformend") {
        // transformer is changing scale of the node
        // and NOT its width or height
        // but in the store we have only width and height
        // to match the data better we will reset scale on transform end
        const node = rectRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          ...shapeProps,
          x: node.x(),
          y: node.y(),
          // set minimal value
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
        });
      }
    };

    const handleDrag = (e) => {
      if (e.type === "dragend") {
        onChange({
          ...shapeProps,
          x: e.target.x(),
          y: e.target.y(),
        });
      }
    };

    useEffect(() => {
      // console.log("🚀 ~ useEffect ~ rectRef.current:", rectRef.current);
      if (isSelected && rectRef.current && trRef.current) {
        // we need to attach transformer manually
        trRef.current.nodes([rectRef.current]);
        const layer = rectRef.current.getLayer();

        if (layer) {
          layer.batchDraw();
        }
      }
    }, [isSelected]);

    return (
      <>
        <Rect
          onClick={onSelect}
          onTap={onSelect}
          // ref={rectRef}
          {...shapeProps.attrs}
          onDragEnd={handleDrag}
          onTransformEnd={handleTransform}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </>
    );
  }
);

export default RectangleComponent;
