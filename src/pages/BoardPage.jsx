import React, { useEffect, useState } from "react";
import ReactKonva from "../components/ReactKonva";
import Toolbar from "../components/Toolbar";
import { useParams } from "react-router-dom";

const BoardPage = () => {
  const [selectedTool, setSelectedTool] = useState("");
  const [stroke, setStroke] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(2);

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
      />
      <ReactKonva
        selectedTool={selectedTool}
        boardId={boardId}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </>
  );
};

export default BoardPage;
