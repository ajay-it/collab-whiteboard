import { FaPen, FaEraser } from "react-icons/fa";

export const tools = [
  { name: "pen", icon: FaPen },
  { name: "eraser", icon: FaEraser },
];

export const EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  BOARD: {
    CREATE: "board.create",
    DRAW: "board.draw",
    CLEAR: "board.clear",
  },

  SHAPE: {
    ADD: "shape.add",
    UPDATE: "shape.update",
    DELETE: "shape.delete",
  },

  COLLAB: {
    JOIN: "collab.join",
    LEAVE: "collab.leave",
  },
};
