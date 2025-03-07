import React, { memo } from "react";
import { Line } from "react-konva";

const LineComponent = ({ line }) => {
  // console.log("here in memo");
  return (
    <Line
      points={line.attrs.points}
      stroke={line.attrs.stroke}
      strokeWidth={line.attrs.strokeWidth}
      lineCap="round"
      lineJoin="round"
      tension={0.5}
      globalCompositeOperation={line.attrs.globalCompositeOperation}
    />
  );
};

export default LineComponent;
