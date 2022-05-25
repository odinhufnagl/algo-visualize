import React from "react";
import Graph from "../Graph/Graph";
import Grid from "../Grid/Grid";

const Visualizer = ({
  type,
  speed,
  setSpeed,
  maxSpeed,
  isDisabled,
  nodes,
  edges,
  setNodes,
  setEdges,
  grid,
  setGrid,
  finderPositionRef,
  targetPositionRef,
  numRows,
  numCols,
  handleDelete,
  showWeights,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {type === "graph" ? (
        <Graph
          speed={speed}
          setSpeed={setSpeed}
          maxSpeed={maxSpeed}
          isDisabled={isDisabled}
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      ) : (
        <Grid
          grid={grid}
          setGrid={setGrid}
          speed={speed}
          maxSpeed={maxSpeed}
          setSpeed={setSpeed}
          isDisabled={isDisabled}
          finderPositionRef={finderPositionRef}
          targetPositionRef={targetPositionRef}
          numRows={numRows}
          numCols={numCols}
          handleDelete={handleDelete}
          showWeights={showWeights}
        />
      )}
    </div>
  );
};

export default Visualizer;
