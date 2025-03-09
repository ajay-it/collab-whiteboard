export const handleLoadStage = (
  data,
  { setLines, setRectangles, setCircles }
) => {
  // handle for all the shapes
  data.shapes.map((shape) => {
    if (shape.className === "Line") {
      setLines((prevLines) => [...prevLines, shape]);
    } else if (shape.className === "Rect") {
      setRectangles((prevRects) => [...prevRects, shape]);
    } else if (shape.className === "Circle") {
      setCircles((prevCircles) => [...prevCircles, shape]);
    }
  });
};

export const handleCreateShape = (
  data,
  { setShapePreviews, setLines, setRectangles, setCircles }
) => {
  const { senderId, initialData } = data;

  if (initialData.className === "Line") {
    setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));
    setLines((prevLines) => [...prevLines, initialData]);
  } else if (initialData.className === "Rect") {
    setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));
    setRectangles((prevRect) => [...prevRect, initialData]);
  } else if (initialData.className === "Circle") {
    setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));
    setCircles((prevCircles) => [...prevCircles, initialData]);
  }
};

export const handleDrawShape = (data, { setShapePreviews }) => {
  const { senderId, updatedData } = data;

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
  } else if (updatedData.className === "Circle") {
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
              radiusX: updatedData.radiusX,
              radiusY: updatedData.radiusY,
            },
          },
        };
      }
      return prev;
    });
  }
};

export const handleSaveShape = (
  data,
  { setShapePreviews, setLines, setRectangles, setCircles }
) => {
  const { senderId, data: saveData } = data;

  if (saveData.className === "Line") {
    setLines((prevLines) => {
      const newLines = [...prevLines];
      const lastLine = newLines[newLines.length - 1];
      lastLine.attrs.points = saveData.attrs.points;
      return newLines;
    });
  } else if (saveData.className === "Rect") {
    setRectangles((prevRects) => {
      const newRects = [...prevRects];
      const lastRect = newRects[newRects.length - 1];
      lastRect.attrs.width = saveData.attrs.width;
      lastRect.attrs.height = saveData.attrs.height;
      lastRect.attrs.x = saveData.attrs.x;
      lastRect.attrs.y = saveData.attrs.y;
      return newRects;
    });
  } else if (saveData.className === "Circle") {
    setCircles((prevCircles) => {
      const newCircles = [...prevCircles];
      const lastCircle = newCircles[newCircles.length - 1];
      lastCircle.attrs.x = saveData.attrs.x;
      lastCircle.attrs.y = saveData.attrs.y;
      lastCircle.attrs.radiusX = saveData.attrs.radiusX;
      lastCircle.attrs.radiusY = saveData.attrs.radiusY;
      return newCircles;
    });
  }

  setShapePreviews((prev) => {
    const { [senderId]: _, ...remainingPreviews } = prev;
    return remainingPreviews;
  });
};
