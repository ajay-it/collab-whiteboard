export const handleLoadStage = (
  data,
  { setLines, setRectangles, setCircles }
) => {
  // handle for all the shapes
  data.shapes.map((shape) => {
    if (shape.className === "Line") {
      setLines((prevLines) => ({
        ...prevLines,
        [shape.shapeId]: shape,
      }));
    } else if (shape.className === "Rect") {
      setRectangles((prevRects) => ({ ...prevRects, [shape.shapeId]: shape }));
    } else if (shape.className === "Circle") {
      setCircles((prevCircles) => ({ ...prevCircles, [shape.shapeId]: shape }));
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
    setLines((prevLines) => ({
      ...prevLines,
      [initialData.shapeId]: initialData,
    }));
  } else if (initialData.className === "Rect") {
    setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));
    setRectangles((prevRect) => ({
      ...prevRect,
      [initialData.shapeId]: initialData,
    }));
  } else if (initialData.className === "Circle") {
    setShapePreviews((prev) => ({ ...prev, [senderId]: initialData }));
    setCircles((prevCircles) => ({
      ...prevCircles,
      [initialData.shapeId]: initialData,
    }));
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
  const { shapeId } = saveData;

  if (saveData.className === "Line") {
    setLines((prevLines) => ({
      ...prevLines,
      [shapeId]: {
        ...prevLines[shapeId],
        attrs: {
          ...prevLines[shapeId].attrs,
          points: saveData.attrs.points,
        },
      },
    }));
  } else if (saveData.className === "Rect") {
    setRectangles((prevRects) => ({
      ...prevRects,
      [shapeId]: {
        ...prevRects[shapeId],
        attrs: {
          ...prevRects[shapeId].attrs,
          width: saveData.attrs.width,
          height: saveData.attrs.height,
          x: saveData.attrs.x,
          y: saveData.attrs.y,
        },
      },
    }));
  } else if (saveData.className === "Circle") {
    setCircles((prevCircles) => ({
      ...prevCircles,
      [shapeId]: {
        ...prevCircles[shapeId],
        attrs: {
          ...prevCircles[shapeId].attrs,
          x: saveData.attrs.x,
          y: saveData.attrs.y,
          radiusX: saveData.attrs.radiusX,
          radiusY: saveData.attrs.radiusY,
        },
      },
    }));
  }

  setShapePreviews((prev) => {
    const { [senderId]: _, ...remainingPreviews } = prev;
    return remainingPreviews;
  });
};

export const handleModifyStart = (
  data,
  { setShapePreviews, setRectangles, setCircles }
) => {
  const { senderId, initialData } = data;

  if (initialData.className === "Rect") {
    // Remove selected shape from rectangles state
    setRectangles((prevRects) => {
      const { [initialData.shapeId]: selectedShape, ...otherShapes } =
        prevRects;

      if (selectedShape) {
        // Set selected shape in shapePreviews state
        setShapePreviews((prev) => ({
          ...prev,
          [senderId]: selectedShape,
        }));
      }
      return otherShapes;
    });
  } else if (initialData.className === "Circle") {
    // Remove selected shape from rectangles state
    setCircles((prevCircles) => {
      const { [initialData.shapeId]: selectedShape, ...otherShapes } =
        prevCircles;

      if (selectedShape) {
        // Set selected shape in shapePreviews state
        setShapePreviews((prev) => ({
          ...prev,
          [senderId]: selectedShape,
        }));
      }
      return otherShapes;
    });
  }
};

export const handleModifyDraw = (data, { setShapePreviews }) => {
  const { senderId, updatedData } = data;

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
          },
        },
      };
    }
    return prev;
  });
};

export const handleModifyEnd = (
  data,
  { setShapePreviews, setRectangles, setCircles }
) => {
  const { senderId, saveData } = data;
  const { shapeId } = saveData;

  setShapePreviews((prev) => {
    const { [senderId]: selectedShape, ...remainingPreviews } = prev;

    if (selectedShape) {
      if (saveData.className === "Rect") {
        setRectangles((prevRects) => ({
          ...prevRects,
          [shapeId]: {
            ...selectedShape,
            attrs: {
              ...selectedShape.attrs,
              x: saveData.x,
              y: saveData.y,
            },
          },
        }));
      } else if (saveData.className === "Circle") {
        setCircles((prevCircles) => ({
          ...prevCircles,
          [shapeId]: {
            ...selectedShape,
            attrs: {
              ...selectedShape.attrs,
              x: saveData.x,
              y: saveData.y,
            },
          },
        }));
      }
    }

    return remainingPreviews;
  });
};
