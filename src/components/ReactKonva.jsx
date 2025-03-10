import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";

import { EVENTS } from "../utils/constants";
import RectangleComponent from "./shapes/RectangleComponent";
import ShapePreview from "./ShapePreview";
import LineComponent from "./shapes/LineComponent";
import CircleComponent from "./shapes/CircleComponent";
import socket from "../socket";
import {
  handleCreateShape,
  handleDrawShape,
  handleLoadStage,
  handleModifyDraw,
  handleModifyEnd,
  handleModifyStart,
  handleSaveShape,
} from "../events/socketHandlers";
import {
  handleDrawingComplete,
  handleDrawingStart,
  handleDrawingUpdate,
} from "../events/konvaHandlers";

const ReactKonva = ({
  selectedTool,
  boardId,
  stroke,
  strokeWidth,
  fillColor,
}) => {
  const [lines, setLines] = useState({});
  const [rectangles, setRectangles] = useState({});
  const [circles, setCircles] = useState({});
  const [shapePreviews, setShapePreviews] = useState({});

  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);

  const stageRef = useRef(null);
  const shapeIdRef = useRef(null);

  const handleMouseDown = (e) => {
    handleDrawingStart(e, {
      boardId,
      shapeIdRef,
      selectedTool,
      stroke,
      strokeWidth,
      fillColor,
      setSelectedId,
      setIsDrawing,
      setStartPos,
      setShapePreviews,
      setLines,
      setRectangles,
      setCircles,
    });
  };

  const handleMouseMove = (e) => {
    handleDrawingUpdate(e, {
      boardId,
      shapeIdRef,
      startPos,
      isDrawing,
      selectedTool,
      setShapePreviews,
    });
  };

  const handleMouseUp = () => {
    handleDrawingComplete({
      shapeIdRef,
      selectedTool,
      shapePreviews,
      setIsDrawing,
      setLines,
      setRectangles,
      setShapePreviews,
      setCircles,
    });
  };

  const handleOnShapeChange = (newAttrs, id, className) => {
    if (className === "Rect") {
      setRectangles((prevRects) => ({
        ...prevRects,
        [id]: {
          ...prevRects[id],
          attrs: { ...prevRects[id].attrs, ...newAttrs },
        },
      }));
    } else if (className === "Circle") {
      setCircles((prevCircles) => ({
        ...prevCircles,
        [id]: {
          ...prevCircles[id],
          attrs: { ...prevCircles[id].attrs, ...newAttrs },
        },
      }));
    }
  };

  const handleOnShapeSelect = (shapeId) => {
    if (selectedTool === "selection") {
      setSelectedId(shapeId);
    }
  };

  useEffect(() => {
    if (boardId && stageRef.current) {
      const stage = stageRef.current;

      const onContentReady = () => {
        const stageJSON = stage.toJSON();

        socket.emit(EVENTS.BOARD.CREATE, { boardId, stageJSON });
      };

      // TODO: Remove setTimeout
      setTimeout(() => {
        onContentReady();
      }, 500);

      socket.on(EVENTS.BOARD.LOAD, (data) =>
        handleLoadStage(data, { setLines, setRectangles, setCircles })
      );
      socket.on(EVENTS.SHAPE.CREATE, (data) =>
        handleCreateShape(data, {
          setShapePreviews,
          setLines,
          setRectangles,
          setCircles,
        })
      );
      socket.on(EVENTS.SHAPE.DRAW, (data) =>
        handleDrawShape(data, { setShapePreviews })
      );
      socket.on(EVENTS.SHAPE.SAVE, (data) =>
        handleSaveShape(data, {
          setShapePreviews,
          setLines,
          setRectangles,
          setCircles,
        })
      );

      socket.on(EVENTS.SHAPE.MODIFY_START, (data) =>
        handleModifyStart(data, { setShapePreviews, setRectangles, setCircles })
      );

      socket.on(EVENTS.SHAPE.MODIFY_DRAW, (data) =>
        handleModifyDraw(data, { setShapePreviews })
      );

      socket.on(EVENTS.SHAPE.MODIFY_END, (data) =>
        handleModifyEnd(data, { setShapePreviews, setRectangles, setCircles })
      );

      return () => {
        socket.off(EVENTS.BOARD.LOAD);
        socket.off(EVENTS.SHAPE.CREATE);
        socket.off(EVENTS.SHAPE.DRAW);
        socket.off(EVENTS.SHAPE.SAVE);
      };
    }
  }, [boardId]);

  const sortedShapes = useMemo(() => {
    return [
      ...Object.values(lines),
      ...Object.values(rectangles),
      ...Object.values(circles),
    ]
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [lines, rectangles, circles]);

  return (
    <>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="border border-red-500 m-auto w-full"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {sortedShapes?.map((shape, i) => {
            if (shape.className === "Line") {
              return <LineComponent key={shape.shapeId + i} line={shape} />;
            } else if (shape.className === "Rect") {
              return (
                <RectangleComponent
                  key={shape.shapeId + i}
                  shapeProps={shape}
                  selectedTool={selectedTool}
                  isSelected={shape.shapeId === selectedId}
                  onSelect={() => handleOnShapeSelect(shape.shapeId)}
                  onChange={(newAttrs) =>
                    handleOnShapeChange(
                      newAttrs,
                      shape.shapeId,
                      shape.className
                    )
                  }
                />
              );
            } else if (shape.className === "Circle") {
              return (
                <CircleComponent
                  key={shape.shapeId + i}
                  shapeProps={shape}
                  selectedTool={selectedTool}
                  isSelected={shape.shapeId === selectedId}
                  onSelect={() => handleOnShapeSelect(shape.shapeId)}
                  onChange={(newAttrs) =>
                    handleOnShapeChange(
                      newAttrs,
                      shape.shapeId,
                      shape.className
                    )
                  }
                />
              );
            }
          })}

          {Object.keys(shapePreviews).length > 0 && (
            <ShapePreview shapePreviews={shapePreviews} />
          )}
        </Layer>
      </Stage>
    </>
  );
};

export default ReactKonva;
