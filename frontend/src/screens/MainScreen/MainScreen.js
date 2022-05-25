import { makeStyles, Modal, Typography } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import Split from "react-split";
import { graphAlgoritms } from "../../algos/graphAlgoritms";
import { pathAlgoritms } from "../../algos/pathAlgoritms";
import { Button, Dropdown, Header, Spacer } from "../../common";
import { ColorRepresenter, Editor, Output, Visualizer } from "../../components";
import {
  CELL_STATUS,
  PROGRAMMING_LANGUAGES,
  PROGRAMMING_LANGUAGE_NAME,
} from "../../constants";
import { NODE_STATUS } from "../../constants/graph";
import { LOCAL_STORAGE_KEYS } from "../../localStorage";
import theme from "../../theme";
import { copy } from "../../utils";
import "./index.css";

const programmingLanguagesDropdownOptions = [
  { label: "javascript", value: PROGRAMMING_LANGUAGE_NAME.JAVASCRIPT },
  { label: "python", value: PROGRAMMING_LANGUAGE_NAME.PYTHON },
];

const visualizerTypesDropdownOptions = [
  { label: "graph", value: "graph" },
  { label: "grid", value: "grid" },
];

const showWeightsTypesDropdownOptions = [
  { label: "show weights", value: true },
  { label: "show colorweights", value: false },
];

const getDefaultNodes = (startCoordinate, endCoordinate) => {
  return {
    start: {
      coordinate: startCoordinate || { x: 0, y: 0 },
      connectedEdges: [],
      status: NODE_STATUS.START,
    },
    end: {
      coordinate: endCoordinate || { x: 150, y: 150 },
      connectedEdges: [],
      status: NODE_STATUS.END,
    },
  };
};

const getDefaultEdges = () => {
  return {};
};

const getDefaultGrid = (numRows, numCols, startPosFinder, startPosTarget) => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(
      Array.from(Array(numCols), () => ({
        status: CELL_STATUS.DEFAULT,
        weight: 0,
      }))
    );
  }
  if (rows[startPosTarget.y][startPosTarget.x]) {
    rows[startPosFinder.y][startPosFinder.x].status = CELL_STATUS.FINDER;
    rows[startPosTarget.y][startPosTarget.x].status = CELL_STATUS.TARGET;
  }
  return rows;
};

const MAX_SPEED = 1000;
const NUM_ROWS = 20;
const NUM_COLS = 20;
const START_POS_FINDER = { x: 0, y: 0 };
const START_POS_TARGET = { x: NUM_COLS - 1, y: NUM_ROWS - 1 };
const CELL_WIDTH = 20;

const MainScreen = () => {
  const styles = useStyles();
  const [showInfoModal, setShowInfoModal] = useState(); //when true we are showing the modal

  // states for grid
  const [numRows, setNumRows] = useState(NUM_ROWS);
  const [numCols, setNumCols] = useState(NUM_COLS);
  const [startPosFinder, setStartPosFinder] = useState(START_POS_FINDER);
  const [startPosTarget, setStartPosTarget] = useState(START_POS_TARGET);
  const [grid, setGrid] = useState(
    getDefaultGrid(numRows, numCols, startPosFinder, startPosTarget)
  );
  const [startRestart, setStartRestart] = useState(false);
  const gridRef = useRef();
  const finderPositionRef = useRef(startPosFinder);
  const targetPositionRef = useRef(startPosTarget);
  const gridBeforeVisualize = useRef();
  //

  // states for graph
  const [nodes, setNodes] = useState(getDefaultNodes());
  const [edges, setEdges] = useState(getDefaultEdges());
  const nodesBeforeVisualize = useRef();
  const edgesBeforeVisualize = useRef();
  //

  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizationCount, setVisualizationCount] = useState(0); //the count of visualizations we have done with the same code
  const [showWeights, setShowWeights] = useState(
    showWeightsTypesDropdownOptions[0]
  );
  const [visualizerType, setVisualizerType] = useState(
    visualizerTypesDropdownOptions[0]
  );
  const [programmingLanguage, setProgrammingLanguage] = useState(
    programmingLanguagesDropdownOptions[0]
  );
  const [editorTemplates, setEditorTemplates] = useState(
    Object.keys(
      PROGRAMMING_LANGUAGES[programmingLanguage.value].code[
        visualizerType.value
      ]
    ).map((key) => ({ label: key, value: key }))
  ); //editorTemplates differ from programmingLanguage and visualizerType, therefore it needs to be a state instead of variable
  const [editorTemplate, setEditorTemplate] = useState(editorTemplates[0]);
  const [editorCode, setEditorCode] = useState("");
  const [outputValue, setOutputValue] = useState();
  const [speed, setSpeed] = useState(0);
  const speedRef = useRef();
  const [visualizerIsDisabled, setVisualizerIsDisabled] = useState(false);
  const exitVisualizationRef = useRef(); //this becomes true when we want to end in the middle of visualization, during each iteration in the algoritm that is being run, we check if this is true

  //these states take care of the scenarios when we try to do an action in the middle of visualization
  const hasRewindedDuringVisualizationRef = useRef();
  const hasRestartedDuringVisualizationRef = useRef();
  const hasDeletedDuringVisualizationRef = useRef();
  const [loading, setLoading] = useState(false);

  //this useeffect takes care of adjusting the amount of columns to the screensize
  useEffect(() => {
    const myElement = document.createElement("div");
    const resizeObserver = new ResizeObserver(() => {
      const gridDiv = document.getElementById("gridContainer");
      const newNumCols = Math.floor(gridDiv.offsetWidth / CELL_WIDTH);
      const newStartPosTarget = { x: newNumCols - 1, y: numRows - 1 };
      setNumCols(newNumCols);
      setStartPosTarget(newStartPosTarget);
      setGrid(
        getDefaultGrid(numRows, newNumCols, startPosFinder, newStartPosTarget)
      );
      resizeObserver.disconnect();
    });
    resizeObserver.observe(myElement);
    document.body.append(myElement);
  }, []);

  //using refs on these states because there may be memoization in some functions in children that requires these to be refs
  useEffect(() => {
    targetPositionRef.current = startPosTarget;
  }, [startPosTarget]);
  useEffect(() => {
    finderPositionRef.current = startPosFinder;
  }, [startPosFinder]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  //function that is being run when there is a change in the code in the editor. With other words, when the user writes or delete code
  const handleEditorCodeChange = (newValue) => {
    setEditorCode(newValue);
    //if the current template is saved we want to save the code in localStorage so that its saved to future use
    if (editorTemplate.value === "saved") {
      localStorage.setItem(
        visualizerType.value === "graph"
          ? LOCAL_STORAGE_KEYS.GRAPH_EDITOR_CODE[programmingLanguage.value]
          : LOCAL_STORAGE_KEYS.GRID_EDITOR_CODE[programmingLanguage.value],
        newValue
      );
    }
  };

  //when template is updated, we also need to update the code so that it matches the new template
  useEffect(() => {
    setEditorCode(
      PROGRAMMING_LANGUAGES[programmingLanguage.value].code[
        visualizerType.value
      ][editorTemplate.value]()
    );
  }, [editorTemplate]);

  useEffect(() => {
    const newEditorTemplates = Object.keys(
      PROGRAMMING_LANGUAGES[programmingLanguage.value].code[
        visualizerType.value
      ]
    ).map((key) => ({ label: key, value: key }));
    //update the templates because different languages and graph and grid have different templates available
    setEditorTemplates(newEditorTemplates);
    setEditorTemplate(newEditorTemplates[0]);
  }, [programmingLanguage, visualizerType]);

  const handlePlay = () => {
    //if the code has already been run before, play should means the same as restart
    if (visualizationCount > 0) {
      handleRestart();
      return;
    }
    setIsVisualizing(true);
  };

  const handleRewind = () => {
    if (isVisualizing) {
      //we need to know what caused the exit, in this case it was exited with the help of rewinding-button
      hasRewindedDuringVisualizationRef.current = true;
      //exit the algoritm that is running
      exitVisualizationRef.current = true;
      return;
    }
    if (visualizerType.value === "graph") {
      setNodes(nodesBeforeVisualize.current);
      setEdges(edgesBeforeVisualize.current);
    }
    if (visualizerType.value === "grid") {
      setGrid(gridBeforeVisualize.current);
    }
    //reset
    setVisualizationCount(0);
    setVisualizerIsDisabled(false);
  };

  const handleRestart = () => {
    if (isVisualizing) {
      //we later need to know what caused the exit, in this case it was exited with the help of restart-button
      hasRestartedDuringVisualizationRef.current = true;
      //exit the algoritm that is running
      exitVisualizationRef.current = true;
      return;
    }
    if (visualizerType.value === "graph") {
      setNodes(nodesBeforeVisualize.current);
      setEdges(edgesBeforeVisualize.current);
    }
    if (visualizerType.value === "grid") {
      setGrid(gridBeforeVisualize.current);
    }
    //before starting the visualization again we need to make sure that the grid/graph has been updated to its "beforeVisualize"
    //therefore we set startRestart to true and in a later useEffect we can check if startRestart is true and the grid/graph has been updated to its beforeVisualize
    //then we proceed to start the visualization again
    setStartRestart(true);
    setVisualizationCount((prev) => prev + 1);
  };

  const handleDelete = () => {
    if (isVisualizing) {
      //we later need to know what caused the exit, in this case it was exited with the help of delete-button
      hasDeletedDuringVisualizationRef.current = true;
      //exit the algoritm that is running
      exitVisualizationRef.current = true;
      return;
    }
    //reset
    setGrid(getDefaultGrid(numRows, numCols, startPosFinder, startPosTarget));
    setNodes(getDefaultNodes());
    setEdges(getDefaultEdges());
    setVisualizationCount(0);
    setVisualizerIsDisabled(false);
    finderPositionRef.current = startPosFinder;
    targetPositionRef.current = startPosTarget;
  };

  useEffect(() => {
    //if the grid/graph has been updated to how it looked before visualization and we have set startRestart to true
    //run the visualization
    if (visualizerType.value === "grid") {
      if (
        startRestart &&
        grid.toString() === gridBeforeVisualize.current.toString()
      ) {
        setIsVisualizing(true);
        setStartRestart(false);
      }
    }
    if (visualizerType.value === "graph") {
      if (
        startRestart &&
        nodes.toString() === nodesBeforeVisualize.current.toString() &&
        edges.toString() === edgesBeforeVisualize.current.toString()
      ) {
        setIsVisualizing(true);
        setStartRestart(false);
      }
    }
  }, [grid, startRestart, nodes, edges]);

  const handleVisualize = async () => {
    setLoading(true);
    //here we run the code that the user has written. The functions below have the availiability to update the graph and grid, for example change the status of a node
    visualizerType.value === "graph"
      ? await graphAlgoritms(
          editorCode,
          speedRef,
          MAX_SPEED,
          exitVisualizationRef,
          nodes,
          edges,
          setNodes,
          setEdges,
          setOutputValue,
          programmingLanguage.value,
          setLoading
        )
      : await pathAlgoritms(
          editorCode,
          speedRef,
          MAX_SPEED,
          exitVisualizationRef,
          grid,
          setGrid,
          setOutputValue,
          programmingLanguage.value,
          setLoading,
          finderPositionRef.current,
          targetPositionRef.current
        );
    setLoading(false);
    setIsVisualizing(false);
  };

  useEffect(() => {
    (async () => {
      if (isVisualizing) {
        if (visualizerType.value === "graph") {
          edgesBeforeVisualize.current = copy(edges);
          nodesBeforeVisualize.current = copy(nodes);
        }
        if (visualizerType.value === "grid") {
          gridBeforeVisualize.current = copy(grid);
        }
        setVisualizationCount((prev) => prev + 1);
        setVisualizerIsDisabled(true);
        await handleVisualize();
      } else {
        //if we excited the algo with an action such as rewind/restart/delete, we set one of these refs to true
        //and then we run the actions
        if (hasRewindedDuringVisualizationRef.current) {
          handleRewind();
          hasRewindedDuringVisualizationRef.current = false;
          exitVisualizationRef.current = false;
          return;
        }
        if (hasRestartedDuringVisualizationRef.current) {
          handleRestart();
          hasRestartedDuringVisualizationRef.current = false;
          exitVisualizationRef.current = false;
          return;
        }
        if (hasDeletedDuringVisualizationRef.current) {
          handleDelete();
          hasDeletedDuringVisualizationRef.current = false;
          exitVisualizationRef.current = false;
          return;
        }
      }
    })();
  }, [isVisualizing]);

  const updateVisualizerType = (newType) => {
    //when we change from graph to grid or the opposite, we want to delete everything so that there are no weird bugs if we are changing between them
    handleDelete();
    setVisualizerType(newType);
  };

  const getInfoModalContent = () => {
    switch (visualizerType.value) {
      case "graph":
        return (
          <>
            <Typography className={styles.modalText} variant="h4">
              move nodes by dragging them
            </Typography>
            <Spacer />
            <Typography className={styles.modalText} variant="h4">
              double click on node to draw an edge
            </Typography>
          </>
        );

      case "grid":
        return (
          <>
            <Typography className={styles.modalText} variant="h4">
              place wall by clicking on the cells
            </Typography>
            <Spacer />
            <Typography className={styles.modalText} variant="h4">
              place weights by first marking the weight in the menu, then click
              on cells
            </Typography>
          </>
        );

      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <Header showVisualizationButton={false}></Header>
      <Modal open={showInfoModal} onClose={() => setShowInfoModal(false)}>
        <div className={styles.modal}>
          {getInfoModalContent()} <Spacer />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ColorRepresenter
              color={theme.palette.primary.grid.visited}
              text="visited"
            />
            <Spacer />
            <ColorRepresenter
              color={theme.palette.primary.grid.wall}
              text="wall"
            />
            <Spacer />
            <ColorRepresenter
              color={theme.palette.primary.grid.path}
              text="path"
            />
            <Spacer />
            <ColorRepresenter
              color={theme.palette.primary.grid.distanceCalculated}
              text="distanceCalculated"
            />
          </div>
        </div>
      </Modal>
      <div className={styles.contentContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.graphContainer} id="gridContainer">
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Dropdown
                  isDisabled={isVisualizing}
                  options={visualizerTypesDropdownOptions}
                  value={visualizerType}
                  onChange={updateVisualizerType}
                ></Dropdown>
                {visualizerType.value === "grid" && (
                  <Dropdown
                    options={showWeightsTypesDropdownOptions}
                    value={showWeights}
                    onChange={setShowWeights}
                  ></Dropdown>
                )}
              </div>

              <Button
                onClick={() => setShowInfoModal(true)}
                icon="info"
                type="secondary"
                iconSize="medium"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: 0,
                }}
              />
            </div>
            <Spacer />
            <Visualizer
              type={visualizerType.value}
              speed={speed}
              setSpeed={setSpeed}
              maxSpeed={MAX_SPEED}
              isDisabled={visualizerIsDisabled}
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              grid={grid}
              setGrid={setGrid}
              finderPositionRef={finderPositionRef}
              targetPositionRef={targetPositionRef}
              numRows={numRows}
              numCols={numCols}
              handleDelete={handleDelete}
              showWeights={showWeights.value}
            />
          </div>
        </div>
        <Split direction="vertical" className={styles.split} sizes={[80, 20]}>
          <div className={styles.editorContainer}>
            <Editor
              templates={editorTemplates}
              template={editorTemplate}
              setTemplate={setEditorTemplate}
              handlePlay={handlePlay}
              handleRewind={handleRewind}
              handleRestart={handleRestart}
              language={programmingLanguage}
              setLanguage={setProgrammingLanguage}
              languages={programmingLanguagesDropdownOptions}
              onChange={handleEditorCodeChange}
              code={editorCode}
              isPlayButtonDisabled={isVisualizing}
              isRestartButtonDisabled={
                !isVisualizing && visualizationCount === 0
              }
              isRewindButtonDisabled={
                !isVisualizing && visualizationCount === 0
              }
            ></Editor>
          </div>
          <div className={styles.outputContainer}>
            <Spacer />
            <Typography className={styles.outputTitle}>OUTPUT</Typography>
            <Spacer />
            <Output value={outputValue} loading={loading} />
          </div>
        </Split>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  leftContainer: {
    width: "50%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  graphContainer: {
    width: "90%",
    height: "90%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  split: {
    display: "flex",
    flexDirection: "column",
    height: "90%",
    width: "50%",
  },
  editorContainer: {
    width: "100%",
  },
  outputContainer: {
    width: "100%",
  },
  outputTitle: {
    color: "white",
    fontWeight: 400,
    fontSize: 12,
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(46, 46, 46, 0.5)",
    padding: 30,
    borderRadius: 10,
  },
  modalText: {
    fontWeight: 500,
    color: "white",
  },
}));

export default MainScreen;
