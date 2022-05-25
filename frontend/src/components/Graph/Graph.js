import {
  Input,
  makeStyles,
  Modal,
  Slider,
  Typography,
} from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import { Button, Icon, Spacer } from "../../common";
import { EDGE_STATUS, NODE_STATUS } from "../../constants/graph";
import { copy } from "../../utils";

const NODE_RADIUS = 40;
const GRAPH_ID = "graphId";
const SLEEP_DURING_PATH = 1000;
const SLEEP_NODE_CHANGE = 200;

const getNodeStyle = (status, styles) => {
  switch (status) {
    case NODE_STATUS.VISITED:
      return styles.nodeVisitedContainer;
    case NODE_STATUS.START:
      return styles.nodeStartContainer;
    case NODE_STATUS.END:
      return styles.nodeEndContainer;
    case NODE_STATUS.DISTANCE_CALCULATED:
      return styles.nodeDistanceCalculatedContainer;
    case NODE_STATUS.END_VISITED:
      return styles.nodeEndVisitedContainer;
    case NODE_STATUS.PATH:
      return styles.nodePathContainer;
    default:
      return;
  }
};

//the node is mainly used to present the node-status with the help of different color
//is also needs to know its coordinate so we can render it
//in the right place on the screen
const Node = ({ nodeId, onMouseDown, coordinate, status }) => {
  const styles = useStyles({
    nodeX: coordinate.x,
    nodeY: coordinate.y,
  });

  return (
    <div
      id={nodeId}
      onMouseDown={(e) => onMouseDown(e, nodeId)}
      className={[
        styles.nodeDefaultContainer,
        getNodeStyle(status, styles),
      ].join(" ")}
    >
      <Typography className={styles.nodeText} variant="h5">
        {nodeId}
      </Typography>
    </div>
  );
};

const getEdgeLineStyle = (status, styles) => {
  switch (status) {
    case EDGE_STATUS.PATH:
      return styles.edgePathLine;
    default:
      return;
  }
};

const getEdgePathStyle = (status, styles) => {
  switch (status) {
    case EDGE_STATUS.PATH:
      return styles.edgePathContainer;
    default:
      return;
  }
};

//is mainly given the two points the edge should connect between
//it should also be clickable to allow the weight to be updated
const Edge = ({
  edgeId,
  weight,
  p1,
  p2,
  openModalUpdateWeight,
  status,
  onClick,
}) => {
  const { width, left, top, transform } = getLineBetweenPoints(p1, p2);
  const styles = useStyles({
    edgeX: left,
    edgeY: top,
    edgeTransform: transform,
    edgeWidth: width,
  });

  return (
    <div
      id={edgeId}
      className={[styles.edgeContainer, getEdgePathStyle(status, styles)].join(
        " "
      )}
    >
      <div className={styles.edgeContentContainer}>
        <Typography className={styles.weight} onClick={openModalUpdateWeight}>
          {weight}
        </Typography>
        <Icon icon="arrowRight" style={{ color: "white" }} iconSize="large" />
      </div>
      <div
        onClick={onClick}
        className={[styles.edgeLine, getEdgeLineStyle(status, styles)].join(
          " "
        )}
      />
    </div>
  );
};

//takes two coordinates and returns the useful information
//to render a line between these two coordinates on the screen
const getLineBetweenPoints = (p1, p2) => {
  if (!p1 || !p2) {
    return;
  }
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;
  var length = Math.sqrt(a * a + b * b);
  var angleDeg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  var xshift = length - Math.abs(p2.x - p1.x);
  var yshift = Math.abs(p1.y - p2.y) / 2;
  const width = length;
  const left =
    (angleDeg > 90 || angleDeg < -90 ? p2.x : p1.x) - xshift / 2 + NODE_RADIUS;
  const top = Math.min(p1.y, p2.y) + yshift + NODE_RADIUS;
  const transform = "rotate(" + angleDeg + "deg)";
  return {
    width,
    left,
    top,
    transform,
  };
};

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

const Graph = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  maxSpeed,
  isDisabled,
  speed,
  setSpeed,
}) => {
  const styles = useStyles();
  const isMouseDown = useRef();
  const currentNodeMarked = useRef();

  const drawingLineFrom = useRef(); //nodeId
  const currentEdgeMarked = useRef();
  const getEdgeId = useRef(1); //a counter so we can get a new edgeId. Becomes +1 after its been used
  const [showModalCreateNode, setShowModalCreateNode] = useState(); //boolean
  const [createNodeValue, setCreateNodeValue] = useState(""); //stores the node-id while we are creating it
  const [updateWeightValue, setUpdateWeightValue] = useState(""); //stores the edge-weight while we are updating it
  const [showModalUpdateWeight, setShowModalUpdateWeight] = useState(); //boolean
  const [currentEdgeToUpdate, setCurrentEdgeToUpdate] = useState();
  const [isDeleting, setIsDeleting] = useState(false);

  //only used to place the start-node and end-node on each side in the middle of the parent component
  useEffect(() => {
    const myElement = document.createElement("div");
    const resizeObserver = new ResizeObserver(() => {
      setNodes(
        getDefaultNodes(
          {
            x: 30,
            y:
              document.getElementById(GRAPH_ID)?.offsetHeight / 2 - NODE_RADIUS,
          },
          {
            x:
              document.getElementById(GRAPH_ID)?.offsetWidth -
              NODE_RADIUS * 2 -
              30,
            y:
              document.getElementById(GRAPH_ID)?.offsetHeight / 2 - NODE_RADIUS,
          }
        )
      );
      resizeObserver.disconnect();
    });
    resizeObserver.observe(myElement);
    document.body.append(myElement);
  }, []);

  const nodeOnMouseDown = (e, nodeId) => {
    if (isDisabled) {
      return;
    }
    if (isDeleting && nodeId !== "start" && nodeId !== "end") {
      deleteNode(nodeId);
    }

    isMouseDown.current = true;

    //single-click (moving node)
    if (e.detail === 1) {
      currentNodeMarked.current = nodeId;
    }
    //double-click (creating a line)
    if (e.detail === 2) {
      drawingLineFrom.current = nodeId;
      createEdge();
    }
  };

  const existsEdgeFromNode1ToNode2 = (node1Id, node2Id) => {
    let existsEdge = false;
    const node1 = nodes[node1Id];
    node1.connectedEdges.forEach((edgeId) => {
      if (existsEdge) {
        return;
      }
      const connectedEdge = edges[edgeId];
      if (connectedEdge.to === node2Id) {
        existsEdge = true;
      }
    });
    return existsEdge;
  };

  const coordinateIsInsideNode = (coordinate, nodeCoordinate, nodeRadius) => {
    return (
      coordinate.x < nodeCoordinate.x + nodeRadius &&
      coordinate.x > nodeCoordinate.x - nodeRadius &&
      coordinate.y > nodeCoordinate.y - nodeRadius &&
      coordinate.y < nodeCoordinate.y + nodeRadius
    );
  };

  const connectEdgeToNode = (edgeId, endCoordinate) => {
    const edgesCopy = copy(edges);
    const nodesCopy = copy(nodes);
    const edge = edgesCopy[edgeId];
    Object.keys(nodesCopy).forEach((nodeId) => {
      //we have found our node to connect to, skip the rest of iterations
      if (edge.to) {
        return;
      }
      const nodeLineTo = nodesCopy[nodeId];
      // if p2 on the edge is inside the node (and is not the same node, and there is not already a connection)
      if (
        !existsEdgeFromNode1ToNode2(drawingLineFrom.current, nodeId) &&
        nodeId !== drawingLineFrom.current &&
        coordinateIsInsideNode(
          endCoordinate,
          nodeLineTo.coordinate,
          NODE_RADIUS
        )
      ) {
        nodeLineTo.connectedEdges.push(edgeId);
        nodesCopy[drawingLineFrom.current].connectedEdges.push(edgeId);
        edge.to = nodeId;
      }
    });

    //if we did not find any node to connect to, delete the edge
    if (!edge.to) {
      delete edgesCopy[edgeId];
    }

    setNodes(nodesCopy);
    setEdges(edgesCopy);
  };

  const graphOnMouseUp = (e) => {
    if (isDisabled) {
      return;
    }
    isMouseDown.current = false;
    currentNodeMarked.current = undefined;

    //if we are currently creating a new edge
    if (currentEdgeMarked.current) {
      const parentDiv = document.getElementById(GRAPH_ID);
      connectEdgeToNode(currentEdgeMarked.current, {
        x: e.clientX - parentDiv.offsetLeft - NODE_RADIUS,
        y: e.clientY - parentDiv.offsetTop - NODE_RADIUS,
      });
    }
    currentEdgeMarked.current = undefined;
    drawingLineFrom.current = undefined;
  };

  const moveNode = (e) => {
    if (isDisabled) {
      return;
    }
    const parentDiv = document.getElementById(GRAPH_ID);
    const nodesCopy = copy(nodes);
    //moving the node to new coordinate
    const curNode = nodesCopy[currentNodeMarked.current];
    curNode.coordinate = {
      x: parseFloat(e.clientX - parentDiv.offsetLeft - NODE_RADIUS),
      y: parseFloat(e.clientY - parentDiv.offsetTop - NODE_RADIUS),
    };
    setNodes(nodesCopy);
  };

  const createEdge = () => {
    const edgesCopy = copy(edges);
    const newEdgeId = getEdgeId.current.toString();
    currentEdgeMarked.current = newEdgeId;
    getEdgeId.current += 1;
    const newEdge = {
      from: drawingLineFrom.current,
      to: null,
      weight: 10,
      p2: nodes[drawingLineFrom.current].coordinate,
    };
    edgesCopy[newEdgeId] = newEdge;
    setEdges(edgesCopy);
  };

  const isValid = (x, y, parentDiv, nodeRadius) => {
    if (x - parentDiv.offsetLeft - nodeRadius < 0) return;
    if (x - (parentDiv.offsetLeft + parentDiv.offsetWidth) + nodeRadius > 0)
      return;
    if (y - parentDiv.offsetTop - nodeRadius < 0) return;
    if (y - (parentDiv.offsetTop + parentDiv.offsetHeight) + nodeRadius > 0)
      return;
    return true;
  };

  const graphOnMouseMove = (e) => {
    const parentDiv = document.getElementById(GRAPH_ID);
    if (
      isDisabled ||
      !isMouseDown.current ||
      !isValid(e.clientX, e.clientY, parentDiv, NODE_RADIUS)
    ) {
      return;
    }

    //we are moving a node (single-click)
    if (currentNodeMarked.current) {
      moveNode(e);
    }

    //we are drawing an edge (double-click)
    if (currentEdgeMarked.current) {
      const edgesCopy = copy(edges);
      const edge = edgesCopy[currentEdgeMarked.current];
      const parentDiv = document.getElementById(GRAPH_ID);
      edge.p2 = {
        x: e.clientX - parentDiv.offsetLeft - NODE_RADIUS,
        y: e.clientY - parentDiv.offsetTop - NODE_RADIUS,
      };
      setEdges(edgesCopy);
    }
  };

  const updateWeight = (edgeId, weight) => {
    const edgesCopy = { ...edges };
    edgesCopy[edgeId].weight = weight;
    setEdges(edgesCopy);
  };

  const handleUpdateWeight = (edgeId, weight) => {
    updateWeight(edgeId, weight);
    setCurrentEdgeToUpdate();
    setUpdateWeightValue();
    setShowModalUpdateWeight(false);
  };

  const renderNode = (nodeId, index) => {
    const value = nodes[nodeId];
    return (
      <Node
        onMouseDown={nodeOnMouseDown}
        nodeId={nodeId}
        coordinate={value.coordinate}
        status={value.status}
      />
    );
  };

  const doesNodeExist = (name) => nodes[name];
  copy();
  const createNode = (name) => {
    const nodesCopy = copy(nodes);
    nodesCopy[name] = {
      coordinate: { x: 150, y: 150 },
      connectedEdges: [],
      status: NODE_STATUS.DEFAULT,
    };
    setNodes(nodesCopy);
  };

  const deleteNode = (name) => {
    const nodesCopy = copy(nodes);
    const node = nodesCopy[name];
    deleteEdges(node.connectedEdges);
    delete nodesCopy[name];
    setNodes(nodesCopy);
  };

  const deleteEdges = (edgesId) => {
    const edgesCopy = copy(edges);
    const nodesCopy = copy(nodes);

    edgesId.forEach((edgeId) => {
      const edge = edgesCopy[edgeId];
      nodesCopy[edge.from].connectedEdges = nodes[
        edge.from
      ].connectedEdges.filter((connectedEdgeId) => connectedEdgeId !== edgeId);
      nodesCopy[edge.to].connectedEdges = nodes[edge.to].connectedEdges.filter(
        (connectedEdgeId) => connectedEdgeId !== edgeId
      );
      delete edgesCopy[edgeId];
    });
    setNodes(nodesCopy);
    setEdges(edgesCopy);
  };

  const handleCreateNode = (name) => {
    createNode(name);
    setShowModalCreateNode(false);
    setCreateNodeValue("");
  };

  const openModalUpdateWeight = (edgeId, weight) => {
    setCurrentEdgeToUpdate(edgeId);
    setUpdateWeightValue(weight);
    setShowModalUpdateWeight(true);
  };

  const handleEdgeOnClick = (edgeId) => {
    if (isDisabled) {
      return;
    }
    if (isDeleting) {
      deleteEdges([edgeId]);
    }
  };

  const isAllowedToCreateNode = () =>
    createNodeValue.length > 0 &&
    !doesNodeExist(createNodeValue) &&
    //no "[" "]" because these could cause trouble with the JSON-parsing in our request to the API that runs our algoritm-code
    !createNodeValue.includes("[") &&
    !createNodeValue.includes("]");

  const renderEdge = (key, index) => {
    const value = edges[key];

    return (
      <Edge
        edgeId={key}
        p1={nodes[value.from]?.coordinate}
        //value.p2 is only set during the time
        //we are dragging the line, otherwise
        //we get our coordinates from where our nodes are located
        p2={nodes[value.to]?.coordinate || value.p2}
        weight={value.weight}
        openModalUpdateWeight={() =>
          !isDisabled && openModalUpdateWeight(key, value.weight)
        }
        status={value.status}
        onClick={() => handleEdgeOnClick(key)}
      />
    );
  };

  return (
    <div className={styles.root}>
      <Modal
        open={showModalCreateNode}
        onClose={() => setShowModalCreateNode(false)}
      >
        <div className={styles.modal}>
          <Input
            placeholder="name"
            value={createNodeValue}
            onChange={(e) => setCreateNodeValue(e.target.value)}
            className={styles.nodeNameInput}
          />
          <Spacer spacing="large" />
          <Button
            disabled={!isAllowedToCreateNode()}
            title="create node"
            onClick={() => handleCreateNode(createNodeValue)}
          />
        </div>
      </Modal>
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
            className={styles.nodeNameInput}
          />
          <Spacer spacing="large" />
          <Button
            disabled={updateWeightValue?.length === 0}
            title="update"
            onClick={() =>
              handleUpdateWeight(currentEdgeToUpdate, updateWeightValue)
            }
          />
        </div>
      </Modal>
      <div
        id={GRAPH_ID}
        className={styles.graphContainer}
        onMouseMove={graphOnMouseMove}
        onMouseUp={graphOnMouseUp}
      >
        {Object.keys(nodes).map(renderNode)}
        {Object.keys(edges).map(renderEdge)}
      </div>
      <Spacer spacing="large" />

      <div className={styles.bottomContainer}>
        <div className={styles.bottomLeftContainer}>
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
        <div
          style={{
            flexDirection: "row",
            display: "flex",
          }}
        >
          <Button
            type="secondary"
            icon="delete"
            iconSize="large"
            isMarkedIcon="deleteFill"
            isMarked={isDeleting}
            onClick={() => setIsDeleting((prev) => !prev)}
            disabled={isDisabled}
          />
          <Button
            title="Add node"
            onClick={() => setShowModalCreateNode(true)}
            disabled={isDisabled}
          />
          <Spacer direction="horizontal" spacing="medium" />
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  graphContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.palette.primary.border,
    borderStyle: "solid",
    borderRadius: 5,
    position: "relative",
  },
  nodeDefaultContainer: {
    height: NODE_RADIUS * 2,
    width: NODE_RADIUS * 2,
    borderRadius: 10000,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    position: "absolute",
    zIndex: 100,
    left: (props) => props.nodeX + "px",
    top: (props) => props.nodeY + "px",
    borderStyle: "solid",
    borderWidth: 3,
    borderColor: "white",
    transition: `background-color ${SLEEP_NODE_CHANGE}ms linear`,
    backgroundColor: theme.palette.primary.backgroundColor,
    transformOrigin: "center",
    animation: `$scaling 800ms ${theme.transitions.easing.easeInOut}`,
  },
  nodeVisitedContainer: {
    backgroundColor: theme.palette.primary.graph.visited,
  },

  nodeStartContainer: {
    borderColor: theme.palette.primary.graph.start,
  },
  nodeEndContainer: {
    borderColor: theme.palette.primary.graph.end,
  },
  nodeDistanceCalculatedContainer: {
    backgroundColor: theme.palette.primary.graph.distanceCalculated,
    animation: `$scaling 1000ms ${theme.transitions.easing.easeInOut}`,
  },
  nodeEndVisitedContainer: {
    backgroundColor: theme.palette.primary.graph.visited,
    borderColor: theme.palette.primary.graph.end,
  },
  nodePathContainer: {
    backgroundColor: theme.palette.primary.graph.path,
  },
  nodeText: {
    color: "white",
    fontWeight: "bold",
  },
  edgeContainer: {
    position: "absolute",
    left: (props) => props.edgeX + "px",
    top: (props) => props.edgeY + "px",
    transform: (props) => props.edgeTransform,
  },
  edgeLine: {
    width: (props) => props.edgeWidth,
    height: 5,
    backgroundColor: "white",
    transition: `background ${SLEEP_DURING_PATH}ms ease-out`,
    background: `linear-gradient(to left, white 50%, ${theme.palette.primary.graph.path} 50%) right;`,
    backgroundSize: "200%",
  },
  edgePathLine: {
    backgroundPosition: "left",
  },
  edgePathContainer: {
    zIndex: 99,
  },
  edgeContentContainer: {
    position: "absolute",
    left: "50%",
    zIndex: -100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  weight: {
    color: "white",
    fontWeight: "bold",
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    flexDirection: "column",
  },
  nodeNameInput: {
    color: "white",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    display: "flex",
  },
  bottomLeftContainer: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
  },
  "@keyframes scaling": {
    "0%": {
      transform: "scale(0.1)",
    },
    "100%": {
      transform: "scale(1.0)",
    },
  },
}));

export default Graph;
