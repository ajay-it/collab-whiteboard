import { Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const HomePage = () => {
  const navigate = useNavigate();

  const navigateToBoardPage = () => {
    const uniqueBoardId = uuidv4();

    navigate(`/board/${uniqueBoardId}`);
  };

  return (
    <div className="p-2 w-full flex flex-col items-center mt-5 gap-4">
      <Button
        variant="contained"
        onClick={navigateToBoardPage}
        className="m-auto"
      >
        Create a board
      </Button>
      <Typography>Enter URL to join a collab</Typography>
    </div>
  );
};

export default HomePage;
