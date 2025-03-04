import React from "react";
import { tools } from "../utils/constants";

const Toolbar = ({ selectedTool, setSelectedTool }) => {
  console.log("🚀 ~ Toolbar ~ selectedTool:", selectedTool);

  return (
    <div className="bg-white drop-shadow-lg p-2 mt-4 max-w-[500px] m-auto">
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() =>
            setSelectedTool((prev) => (prev === tool.name ? "" : tool.name))
          }
          className={`cursor-pointer mx-2 p-2 rounded ${
            selectedTool === tool.name ? "bg-blue-100" : ""
          }`}
        >
          <tool.icon />
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
