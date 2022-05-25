import { compileCode } from "../../api";
import { PROGRAMMING_LANGUAGES } from "../../constants";
import { CELL_STATUS } from "../../constants/path";
import {
  getLastArrayInString,
  getStringExceptLastArray,
  sleep,
} from "../../utils";

export const isValid = (grid, x, y, numRows, numCols) => {
  if (x >= numCols || x < 0 || y >= numRows || y < 0) {
    return;
  }
  if (
    grid[y][x].status === CELL_STATUS.VISITED ||
    grid[y][x].status === CELL_STATUS.WALL ||
    grid[y][x].status === CELL_STATUS.FINDER
  ) {
    return;
  }
  return true;
};

export const pathAlgoritms = async (
  mainCode,
  speedRef,
  maxSpeed,
  exitVisualizationRef,
  grid,
  setGrid,
  setOutputValue,
  languageName,
  setLoading,
  startPos,
  endPos
) => {
  const delay = async () => {
    await sleep(maxSpeed - speedRef.current);
  };

  const runActions = async (actions) => {
    for (let i = 0; i < actions.length; i++) {
      if (exitVisualizationRef.current) return;
      //each action represent an update on a cell, which mean its placement and a new status
      const { x, y, status } = actions[i];

      const gridCopy = [...grid];
      if (!gridCopy[y][x]) {
        continue;
      }
      if (
        status === CELL_STATUS.VISITED &&
        gridCopy[y][x].status === CELL_STATUS.TARGET
      ) {
        gridCopy[y][x].status = CELL_STATUS.END_VISITED;
      }
      gridCopy[y][x].status = status;
      setGrid(gridCopy);
      //between each action we want to delay so the actions are not run as fast as possible. Without the delay, the computer is so fast so you will see all
      //the actions happening at the same time
      await delay();
    }
  };
  //languageObject contains {id, name, code-examples for both graph and grid, templates that should wrap the users-code when sent to the API }
  //the templates will produce output in the code that we need to use to visualize
  const languageObject = PROGRAMMING_LANGUAGES[languageName];
  //clean the output-component
  setOutputValue("");

  const params = { grid, startPos, endPos };
  const { output, isError } = await compileCode(
    languageObject.template.grid(mainCode),
    params,
    languageObject.id
  );

  setLoading(false);
  //the output given to us from the API is the output the code gave us. This means output that the user put in the code + the output the template gave
  //these two needs to be separated, the first one shoule be shown in outputValue. The other one should be used to run actions, meaning to visualize.
  setOutputValue(isError ? output : getStringExceptLastArray(output));
  await runActions(!isError && getLastArrayInString(output));
};
