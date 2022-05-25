import { ALGORITM_NAME } from "../../constants/maze";
import { recursiveMaze } from "./recursiveMaze";

export const mazeAlgoritms = (algoritmName) => {
  switch (algoritmName) {
    case ALGORITM_NAME.RECURSIVE:
      return recursiveMaze;
    default:
      break;
  }
};

export const isValid = (x, y, numRows, numCols, visited) => {
  if (x >= numCols || x < 0 || y >= numRows || y < 0) {
    return;
  }
  if (visited[y][x]) {
    return;
  }
  return true;
};
