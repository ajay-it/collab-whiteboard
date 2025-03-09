import React from "react";
import { Circle } from "react-konva";

const CircleComponent = ({ shapeProps }) => {
  return (
    <Circle
      // ref={rectRef}
      {...shapeProps.attrs}
    />
  );
};

export default CircleComponent;
