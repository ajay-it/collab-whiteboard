import React, { memo } from "react";
import { Line, Rect } from "react-konva";

const ShapePreview = memo(({ shapePreviews }) => {
  return (
    <>
      {Object.entries(shapePreviews).map(([id, shapeData]) => {
        if (shapeData.className === "Line") {
          return (
            <Line
              key={id}
              {...shapeData.attrs}
              lineCap="round"
              lineJoin="round"
              tension={0.5}
            />
          );
        } else if (shapeData.className === "Rect") {
          return <Rect key={id} {...shapeData.attrs} />;
        }
      })}
    </>
  );
});

export default ShapePreview;
