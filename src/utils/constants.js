import { FaPen, FaEraser, FaRegSquare, FaRegCircle } from "react-icons/fa";

export const tools = [
  { name: "pen", icon: FaPen },
  { name: "eraser", icon: FaEraser },
  { name: "rect", icon: FaRegSquare },
  { name: "circle", icon: FaRegCircle },
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

export const strokeOption = {
  type: "stroke",
  name: "Stroke",
  properties: ["black", "red", "blue", "green", "orange"],
};

export const strokeWidthOption = {
  type: "strokeWidth",
  name: "Stroke Width",
  properties: [2, 3, 4],
};

export const fillColorOption = {
  type: "fillColor",
  name: "Fill Color",
  properties: ["", "black", "red", "blue", "green", "orange"],
};
