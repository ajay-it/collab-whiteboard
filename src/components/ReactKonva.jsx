import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import socket from "../socket";
import { EVENTS } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";
import RectangleComponent from "./shapes/RectangleComponent";
import ShapePreview from "./ShapePreview";
import LineComponent from "./shapes/LineComponent";

const ReactKonva = ({ selectedTool, boardId, stroke, strokeWidth }) => {
  const [lines, setLines] = useState([]);
  const [rectangles, setRectangles] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // const [penColor, setPenColor] = useState("black");
  // const [cursorPosition, setCursorPosition] = useState();
  // const [shapeId, setShapeId] = useState();
  const [startPos, setStartPos] = useState(null);

  const [shapePreviews, setShapePreviews] = useState({});

  const stageRef = useRef(null);
  const shapeIdRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }

    if (!selectedTool) {
      return;
    }

    shapeIdRef.current = uuidv4();

    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();

    if (selectedTool === "pen" || selectedTool === "eraser") {
      const initialData = {
        boardId,
        shapeId: shapeIdRef.current,
        attrs: {
          points: [pos.x, pos.y],
          stroke: stroke,
          strokeWidth: strokeWidth,
          globalCompositeOperation:
            selectedTool === "eraser" ? "destination-out" : "source-over",
        },
        className: "Line",
        tool: selectedTool,
        createdAt: new Date().toISOString(),
      };

      setShapePreviews((prev) => ({ ...prev, [socket.id]: initialData }));

      setLines((prevLines) => [...prevLines, initialData]);

      socket.emit(EVENTS.SHAPE.CREATE, { senderId: socket.id, initialData });
    } else if (selectedTool === "rect") {
      setStartPos(pos);
      const initialData = {
        boardId,
        shapeId: shapeIdRef.current,
        attrs: {
          fill: "",
          height: 0,
          width: 0,
          x: pos.x,
          y: pos.y,
          stroke: stroke,
          strokeWidth: strokeWidth,
          cornerRadius: 5,
        },
        className: "Rect",
        tool: selectedTool,
        createdAt: new Date().toISOString(),
      };

      setShapePreviews((prev) => ({ ...prev, [socket.id]: initialData }));
      setRectangles((prevRect) => [...prevRect, initialData]);

      socket.emit(EVENTS.SHAPE.CREATE, { senderId: socket.id, initialData });
    }
  };

  const handleMouseMove = (e) => {
    // no drawing - skip
    if (!isDrawing) {
      return;
    }

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (selectedTool === "pen" || selectedTool === "eraser") {
      setShapePreviews((prev) => {
        const preview = prev[socket.id];
        if (preview) {
          return {
            ...prev,
            [socket.id]: {
              ...preview,
              attrs: {
                ...preview.attrs,
                points: [...preview.attrs.points, pos.x, pos.y],
              },
            },
          };
        }
        return prev;
      });

      const updatedData = {
        boardId,
        shapeId: shapeIdRef.current,
        className: "Line",
        points: [pos.x, pos.y],
      };

      socket.emit(EVENTS.SHAPE.DRAW, { senderId: socket.id, updatedData });
    } else if (selectedTool === "rect") {
      setShapePreviews((prev) => {
        const preview = prev[socket.id];
        if (preview) {
          return {
            ...prev,
            [socket.id]: {
              ...preview,
              attrs: {
                ...preview.attrs,
                x: Math.min(pos.x, startPos.x),
                y: Math.min(pos.y, startPos.y),
                width: Math.abs(pos.x - startPos.x),
                height: Math.abs(pos.y - startPos.y),
              },
            },
          };
        }
        return prev;
      });
      const updatedData = {
        boardId,
        shapeId: shapeIdRef.current,
        className: "Rect",
        x: Math.min(pos.x, startPos.x),
        y: Math.min(pos.y, startPos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
      };
      socket.emit(EVENTS.SHAPE.DRAW, { senderId: socket.id, updatedData });
    }
  };

  // useEffect(() => {
  //   console.log("shapePreview", shapePreviews);
  // }, [shapePreviews]);

  const handleMouseUp = () => {
    socket.emit(EVENTS.SHAPE.SAVE, {
      senderId: socket.id,
      data: shapePreviews[socket.id],
    });

    setIsDrawing(false);

    if (selectedTool === "pen" || selectedTool === "eraser") {
      setLines((prevLines) => {
        const newLines = [...prevLines];
        const lastIndex = newLines.length - 1;
        newLines[lastIndex] = {
          ...newLines[lastIndex],
          attrs: {
            ...newLines[lastIndex].attrs,
            points: shapePreviews[socket.id].attrs.points,
          },
        };
        return newLines;
      });
    } else if (selectedTool === "rect") {
      setRectangles((prevRects) => {
        const newRects = [...prevRects];
        const lastIndex = newRects.length - 1;
        newRects[lastIndex] = {
          ...newRects[lastIndex],
          attrs: {
            ...newRects[lastIndex].attrs,
            x: shapePreviews[socket.id].attrs.x,
            y: shapePreviews[socket.id].attrs.y,
            width: shapePreviews[socket.id].attrs.width,
            height: shapePreviews[socket.id].attrs.height,
          },
        };
        return newRects;
      });
    }

    setShapePreviews((prev) => {
      const { [socket.id]: _, ...remainingPreviews } = prev;
      return remainingPreviews;
    });
  };

  const handleLoadStage = (data) => {
    // handle for all the shapes
    data.shapes.map((shape) => {
      if (shape.className === "Line") {
        setLines((prevLines) => [...prevLines, shape]);
      } else if (shape.className === "Rect") {
        setRectangles((prevRects) => [...prevRects, shape]);
      }
    });
  };

  const handleCreateShape = ({ senderId, initialData }) => {
    if (initialData.className === "Line") {
      setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));

      setLines((prevLines) => [...prevLines, initialData]);
    } else if (initialData.className === "Rect") {
      setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));

      setRectangles((prevRect) => [...prevRect, initialData]);
    }
  };

  const handleDrawShape = ({ senderId, updatedData }) => {
    if (updatedData.className === "Line") {
      setShapePreviews((prev) => {
        const preview = prev[senderId];
        if (preview) {
          return {
            ...prev,
            [senderId]: {
              ...preview,
              attrs: {
                ...preview.attrs,
                points: [
                  ...preview.attrs.points,
                  updatedData.points[0],
                  updatedData.points[1],
                ],
              },
            },
          };
        }
      });
    } else if (updatedData.className === "Rect") {
      setShapePreviews((prev) => {
        const preview = prev[senderId];
        if (preview) {
          return {
            ...prev,
            [senderId]: {
              ...preview,
              attrs: {
                ...preview.attrs,
                x: updatedData.x,
                y: updatedData.y,
                width: updatedData.width,
                height: updatedData.height,
              },
            },
          };
        }
        return prev;
      });
    }
  };

  const handleSaveShape = ({ senderId, data }) => {
    if (data.className === "Line") {
      setLines((prevLines) => {
        const newLines = [...prevLines];
        const lastLine = newLines[newLines.length - 1];
        lastLine.attrs.points = data.attrs.points;
        return newLines;
      });
    } else if (data.className === "Rect") {
      setRectangles((prevRects) => {
        const newRects = [...prevRects];
        const lastRect = newRects[newRects.length - 1];
        lastRect.attrs.width = data.attrs.width;
        lastRect.attrs.height = data.attrs.height;
        lastRect.attrs.x = data.attrs.x;
        lastRect.attrs.y = data.attrs.y;
        return newRects;
      });
    }
    setShapePreviews((prev) => {
      const { [senderId]: _, ...remainingPreviews } = prev;
      return remainingPreviews;
    });
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

      socket.on(EVENTS.BOARD.LOAD, handleLoadStage);
      socket.on(EVENTS.SHAPE.CREATE, handleCreateShape);
      socket.on(EVENTS.SHAPE.DRAW, handleDrawShape);
      socket.on(EVENTS.SHAPE.SAVE, handleSaveShape);

      return () => {
        socket.off(EVENTS.BOARD.LOAD);
        socket.off(EVENTS.SHAPE.CREATE);
        socket.off(EVENTS.SHAPE.DRAW);
        socket.off(EVENTS.SHAPE.SAVE);
      };
    }
  }, [boardId]);

  const sortedShapes = useMemo(() => {
    return [...lines, ...rectangles]
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [lines, rectangles]);

  return (
    <>
      <Stage
        ref={stageRef}
        width={1000}
        height={1000}
        className="border border-red-500 m-auto w-full"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
                  isSelected={shape.id === selectedId}
                  onSelect={() => {
                    setSelectedId(shape.id);
                  }}
                  onChange={(newAttrs) => {
                    const rects = rectangles.slice();
                    rects[i] = newAttrs;
                    setRectangles(rects);
                  }}
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
