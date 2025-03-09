import React from "react";
import { Ellipse } from "react-konva";

const CircleComponent = ({ shapeProps }) => {
  return <Ellipse {...shapeProps.attrs} />;
};

export default CircleComponent;
