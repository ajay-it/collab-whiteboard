import { FaPen, FaEraser, FaRegSquare } from "react-icons/fa";

export const tools = [
  { name: "pen", icon: FaPen },
  { name: "eraser", icon: FaEraser },
  { name: "rect", icon: FaRegSquare },
];

export const EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",

  BOARD: {
    CREATE: "board.create",
    LOAD: "board.load",
    DRAW: "board.draw",
  },

  SHAPE: {
    CREATE: "shape.create",
    DRAW: "shape.draw",
    SAVE: "shape.save",
    DELETE: "shape.delete",
  },
};
