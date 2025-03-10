import React, { memo, useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";

import { handleDragShape } from "../../events/konvaHandlers";
import socket from "../../socket";
import { EVENTS } from "../../utils/constants";

const RectangleComponent = memo(
  ({ shapeProps, isSelected, onSelect, onChange, selectedTool }) => {
    const rectRef = useRef(null);
    const trRef = useRef(null);

    const handleTransform = (e) => {
      const node = rectRef.current;
      if (!node) {
        return;
      }

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      if (e.type === "transformstart") {
        const initialData = {
          boardId: shapeProps.boardId,
          shapeId: shapeProps.shapeId,
          className: shapeProps.className,
        };

        socket.emit(EVENTS.SHAPE.MODIFY_START, {
          senderId: socket.id,
          type: "transform",
          initialData,
        });
      } else if (e.type === "transform") {
        const updatedData = {
          boardId: shapeProps.boardId,
          shapeId: shapeProps.shapeId,
          className: shapeProps.className,
          x: node.x(),
          y: node.y(),
          width: node.width() * scaleX,
          height: node.height() * scaleY,
        };

        socket.emit(EVENTS.SHAPE.MODIFY_DRAW, {
          senderId: socket.id,
          type: "transform",
          updatedData,
        });
      } else if (e.type === "transformend") {
        // transformer is changing scale of the node
        // and NOT its width or height
        // but in the state we have only width and height
        // to match the data better we will reset scale on transform end

        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          width: node.width() * scaleX,
          height: node.height() * scaleY,
        });

        const saveData = {
          boardId: shapeProps.boardId,
          shapeId: shapeProps.shapeId,
          className: shapeProps.className,
          x: node.x(),
          y: node.y(),
          width: node.width() * scaleX,
          height: node.height() * scaleY,
        };

        socket.emit(EVENTS.SHAPE.MODIFY_END, {
          senderId: socket.id,
          type: "transform",
          saveData,
        });
      }
    };

    const handleDrag = (e) => {
      handleDragShape(e, { shapeProps, onChange });
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
          ref={rectRef}
          {...shapeProps.attrs}
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDrag}
          onDragMove={handleDrag}
          onDragEnd={handleDrag}
          onTransformStart={handleTransform}
          onTransform={handleTransform}
          onTransformEnd={handleTransform}
          draggable={selectedTool === "selection"}
        />

        {isSelected && <Transformer ref={trRef} flipEnabled={false} />}
      </>
    );
  }
);

export default RectangleComponent;
