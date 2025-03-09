import { v4 as uuidv4 } from "uuid";

import { EVENTS } from "../utils/constants";
import socket from "../socket";

export const handleDrawingStart = (
  e,
  {
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

  let initialData = {};

  if (selectedTool === "pen" || selectedTool === "eraser") {
    initialData = {
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

    setLines((prevLines) => ({
      ...prevLines,
      [initialData.shapeId]: initialData,
    }));
  } else if (selectedTool === "rect") {
    setStartPos(pos);
    initialData = {
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
    setRectangles((prevRect) => ({
      ...prevRect,
      [initialData.shapeId]: initialData,
    }));
  } else if (selectedTool === "circle") {
    setStartPos(pos);
    initialData = {
      boardId,
      shapeId: shapeIdRef.current,
      attrs: {
        fill: fillColor,
        x: pos.x,
        y: pos.y,
        radiusX: 0,
        radiusY: 0,
        stroke: stroke,
        strokeWidth: strokeWidth,
      },
      className: "Circle",
      tool: selectedTool,
      createdAt: new Date().toISOString(),
    };
    setShapePreviews((prev) => ({ ...prev, [socket.id]: initialData }));
    setCircles((prevRect) => ({
      ...prevRect,
      [initialData.shapeId]: initialData,
    }));
  }

  socket.emit(EVENTS.SHAPE.CREATE, { senderId: socket.id, initialData });
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

  let updatedData = {};

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

    updatedData = {
      boardId,
      shapeId: shapeIdRef.current,
      className: "Line",
      points: [pos.x, pos.y],
    };
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
    updatedData = {
      boardId,
      shapeId: shapeIdRef.current,
      className: "Rect",
      x: Math.min(pos.x, startPos.x),
      y: Math.min(pos.y, startPos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    };
  } else if (selectedTool === "circle") {
    const x = Math.min(pos.x, startPos.x);
    const y = Math.min(pos.y, startPos.y);
    const width = Math.abs(pos.x - startPos.x);
    const height = Math.abs(pos.y - startPos.y);

    setShapePreviews((prev) => {
      const preview = prev[socket.id];
      if (preview) {
        return {
          ...prev,
          [socket.id]: {
            ...preview,
            attrs: {
              ...preview.attrs,
              x: x + width / 2,
              y: y + height / 2,
              radiusX: width / 2,
              radiusY: height / 2,
            },
          },
        };
      }
      return prev;
    });
    updatedData = {
      boardId,
      shapeId: shapeIdRef.current,
      className: "Circle",
      x: x + width / 2,
      y: y + height / 2,
      radiusX: width / 2,
      radiusY: height / 2,
    };
  }

  socket.emit(EVENTS.SHAPE.DRAW, { senderId: socket.id, updatedData });
};

export const handleDrawingComplete = ({
  shapeIdRef,
  selectedTool,
  shapePreviews,
  setIsDrawing,
  setLines,
  setRectangles,
  setShapePreviews,
  setCircles,
}) => {
  socket.emit(EVENTS.SHAPE.SAVE, {
    senderId: socket.id,
    data: shapePreviews[socket.id],
  });

  setIsDrawing(false);

  const shapeId = shapeIdRef.current;

  if (selectedTool === "pen" || selectedTool === "eraser") {
    setLines((prevLines) => ({
      ...prevLines,
      [shapeId]: {
        ...prevLines[shapeId],
        attrs: {
          ...prevLines[shapeId].attrs,
          points: shapePreviews[socket.id].attrs.points,
        },
      },
    }));
  } else if (selectedTool === "rect") {
    setRectangles((prevRects) => ({
      ...prevRects,
      [shapeId]: {
        ...prevRects[shapeId],
        attrs: {
          ...prevRects[shapeId].attrs,
          x: shapePreviews[socket.id].attrs.x,
          y: shapePreviews[socket.id].attrs.y,
          width: shapePreviews[socket.id].attrs.width,
          height: shapePreviews[socket.id].attrs.height,
        },
      },
    }));
  } else if (selectedTool === "circle") {
    setCircles((prevCircles) => ({
      ...prevCircles,
      [shapeId]: {
        ...prevCircles[shapeId],
        attrs: {
          ...prevCircles[shapeId].attrs,
          x: shapePreviews[socket.id].attrs.x,
          y: shapePreviews[socket.id].attrs.y,
          radiusX: shapePreviews[socket.id].attrs.radiusX,
          radiusY: shapePreviews[socket.id].attrs.radiusY,
        },
      },
    }));
  }

  setShapePreviews((prev) => {
    const { [socket.id]: _, ...remainingPreviews } = prev;
    return remainingPreviews;
  });
};
