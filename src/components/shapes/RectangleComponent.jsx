import React, { memo, useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";
import socket from "../../socket";
import { EVENTS } from "../../utils/constants";

const RectangleComponent = memo(
  ({ shapeProps, isSelected, onSelect, onChange, selectedTool }) => {
    const rectRef = useRef(null);
    const trRef = useRef(null);

    const handleTransform = (e) => {
      if (e.type === "transformend") {
        // transformer is changing scale of the node
        // and NOT its width or height
        // but in the state we have only width and height
        // to match the data better we will reset scale on transform end
        const node = rectRef.current;
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
      if (e.type === "dragstart") {
        const initialData = {
          boardId: shapeProps.boardId,
          shapeId: shapeProps.shapeId,
          ClassName: shapeProps.ClassName,
        };

        socket.emit(EVENTS.SHAPE.MODIFY_START, {
          senderId: socket.id,
          type: "drag",
          initialData,
        });
      } else if (e.type === "dragmove") {
        const updatedData = {
          boardId: shapeProps.boardId,
          shapeId: shapeProps.shapeId,
          ClassName: shapeProps.ClassName,
          x: e.target.x(),
          y: e.target.y(),
        };

        socket.emit(EVENTS.SHAPE.MODIFY_DRAW, {
          senderId: socket.id,
          type: "drag",
          updatedData,
        });
      } else if (e.type === "dragend") {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });

        const saveData = {
          boardId: shapeProps.boardId,
          shapeId: shapeProps.shapeId,
          ClassName: shapeProps.ClassName,
          x: e.target.x(),
          y: e.target.y(),
        };

        socket.emit(EVENTS.SHAPE.MODIFY_END, {
          senderId: socket.id,
          type: "drag",
          saveData,
        });
      }
    };

    useEffect(() => {
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
          ref={rectRef}
          {...shapeProps.attrs}
          onDragStart={handleDrag}
          onDragMove={handleDrag}
          onDragEnd={handleDrag}
          onTransformEnd={handleTransform}
          draggable={selectedTool === "selection"}
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
