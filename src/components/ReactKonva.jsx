import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Transformer, Line } from "react-konva";
import socket from "../socket";
import { EVENTS } from "../utils/constants";

const ReactKonva = ({ selectedTool, boardId }) => {
  const [rectangles, setRectangles] = useState([
    { x: 10, y: 10, width: 100, height: 100, fill: "red", id: "rect1" },
    { x: 150, y: 150, width: 100, height: 100, fill: "green", id: "rect2" },
  ]);
  const [selectedId, setSelectedId] = useState(null);

  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("black");

  const stageRef = useRef(null);
  const trRef = useRef();
  const shapeRefs = useRef({});

  useEffect(() => {
    if (selectedId && trRef.current) {
      trRef.current.nodes([shapeRefs.current[selectedId]]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleSelect = (id) => {
    setSelectedId(id);
  };
  const handleMouseDown = (e) => {
    if (!selectedTool) {
      return;
    }
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();

    console.log("Data to emit on mouse down", {
      tool: selectedTool,
      points: [pos.x, pos.y],
      stroke: penColor,
    });

    setLines([
      ...lines,
      { tool: selectedTool, points: [pos.x, pos.y], stroke: penColor },
    ]);
  };

  const handleChange = (id, newAttrs) => {
    setRectangles((prev) =>
      prev.map((rect) => (rect.id === id ? newAttrs : rect))
    );
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    console.log("Data to emit on mouse move", {
      points: [point.x, point.y],
    });

    setLines((prevLines) => {
      const newLines = [...prevLines];
      const lastLine = newLines[newLines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      return newLines;
    });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      console.log("Data to emit on mouse up");
    }
  };

  const sentMessage = () => {
    socket.emit("message", `This is client ${socket.id}`);
    console.log("🚀 ~ sentMessage ~ socket:", socket);
  };

  const handleServerBoardData = (data) => {
    console.log("🚀 ~ handleServerBoardData ~ data:", data);

    setLines(data.lines || []);
  };

  useEffect(() => {
    if (boardId && stageRef.current) {
      const stage = stageRef.current;

      const onContentReady = () => {
        console.log("stage data emitted");
        const stageJSON = stage.toJSON();
        socket.emit(EVENTS.BOARD.CREATE, { boardId, boardData: stageJSON });
      };

      // Need to fix
      setTimeout(() => {
        onContentReady();
      }, 500);

      // stage.on("contentReady", onContentReady);

      // // Clean up the listener
      // return () => {
      //   stage.off("contentReady", onContentReady);
      // };
    }
  }, [boardId]);

  return (
    <>
      <Stage
        ref={stageRef}
        width={500}
        height={500}
        className="border border-red-500 w-fit m-auto mt-10"
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {rectangles.map((rect) => (
            <Rect
              key={rect.id}
              ref={(node) => (shapeRefs.current[rect.id] = node)}
              {...rect}
              draggable
              onClick={() => handleSelect(rect.id)}
              onTap={() => handleSelect(rect.id)}
              onDragEnd={(e) =>
                handleChange(rect.id, {
                  ...rect,
                  x: e.target.x(),
                  y: e.target.y(),
                })
              }
              onTransformEnd={(e) => {
                const node = shapeRefs.current[rect.id];
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                handleChange(rect.id, {
                  ...rect,
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, node.width() * scaleX),
                  height: Math.max(5, node.height() * scaleY),
                });
              }}
            />
          ))}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.stroke}
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation={
                line.tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
          <Transformer ref={trRef} flipEnabled={false} />
        </Layer>
      </Stage>
      <button onClick={sentMessage}>Send Message</button>
      <button onClick={() => setPenColor("red")}>Red</button>
      <button onClick={() => setPenColor("black")}>Black</button>
    </>
  );
};

export default ReactKonva;
