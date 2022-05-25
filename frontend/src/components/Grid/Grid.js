import {
  ButtonBase,
  Input,
  makeStyles,
  Modal,
  Slider,
} from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { ImagePicker } from "react-file-picker";
import { mazeAlgoritms } from "../../algos/mazeAlgoritms";
import { getHeightMapWeights } from "../../api";
import { Button, Icon, Spacer } from "../../common";
import { CELL_STATUS } from "../../constants";
import { ALGORITM_NAME as MAZE_ALGORITM_NAME } from "../../constants/maze";
import { copy } from "../../utils";

const DEFAULT_WEIGHT = 80;

const getCellStyle = (status, styles) => {
  switch (status) {
    case CELL_STATUS.WALL:
      return styles.cellWall;
    case CELL_STATUS.VISITED:
      return styles.cellVisited;
    case CELL_STATUS.PATH:
      return styles.cellPath;
    case CELL_STATUS.DISTANCE_CALCULATED:
      return styles.cellDistanceCalculated;
    case CELL_STATUS.END_VISITED:
      return styles.cellVisited;
    default:
      return;
  }
};

const getCellIcon = (status) => {
  switch (status) {
    case CELL_STATUS.TARGET:
      return "target";
    case CELL_STATUS.FINDER:
      return "arrowRight";
    case CELL_STATUS.END_VISITED:
      return "target";
    default:
      break;
  }
};

const getIconStyle = (status, styles) => {
  switch (status) {
    case CELL_STATUS.TARGET:
      return styles.targetIcon;
    case CELL_STATUS.END_VISITED:
      return styles.targetIcon;
    default:
      return;
  }
};

const showColorWeight = (status, weight, showWeights) => {
  return (
    status !== CELL_STATUS.WALL &&
    status !== CELL_STATUS.PATH &&
    weight > 0 &&
    !showWeights
  );
};

const showWeightText = (status, weight, showWeights) => {
  return (
    weight > 0 &&
    showWeights &&
    status !== CELL_STATUS.WALL &&
    status !== CELL_STATUS.TARGET &&
    status !== CELL_STATUS.FINDER
  );
};

//the cell is presented with a color based on its status, for example a wall will be red.
//notice how the cell also presents its weight

const Cell = ({
  status,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  weight,
  showWeights,
}) => {
  const styles = useStyles({ status });
  return (
    <div
      className={[styles.cellRoot, getCellStyle(status, styles)].join(" ")}
      style={
        showColorWeight(status, weight, showWeights)
          ? {
              backgroundColor: `rgba(${weight}, ${weight}, ${weight})`,
            }
          : {}
      }
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
    >
      {showColorWeight(status, weight, showWeights) && (
        <div
          style={{ width: "40%", height: "40%", borderRadius: 40 }}
          className={getCellStyle(status, styles)}
        />
      )}
      {getCellIcon(status) && (
        <Icon
          icon={getCellIcon(status)}
          iconSize="large"
          className={[getIconStyle(status, styles), styles.cellIcon].join(" ")}
        />
      )}
      {showWeightText(status, weight, showWeights) && (
        <ButtonBase style={{ color: "white" }} disabled>
          {weight}
        </ButtonBase>
      )}
    </div>
  );
};

//memoizing the cell for optimization
//it only updates
const MemoizedCell = React.memo(
  Cell,
  (prev, next) =>
    prev.status === next.status &&
    prev.curAlgoritm === next.curAlgoritm &&
    prev.weight === next.weight &&
    prev.showWeights === next.showWeights
);

//the grid is mainly given the grids coordinates and the ability to update these
const Grid = ({
  grid,
  setGrid,
  speed,
  maxSpeed,
  setSpeed,
  isDisabled,
  finderPositionRef,
  targetPositionRef,
  numRows,
  numCols,
  handleDelete,
  showWeights,
}) => {
  const gridRef = useRef();
  const isMouseDown = useRef();
  const isErasingRef = useRef();
  const isFinderCellMarked = useRef(); //true while we are moving the finder
  const isTargetCellMarked = useRef(); //true while we are moving the target
  const [isAddingWeights, setIsAddingWeights] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [showModalUpdateWeight, setShowModalUpdateWeight] = useState(false); //boolean
  const [updateWeightValue, setUpdateWeightValue] = useState(); //stores the edge-weight while we are updating it
  const [currentCellToUpdateWeight, setCurrentCellToUpdateWeight] = useState(); //the coordinate for the cell that is updating its weight
  const styles = useStyles({ numCols });
  const isAddingWeightsRef = useRef();
  const isDisabledRef = useRef();

  const addWeightsFromHeightMap = (heightMap) => {
    const gridCopy = copy(grid);
    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        gridCopy[y][x].weight = heightMap[y][x];
      }
    }
    setGrid(gridCopy);
  };

  const generateMapFromHeightMap = async (base64Img) => {
    const heightMapWeights = await getHeightMapWeights(
      base64Img,
      numCols,
      numRows
    );
    addWeightsFromHeightMap(heightMapWeights);
  };

  const handleErase = () => {
    setIsErasing((prev) => !prev);
    setIsAddingWeights((prev) => (prev ? !prev : prev));
  };

  const handleAddingWeight = () => {
    setIsAddingWeights((prev) => !prev);
    setIsErasing((prev) => (prev ? !prev : prev));
  };

  const handleCellOnClick = (y, x, isDragging) => {
    if (isDisabledRef.current) {
      return;
    }
    const newGrid = [...gridRef.current];
    //move finder
    if (
      isFinderCellMarked.current &&
      newGrid[y][x].status === CELL_STATUS.DEFAULT
    ) {
      newGrid[finderPositionRef.current.y][finderPositionRef.current.x].status =
        CELL_STATUS.DEFAULT;
      newGrid[y][x].status = CELL_STATUS.FINDER;
      finderPositionRef.current = { y, x };
      setGrid(newGrid);
    }
    //mark finder as marked if we click on it
    if (gridRef.current[y][x].status === CELL_STATUS.FINDER) {
      isFinderCellMarked.current = true;
      return;
    }
    //move target
    if (
      isTargetCellMarked.current &&
      newGrid[y][x].status === CELL_STATUS.DEFAULT
    ) {
      newGrid[targetPositionRef.current.y][targetPositionRef.current.x].status =
        CELL_STATUS.DEFAULT;
      newGrid[y][x].status = CELL_STATUS.TARGET;
      targetPositionRef.current = { y, x };
      setGrid(newGrid);
    }
    //mark target as marked if we click on it
    if (gridRef.current[y][x].status === CELL_STATUS.TARGET) {
      isTargetCellMarked.current = true;
      return;
    }
    //erase walls and weights
    if (isErasingRef.current) {
      newGrid[y][x].weight = 0;
      newGrid[y][x].status = CELL_STATUS.DEFAULT;
      setGrid(newGrid);
      return;
    }
    //add weight
    if (
      isAddingWeightsRef.current &&
      newGrid[y][x].status !== CELL_STATUS.WALL
    ) {
      if (newGrid[y][x].weight > 0 && !isDragging) {
        setCurrentCellToUpdateWeight({ x, y });
        setUpdateWeightValue(newGrid[y][x].weight);
        setShowModalUpdateWeight(true);
        return;
      } else if (newGrid[y][x].weight === 0) {
        newGrid[y][x].weight = DEFAULT_WEIGHT;
      }
    }
    //place wall
    if (!isAddingWeightsRef.current) {
      newGrid[y][x].status = CELL_STATUS.WALL;
      newGrid[y][x].weight = 0;
    }
    setGrid(newGrid);
  };

  //multiple useEffects so that we can use refs instead of states, because cell is memoized, some functions
  //in the cells are not always using the latest states
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    isErasingRef.current = isErasing;
  }, [isErasing]);

  useEffect(() => {
    isAddingWeightsRef.current = isAddingWeights;
  }, [isAddingWeights]);

  useEffect(() => {
    isDisabledRef.current = isDisabled;
  }, [isDisabled]);

  const generateRandomMaze = () => {
    //only using the recursive for now
    mazeAlgoritms(MAZE_ALGORITM_NAME.RECURSIVE)(
      grid,
      setGrid,
      numRows,
      numCols,
      finderPositionRef.current,
      targetPositionRef.current
    );
  };

  const handleUpdateWeight = (x, y, weight) => {
    const gridCopy = [...grid];
    gridCopy[y][x].weight = weight;
    setGrid(gridCopy);
    //reset all states that has been used during the update
    setCurrentCellToUpdateWeight();
    setUpdateWeightValue();
    setShowModalUpdateWeight(false);
  };

  return (
    <div className={styles.root}>
      <Modal
        open={showModalUpdateWeight}
        onClose={() => setShowModalUpdateWeight(false)}
      >
        <div className={styles.modal}>
          <Input
            placeholder="weight"
            value={updateWeightValue}
            onChange={(e) =>
              setUpdateWeightValue(parseFloat(e.target.value || 0))
            }
            className={styles.weightInput}
          />
          <Spacer spacing="large" />
          <Button
            disabled={updateWeightValue?.length === 0}
            title="update"
            onClick={() =>
              handleUpdateWeight(
                currentCellToUpdateWeight.x,
                currentCellToUpdateWeight.y,
                updateWeightValue
              )
            }
          />
        </div>
      </Modal>
      <div className={styles.middleContainer}>
        <div className={styles.gridContainer}>
          {grid.map((row, y) =>
            row.map((col, x) => (
              <MemoizedCell
                key={`${x} ${y}`}
                onMouseDown={() => {
                  isMouseDown.current = true;
                  handleCellOnClick(y, x, false);
                }}
                onMouseEnter={() => {
                  if (!isMouseDown.current) return;
                  handleCellOnClick(y, x, true);
                }}
                onMouseUp={() => {
                  isFinderCellMarked.current = false;
                  isTargetCellMarked.current = false;

                  isMouseDown.current = false;
                }}
                status={grid[y][x].status}
                weight={grid[y][x].weight}
                showWeights={showWeights}
              ></MemoizedCell>
            ))
          )}
        </div>
      </div>
      <div className={styles.actionsContainer}>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Slider
            style={{ width: 150, marginLeft: 30 }}
            aria-label="Speed"
            value={speed}
            onChange={(e, value) => setSpeed(value)}
            min={1}
            max={maxSpeed}
          />
          <Button type="secondary" icon="speed" iconSize="medium" disabled />
        </div>

        <div style={{ display: "flex", flexDirection: "row" }}>
          {/*<Button title="randomize" onClick={generateRandomMaze} />*/}

          <ImagePicker
            extensions={["jpg", "jpeg", "png"]}
            onChange={(base64) => generateMapFromHeightMap(base64)}
            dims={{
              minWidth: 0,
              maxWidth: 10000,
              minHeight: 0,
              maxHeight: 50000,
            }}
            onError={(errMsg) => {
              console.log(errMsg);
            }}
          >
            <Button title="Upload heightmap" />
          </ImagePicker>
          <Spacer direction="horizontal" />
          <Button title="Add maze" onClick={generateRandomMaze} />
          <Button
            type="secondary"
            icon="weight"
            iconSize="large"
            isMarkedIcon="weightFill"
            isMarked={isAddingWeights}
            onClick={handleAddingWeight}
          />
          <Button
            type="secondary"
            icon="eraser"
            isMarked={isErasing}
            isMarkedIcon="eraserFill"
            onClick={handleErase}
            iconSize="large"
          />
          <Button
            type="secondary"
            icon="delete"
            onClick={handleDelete}
            iconSize="large"
          />
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  middleContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: (props) => `repeat(${props.numCols}, 20px)`,
  },
  cellRoot: {
    borderColor: theme.palette.primary.grid.border,
    borderWidth: 0.5,
    borderStyle: "solid",
    height: 20,
    width: 20,
    backgroundColor: "transparent",
    transformOrigin: "center",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },

  cellWall: {
    backgroundColor: theme.palette.primary.grid.wall,
    animation: `$scaling 1000ms ${theme.transitions.easing.easeInOut}`,
  },
  cellVisited: {
    backgroundColor: theme.palette.primary.grid.visited,
    animation: `$scaling 1000ms ${theme.transitions.easing.easeInOut}`,
  },
  cellPath: {
    backgroundColor: theme.palette.primary.grid.path,
    animation: `$scaling2 500ms ${theme.transitions.easing.easeInOut}`,
  },
  cellDistanceCalculated: {
    backgroundColor: theme.palette.primary.grid.distanceCalculated,
    animation: `$scaling 1000ms ${theme.transitions.easing.easeInOut}`,
  },
  "@keyframes scaling": {
    "0%": {
      transform: "scale(0.1)",
    },
    "100%": {
      transform: "scale(1.0)",
    },
  },
  "@keyframes scaling2": {
    "0%": {
      transform: "scale(0.1)",
    },
    "100%": {
      transform: "scale(1.0)",
    },
  },
  actionsContainer: {
    width: "100%",
    justifyContent: "space-between",
    display: "flex",
    marginTop: 10,
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
  },
  weightInput: {
    color: "white",
  },
  targetIcon: {
    position: "relative",
    bottom: 10,
    left: 10,
  },
  cellIcon: {
    color: "lightblue",
    zIndex: 1000,
  },
}));

export default Grid;
