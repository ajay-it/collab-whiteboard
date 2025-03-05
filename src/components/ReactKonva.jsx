import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Transformer, Line } from "react-konva";
import socket from "../socket";
import { EVENTS } from "../utils/constants";
import { v4 as uuidv4 } from "uuid";

const ReactKonva = ({ selectedTool, boardId }) => {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("black");
  const [stageData, setStageData] = useState();
  // const [cursorPosition, setCursorPosition] = useState();
  const [shapeId, setShapeId] = useState();

  const stageRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!selectedTool) {
      return;
    }

    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();

    const uniqueId = uuidv4();
    setShapeId(uniqueId);

    const dataToEmit = {
      boardId,
      shapeId: uniqueId,
      attrs: {
        points: [pos.x, pos.y],
        stroke: penColor,
        strokeWidth: 5,
        lineCap: "round",
        globalCompositeOperation:
          selectedTool === "eraser" ? "destination-out" : "source-over",
      },
      className: "Line",
      tool: selectedTool,
    };

    socket.emit(EVENTS.BOARD.DRAW, dataToEmit);

    // setLines([...lines, dataToEmit]);
    setLines((prevLines) => [...prevLines, dataToEmit]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skip
    if (!isDrawing) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    socket.emit(EVENTS.BOARD.FREEHAND, {
      boardId,
      shapeId,
      points: [point.x, point.y],
    });

    setLines((prevLines) => {
      const newLines = [...prevLines];
      const lastLine = newLines[newLines.length - 1];
      lastLine.attrs.points = lastLine.attrs.points.concat([point.x, point.y]);
      return newLines;
    });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      console.log("Data to emit on mouse up");
    }
  };

  const handleStageLoad = (data) => {
    setStageData(JSON.parse(data.jsonData));
  };

  const handleBoardDraw = (data) => {
    console.log("🚀 ~ handleBoardDraw ~ data:", data);
    // setLines([...lines, data]);
    setLines((prevLines) => [...prevLines, data]);
  };

  const handleFreehand = (data) => {
    setLines((prevLines) => {
      const newLines = [...prevLines];
      const lastLine = newLines[newLines.length - 1];
      lastLine.attrs.points = lastLine.attrs.points.concat([
        data.points[0],
        data.points[1],
      ]);

      return newLines;
    });
  };

  useEffect(() => {
    if (boardId && stageRef.current) {
      const stage = stageRef.current;

      const onContentReady = () => {
        const stageJSON = stage.toJSON();
        setStageData(JSON.parse(stageJSON));

        socket.emit(EVENTS.BOARD.CREATE, { boardId, stageJSON });
      };

      // TODO: Remove setTimeout
      setTimeout(() => {
        onContentReady();
      }, 500);

      socket.on(EVENTS.BOARD.LOAD, handleStageLoad);
      socket.on(EVENTS.BOARD.DRAW, handleBoardDraw);
      socket.on(EVENTS.BOARD.FREEHAND, handleFreehand);

      return () => {
        socket.off(EVENTS.BOARD.LOAD, handleStageLoad);
        socket.off(EVENTS.BOARD.DRAW, handleBoardDraw);
        socket.off(EVENTS.BOARD.FREEHAND, handleFreehand);
      };
    }
  }, [boardId]);

  useEffect(() => {
    console.log("Board data state", stageData);
  }, [stageData]);

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
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.attrs.points}
              stroke={line.attrs.stroke}
              strokeWidth={line.attrs.strokeWidth}
              lineCap={line.attrs.lineCap}
              globalCompositeOperation={line.attrs.globalCompositeOperation}
            />
          ))}
          {/* <Transformer ref={trRef} flipEnabled={false} /> */}
        </Layer>
      </Stage>
      <button onClick={() => setPenColor("blue")}>Blue</button>
      <button onClick={() => setPenColor("red")}>Red</button>
      <button onClick={() => setPenColor("black")}>Black</button>
    </>
  );
};

export default ReactKonva;
