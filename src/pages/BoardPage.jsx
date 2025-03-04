import React, { useEffect, useState } from "react";
import ReactKonva from "../components/ReactKonva";
import Toolbar from "../components/Toolbar";
import { useParams } from "react-router-dom";

const BoardPage = () => {
  const [selectedTool, setSelectedTool] = useState("");
  const { id: boardId } = useParams();
  console.log("🚀 ~ BoardPage ~ id:", boardId);

  useEffect(() => {});

  return (
    <>
      <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
      <ReactKonva selectedTool={selectedTool} boardId={boardId} />
    </>
  );
};

export default BoardPage;
