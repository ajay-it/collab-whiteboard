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
    LOAD: "board.load",
    DRAW: "board.draw",
    CLEAR: "board.clear",
    FREEHAND: "board.freehand",
  },

  SHAPE: {
    ADD: "shape.add",
    UPDATE: "shape.update",
    DELETE: "shape.delete",
  },
};
