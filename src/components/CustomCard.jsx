import React from "react";
import { Box, List, ListItem, Typography } from "@mui/material";

const CustomCard = ({ item, value, setValue }) => {
  return (
    <Box>
      <Typography sx={{ fontSize: 12 }}>{item.name}</Typography>
      <List className="flex gap-2">
        {item.properties.map((prop) => (
          <ListItem
            key={prop}
            onClick={() => setValue(prop)}
            sx={{
              background: item.type === "stroke" ? prop : "#ededed",
              cursor: "pointer",
              borderRadius: 1,
              height: 20,
              maxWidth: 20,
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
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CustomCard;
