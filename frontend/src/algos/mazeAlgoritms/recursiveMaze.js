import { isValid } from ".";
import { CELL_STATUS } from "../../constants";
import { shuffleArray } from "../../utils";

const dRow = [-1, 0, 1, 0];
const dCol = [0, 1, 0, -1];

export const recursiveMaze = async (
  grid,
  setGrid,
  numRows,
  numCols,
  startPos,
  endPos
) => {
  let visited = new Array(numRows);
  for (let i = 0; i < numRows; i++) {
    visited[i] = new Array(numCols);
  }
  visited[startPos.y][startPos.x] = true;

  const recursive = (x, y) => {
    const directions = shuffleArray([0, 1, 2, 3]);

    for (var i = 0; i < 4; i++) {
      let connectedX = x + dRow[directions[i]];
      let connectedY = y + dCol[directions[i]];
      let connectedXStepTwo = x + dRow[directions[i]] * 2;
      let connectedYStepTwo = y + dCol[directions[i]] * 2;

      //if both points in the direction is valid points
      if (
        isValid(connectedX, connectedY, numRows, numCols, visited) &&
        isValid(connectedXStepTwo, connectedYStepTwo, numRows, numCols, visited)
      ) {
        visited[connectedY][connectedX] = true;
        visited[connectedYStepTwo][connectedXStepTwo] = true;
        recursive(connectedXStepTwo, connectedYStepTwo);
      }
    }
  };

  recursive(startPos.x, startPos.y);

  const gridCopy = [...grid];
  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      if (gridCopy[y][x].status === CELL_STATUS.WALL) {
        gridCopy[y][x].status = CELL_STATUS.DEFAULT;
      }
      if (!visited[y][x] && !(endPos.y === y && endPos.x === x)) {
        gridCopy[y][x].status = CELL_STATUS.WALL;
      }
    }
  }
  if (
    [0, numCols - 1].includes(endPos.x) ||
    [0, numRows - 1].includes(endPos.y)
  ) {
    for (var i = 0; i < 4; i++) {
      let connectedX = endPos.x + dRow[i];
      let connectedY = endPos.y + dCol[i];

      if (isValid(connectedX, connectedY, numRows, numCols, visited)) {
        gridCopy[connectedY][connectedX].status = CELL_STATUS.DEFAULT;
      }
    }
  }

  setGrid(gridCopy);
};
