import React from "react";
import { tools } from "../utils/constants";
import { Box, Button } from "@mui/material";
import CustomCard from "./CustomCard";

const Toolbar = ({
  selectedTool,
  setSelectedTool,
  stroke,
  setStroke,
  strokeWidth,
  setStrokeWidth,
}) => {
  return (
    <>
      <Box className="bg-white flex gap-4 drop-shadow-lg p-2 mt-4 w-[70%] left-1/2 -translate-x-1/2 z-10 fixed rounded">
        {tools.map((tool) => (
          <Button
            key={tool.name}
            sx={{
              color: "black",
              minWidth: 0,
              backgroundColor:
                selectedTool === tool.name ? "#ADD8E6" : "transparent",
            }}
            onClick={() =>
              setSelectedTool((prev) => (prev === tool.name ? "" : tool.name))
            }
            className="cursor-pointer"
          >
            <tool.icon />
          </Button>
        ))}
      </Box>
      <Box className="w-36 fixed h-60 drop-shadow-lg bg-white rounded top-36 ml-4 z-20 p-2 flex flex-col gap-2">
        <CustomCard
          item={{
            type: "stroke",
            name: "Stroke",
            properties: ["black", "red", "blue", "green", "orange"],
          }}
          value={stroke}
          setValue={setStroke}
        />
        <CustomCard
          item={{
            type: "strokeWidth",
            name: "Stroke Width",
            properties: [2, 3, 4],
          }}
          value={strokeWidth}
          setValue={setStrokeWidth}
        />
      </Box>
    </>
  );
};

export default Toolbar;
