import { v4 as uuidv4 } from "uuid";
import { EVENTS } from "../utils/constants";
import socket from "../socket";

export const handleDrawingStart = (
  e,
  {
    selectedTool,
    setSelectedId,
    setIsDrawing,
    boardId,
    shapeIdRef,
    setShapePreviews,
    setLines,
    setRectangles,
    setStartPos,
    stroke,
    strokeWidth,
    fillColor,
  }
) => {
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
        fill: fillColor,
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

export const handleDrawingUpdate = (
  e,
  { boardId, shapeIdRef, startPos, isDrawing, selectedTool, setShapePreviews }
) => {
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

export const handleDrawingComplete = ({
  selectedTool,
  shapePreviews,
  setIsDrawing,
  setLines,
  setRectangles,
  setShapePreviews,
}) => {
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
