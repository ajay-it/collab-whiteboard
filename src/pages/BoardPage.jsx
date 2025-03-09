import React, { useState } from "react";
import { useParams } from "react-router-dom";

import ReactKonva from "../components/ReactKonva";
import Toolbar from "../components/Toolbar";

const BoardPage = () => {
  const [selectedTool, setSelectedTool] = useState("");
  const [stroke, setStroke] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState("");

  const { id: boardId } = useParams();

  return (
    <>
      <Toolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        stroke={stroke}
        setStroke={setStroke}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        fillColor={fillColor}
        setFillColor={setFillColor}
      />
      <ReactKonva
        selectedTool={selectedTool}
        boardId={boardId}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fillColor={fillColor}
      />
    </>
  );
};

export default BoardPage;
