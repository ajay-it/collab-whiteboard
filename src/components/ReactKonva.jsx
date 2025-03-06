import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Transformer, Line } from "react-konva";
import socket from "../socket";
import { EVENTS } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";
import Rectangle from "./shapes/Rectangle";

const ReactKonva = ({ selectedTool, boardId }) => {
  const [lines, setLines] = useState([]);
  const [rectangles, setRectangles] = useState([
    { id: "rect1", x: 50, y: 60, width: 100, height: 90, fill: "red" },
    { id: "rect2", x: 200, y: 150, width: 120, height: 80, fill: "blue" },
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("black");
  // const [cursorPosition, setCursorPosition] = useState();
  const [shapeId, setShapeId] = useState();
  const [startPos, setStartPos] = useState(null);

  const [shapePreviews, setShapePreviews] = useState({});

  const stageRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }

    if (!selectedTool) {
      return;
    }

    const uniqueId = uuidv4();
    setShapeId(uniqueId);
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();

    if (selectedTool === "pen" || selectedTool === "eraser") {
      const initialData = {
        boardId,
        shapeId: uniqueId,
        attrs: {
          points: [pos.x, pos.y],
          stroke: penColor,
          strokeWidth: 5,
          globalCompositeOperation:
            selectedTool === "eraser" ? "destination-out" : "source-over",
        },
        className: "Line",
        tool: selectedTool,
      };

      setShapePreviews((prev) => ({ ...prev, [socket.id]: initialData }));

      setLines((prevLines) => [...prevLines, initialData]);

      socket.emit(EVENTS.SHAPE.CREATE, { senderId: socket.id, initialData });
    } else if (selectedTool === "rect") {
      setStartPos(pos);
      const dataToEmit = {
        boardId,
        shapeId,
        attrs: {
          draggable: true,
          fill: "",
          height: 0,
          width: 0,
          x: pos.x,
          y: pos.y,
        },
        className: "Rect",
        tool: selectedTool,
      };

      setShapePreviews((prev) => ({ ...prev, [socket.id]: dataToEmit }));
      setRectangles((prevRect) => [...prevRect, dataToEmit]);

      socket.emit(EVENTS.SHAPE.CREATE, dataToEmit);
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
        shapeId,
        className: "Line",
        points: [pos.x, pos.y],
      };

      socket.emit(EVENTS.SHAPE.UPDATE, { senderId: socket.id, updatedData });
    } else if (selectedTool === "rect") {
      // setShapePreviews((prev) => {
      //   return {
      //     ...prevRect,
      //     x: Math.min(pos.x, startPos.x),
      //     y: Math.min(pos.y, startPos.y),
      //     width: Math.abs(pos.x - startPos.x),
      //     height: Math.abs(pos.y - startPos.y),
      //   };
      // });

      socket.emit(EVENTS.SHAPE.UPDATE, {
        boardId,
        shapeId,
        x: Math.min(pos.x, startPos.x),
        y: Math.min(pos.y, startPos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
      });
    }
  };

  useEffect(() => {
    console.log("shapePreview", shapePreviews);
  }, [shapePreviews]);

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (selectedTool === "pen" || selectedTool === "eraser")
      setLines((prevLines) => {
        const newLines = [...prevLines];
        const lastLine = newLines[newLines.length - 1];
        lastLine.attrs.points = shapePreviews[socket.id].attrs.points;
        return newLines;
      });

    socket.emit(EVENTS.SHAPE.SAVE, {
      senderId: socket.id,
      data: shapePreviews[socket.id],
    });

    setShapePreviews((prev) => {
      const { [socket.id]: _, ...remainingPreviews } = prev;
      return remainingPreviews;
    });
  };

  const handleLoadStage = (data) => {
    //TODO: handle for all the shapes
    setLines((prevLines) => [...prevLines, ...data.shapes]);
  };

  const handleCreateShape = ({ senderId, initialData }) => {
    if (initialData.className === "Line") {
      setLines((prevLines) => [...prevLines, initialData]);

      setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));
    } else if (initialData.className === "Rect") {
      setRectangles((prevRect) => [...prevRect, initialData]);
    }
  };

  const handleUpdateShape = ({ senderId, updatedData }) => {
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
    }
  };

  const handleSaveShape = ({ senderId, data }) => {
    if (data.className === "Line")
      setLines((prevLines) => {
        const newLines = [...prevLines];
        const lastLine = newLines[newLines.length - 1];
        lastLine.attrs.points = data.attrs.points;
        return newLines;
      });

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
      socket.on(EVENTS.SHAPE.UPDATE, handleUpdateShape);
      socket.on(EVENTS.SHAPE.SAVE, handleSaveShape);

      return () => {
        socket.off(EVENTS.BOARD.LOAD);
        socket.off(EVENTS.SHAPE.CREATE);
        socket.off(EVENTS.SHAPE.UPDATE);
        socket.off(EVENTS.SHAPE.SAVE);
      };
    }
  }, [boardId]);

  return (
    <>
      <Stage
        ref={stageRef}
        width={1000}
        height={1000}
        className="border border-red-500 m-auto w-fit"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {lines?.map((line, i) => (
            <Line
              key={i}
              points={line.attrs.points}
              stroke={line.attrs.stroke}
              strokeWidth={line.attrs.strokeWidth}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
              globalCompositeOperation={line.attrs.globalCompositeOperation}
            />
          ))}

          {Object.keys(shapePreviews).length > 0 &&
            Object.entries(shapePreviews).map(([id, shapeData]) => (
              <Line
                key={id}
                {...shapeData}
                lineCap="round"
                lineJoin="round"
                tension={0.5}
              />
            ))}

          {rectangles?.map((rect, i) => (
            <Rectangle
              key={i}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              onSelect={() => {
                setSelectedId(rect.id);
              }}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
            />
          ))}
        </Layer>
      </Stage>
      <button onClick={() => setPenColor("blue")}>Blue</button>
      <button onClick={() => setPenColor("red")}>Red</button>
      <button onClick={() => setPenColor("black")}>Black</button>
    </>
  );
};

export default ReactKonva;
