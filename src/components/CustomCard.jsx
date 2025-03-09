import React from "react";
import { Box, List, ListItem, Typography } from "@mui/material";
import { MdOutlineBlock } from "react-icons/md";

const CustomCard = ({ item, value, setValue }) => {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, textAlign: "left", width: "100%" }}>
        {item.name}
      </Typography>
      <List className="flex gap-1 flex-wrap">
        {item.properties.map((prop) => (
          <ListItem
            key={prop}
            onClick={() => setValue(prop)}
            sx={{
              background: item.type === "strokeWidth" ? "#ededed" : prop,
              cursor: "pointer",
              borderRadius: 1,
              height: 20,
              width: 20,
              p: 0,
              justifyContent: "center",
              alignItems: "center",
              border: "2px solid transparent",
              ...(value === prop && {
                border: "2px solid white",
                boxShadow: "0 0 0 1px blue",
              }),
            }}
          >
            {item.type === "strokeWidth" && (
              <Box
                sx={{
                  height: `${prop}px`,
                  width: "12px",
                  background: "black",
                  borderRadius: "4px",
                }}
              ></Box>
            )}
            {item.type === "fillColor" && prop === "" && (
              <MdOutlineBlock color="#3d3d3d" />
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CustomCard;
