import { LOCAL_STORAGE_KEYS } from "../localStorage";

export const PROGRAMMING_LANGUAGE_NAME = Object.freeze({
  JAVASCRIPT: "javascript",
  PYTHON: "python",
});
export const PROGRAMMING_LANGUAGES = Object.freeze({
  [PROGRAMMING_LANGUAGE_NAME.JAVASCRIPT]: {
    id: 63,
    name: "javascript",
    code: {
      graph: {
        default: () => `const NODE_STATUS = Object.freeze({
      DEFAULT: "default",
      VISITED: "visited",
      DISTANCE_CALCULATED: "distanceCalculated",
      START: "start",
      END: "end",
      PATH: "path",
    });
    
    const EDGE_STATUS = Object.freeze({
      DEFAULT: "default",
      PATH: "path",
    });

    //this is the function where you should put your code. This will automatically be run so you dont have to call it
    const main = (nodes, edges, updateEdgeStatus, updateNodeStatus) => {
      /*
      nodes: 
      an object with the nodes. nodes[nodeId] = {connectedEdges: [edgeId], status: NODE_STATUS}

      edges:
      an object with the edges. edges[edgeId] = {weight: number, from: nodeId, to: nodeId, status: EDGE_STATUS}

      updateNodeStatus: 
      function that updates a node: updateNodeStatus = function(nodeId: number, status: NODE_STATUS)

      updateEdgeStatus: 
      function that updates an edge: updateEdgeStatus = function(edgeId: number, status: EDGE_STATUS)
      */
        
    };
    `,
        dijkstras: () => `
      const shortestDistanceNode = (distances, visited) => {
        let minNodeId = null;
        for (let node in distances) {
          let isShorter =
            minNodeId === null || distances[node] < distances[minNodeId];
          if (isShorter && !visited.includes(node)) {
            minNodeId = node;
          }
        }
        return minNodeId;
      };
      
      const NODE_STATUS = Object.freeze({
        DEFAULT: "default",
        VISITED: "visited",
        DISTANCE_CALCULATED: "distanceCalculated",
        START: "start",
        END: "end",
        PATH: "path",
      });
      
      const EDGE_STATUS = Object.freeze({
        DEFAULT: "default",
        PATH: "path",
      });
      
      
      const getNodeStatus = (id) => {
        return nodes[id].status
      }
      
      
      const main = (nodes, edges, updateEdgeStatus, updateNodeStatus) => {
        const previousCoordinateRecursive = (curNodeId) => {
          //prevNodeDict is an object where prevNodeDict[nodeId] = node before nodeId
          const prevNodeId = prevNodeDict[curNodeId];
          if (!prevNodeId || curNodeId === "start") {
            return;
          }
          const prevEdgeId = prevEdgeDict[curNodeId];
      
          previousCoordinateRecursive(prevNodeId);
      
          updateEdgeStatus(prevEdgeId, EDGE_STATUS.PATH);
          updateNodeStatus(curNodeId, NODE_STATUS.PATH);
          return;
        };
      
        let distances = {};
        let prevNodeDict = {};
        let prevEdgeDict = {};
        const startNode = nodes["start"];
        distances["end"] = 999999999;
        for (let i in startNode.connectedEdges) {
          const edge = edges[startNode.connectedEdges[i]];
          distances[edge.to] = edge.weight;
          prevNodeDict[edge.to] = "start";
          prevEdgeDict[edge.to] = startNode.connectedEdges[i];
          if (getNodeStatus(edge.to) === NODE_STATUS.DEFAULT) {
            updateNodeStatus(edge.to, NODE_STATUS.DISTANCE_CALCULATED);
          }
        }
        let visited = ["start"];
        let currentNodeId = shortestDistanceNode(distances, visited);
        while (currentNodeId) {
          if (currentNodeId === "end") {
            break;
          }
          let distance = distances[currentNodeId];
          const currentNode = nodes[currentNodeId];
          for (let i in currentNode.connectedEdges) {
            const connectedEdgeId = currentNode.connectedEdges[i];
            const connectedEdge = edges[connectedEdgeId];
            const connectedNodeId = connectedEdge.to;
            const newDistance = distance + connectedEdge.weight;
      
            if (
              !distances[connectedNodeId] ||
              newDistance < distances[connectedNodeId]
            ) {
              distances[connectedNodeId] = newDistance;
              prevNodeDict[connectedNodeId] = currentNodeId;
              prevEdgeDict[connectedNodeId] = connectedEdgeId;
      
              if (getNodeStatus(connectedNodeId) === NODE_STATUS.DEFAULT) {
                updateNodeStatus(
                  connectedNodeId,
                  NODE_STATUS.DISTANCE_CALCULATED
                );
              }
            }
          }
      
          visited.push(currentNodeId);
          updateNodeStatus(currentNodeId, NODE_STATUS.VISITED);
          currentNodeId = shortestDistanceNode(distances, visited);
        }
        previousCoordinateRecursive("end");
      }
      
      
      `,

        saved: () =>
          localStorage.getItem(
            LOCAL_STORAGE_KEYS.GRAPH_EDITOR_CODE[
              PROGRAMMING_LANGUAGE_NAME.JAVASCRIPT
            ]
          ) ||
          PROGRAMMING_LANGUAGES[
            PROGRAMMING_LANGUAGE_NAME.JAVASCRIPT
          ].code.graph.default(),
      },
      grid: {
        default: () => `
        const CELL_STATUS = Object.freeze({
        DEFAULT: "default",
        VISITED: "visited",
        DISTANCE_CALCULATED: "distanceCalculated",
        FINDER: "finder",
        TARGET: "target",
        PATH: "path",
        WALL: "wall"
      });

      //this is the function where you should put your code. This will automatically be run so you dont have to call it
      const main = (grid, updateCellStatus, startPos, endPos) => {
        /*
        grid:
        the grid before the code is being run. Note that this is not a reference to the grid, this is a copy. grid[y][x] = {weight: number, status: CELL_STATUS}
    
        updateCellStatus: 
        function that updates the grid. updateCellStatus = function(x: number, y: number, status: CELL_STATUS)
    
        startPos: 
        coordinate for the finder before the code is being run. startPos: {x: number, y: number}
    
        endPos: 
        coordinate for the target before the code is being run. endPos: {x: number, y: number}
        */
          
      };
      `,
        dijkstras: () => `const dRow = [-1, 0, 1, 0];
        const dCol = [0, 1, 0, -1];
        
        const CELL_STATUS = Object.freeze({
          DEFAULT: "default",
          VISITED: "visited",
          DISTANCE_CALCULATED: "distanceCalculated",
          FINDER: "finder",
          TARGET: "target",
          PATH: "path",
          WALL: "wall"
        });
        
        const shortestDistanceCell = (distances, visited, grid) => {
          let minCell = null;
          distances.forEach((row, y) => {
            row.forEach((distance, x) => {
              let isShorter =
                minCell === null || distance < distances[minCell.y][minCell.x];
              if (
                isShorter &&
                !visited[y][x] &&
                grid[y][x].status !== CELL_STATUS.WALL
              ) {
                minCell = { x, y };
              }
            });
          });
          return minCell;
        };
        const isValid = (grid, x, y, numRows, numCols, visited) => {
          if (x >= numCols || x < 0 || y >= numRows || y < 0) {
            return;
          }
          if (
            visited[y][x] ||
            grid[y][x].status === CELL_STATUS.WALL ||
            grid[y][x].status === CELL_STATUS.FINDER
          ) {
            return;
          }
          return true;
        };
        
        const getDistanceBetweenWeights = (weight1, weight2, distanceBetween = 1) => {
          return Math.sqrt(Math.abs(weight1 - weight2) ** 2 + distanceBetween ** 2);
        };
        
        const main = (
          grid, updateCellStatus, startPos, endPos
        
        ) => {
        
          const numRows = grid.length;
          const numCols = grid[0].length;
        
          const previousCoordinateRecursive = (x, y) => {
            const previousCoordinate = previousCoordinateGrid[y][x];
        
            if (!previousCoordinate) {
              return;
            }
            previousCoordinateRecursive(
              previousCoordinate.x,
              previousCoordinate.y
            );
        
            if (endPos.x !== x || endPos.y !== y) {
              updateCellStatus(x, y, CELL_STATUS.PATH);
            }
            return;
          };
        
        
          let previousCoordinateGrid = [];
          for (let i = 0; i < numRows; i++) {
            previousCoordinateGrid.push(Array.from(Array(numCols), () => null));
          }
          let distances = new Array(numRows);
          for (let i = 0; i < numRows; i++) {
            distances[i] = new Array(numCols);
          }
          distances[endPos.y][endPos.x] = 9999999;
        
          let visited = new Array(numRows);
          for (let i = 0; i < numRows; i++) {
            visited[i] = new Array(numCols);
          }
          visited[startPos.y][startPos.x] = true;
        
          let { x, y } = startPos;
          const startCell = grid[y][x];
          for (var i = 0; i < 4; i++) {
            let connectedX = x + dRow[i];
            let connectedY = y + dCol[i];
            if (!isValid(grid, connectedX, connectedY, numRows, numCols, visited)) {
              continue;
            }
            const connectedCell = grid[connectedY][connectedX];
            distances[connectedY][connectedX] = getDistanceBetweenWeights(
              connectedCell.weight,
              startCell.weight
            );
        
            previousCoordinateGrid[connectedY][connectedX] = { x, y };
        
            if (connectedCell.status === CELL_STATUS.DEFAULT) {
              updateCellStatus(connectedX, connectedY, CELL_STATUS.DISTANCE_CALCULATED)
        
            }
        
          }
        
          let currentPos = shortestDistanceCell(distances, visited, grid);
        
          while (currentPos) {
        
            let distance = distances[currentPos.y][currentPos.x];
        
            let { x: curX, y: curY } = currentPos;
            const currentCell = grid[curY][curX];
            if (currentCell.status === CELL_STATUS.TARGET) {
              break;
            }
        
            for (var i = 0; i < 4; i++) {
              let connectedX = curX + dRow[i];
              let connectedY = curY + dCol[i];
        
              if (!isValid(grid, connectedX, connectedY, numRows, numCols, visited)) {
                continue;
              }
        
              const connectedCell = grid[connectedY][connectedX];
              const newDistance =
                distance +
                getDistanceBetweenWeights(connectedCell.weight, currentCell.weight);
              if (
                !distances[connectedY][connectedX] ||
                newDistance < distances[connectedY][connectedX]
              ) {
                distances[connectedY][connectedX] = newDistance;
                previousCoordinateGrid[connectedY][connectedX] = { x: curX, y: curY };
        
                if (connectedCell.status === CELL_STATUS.DEFAULT) {
                  updateCellStatus(connectedX, connectedY, CELL_STATUS.DISTANCE_CALCULATED)
        
        
                }
        
              }
            }
        
            visited[curY][curX] = true;
        
            
            updateCellStatus(curX, curY, CELL_STATUS.VISITED)
          
            currentPos = shortestDistanceCell(distances, visited, grid);
          }
        
          previousCoordinateRecursive(endPos.x, endPos.y);
        };
        
        `,
        bfs: () => `
        const dRow = [-1, 0, 1, 0];
        const dCol = [0, 1, 0, -1];
        
        const CELL_STATUS = Object.freeze({
          DEFAULT: "default",
          VISITED: "visited",
          DISTANCE_CALCULATED: "distanceCalculated",
          FINDER: "finder",
          TARGET: "target",
          PATH: "path",
          WALL: "wall"
        });
        
        const isValid = (grid, x, y, numRows, numCols, visited) => {  
          if (x >= numCols || x < 0 || y >= numRows || y < 0) {
            return;
          }
          if (
            grid[y][x].status === CELL_STATUS.WALL ||
            grid[y][x].status === CELL_STATUS.FINDER || visited[y][x]
          ) {
            return;
          }
          return true;
        };
        
        const main = (grid, updateCellStatus, startPos, endPos) => {
          const numRows = grid.length;
          const numCols = grid[0].length;
        
          const previousCoordinateRecursive = (x, y) => {
            const previousCoordinate = previousCoordinateGrid[y][x];
            if (!previousCoordinate) {
              return;
            }
            previousCoordinateRecursive(
              previousCoordinate.x,
              previousCoordinate.y
            );
            if (y !== endPos.y || x !== endPos.x) {
              updateCellStatus(x, y, CELL_STATUS.PATH)
            }
            return;
          };
        
          let previousCoordinateGrid = [];
          for (let i = 0; i < numRows; i++) {
            previousCoordinateGrid.push(Array.from(Array(numCols.length), () => null));
          }
        
          let visited = [];
          for (let i = 0; i < numRows; i++) {
            visited.push(Array.from(Array(numCols), () => null));
          }
        
          let q = [];
          q.push(startPos);
        
        
          while (q.length !== 0) {
            let { x, y } = q[0];
            q.shift();
            for (var i = 0; i < 4; i++) {
              let adjx = x + dRow[i];
              let adjy = y + dCol[i];
        
              if (isValid(grid, adjx, adjy, grid.length, grid[0].length, visited)) {
                previousCoordinateGrid[adjy][adjx] = { x, y };
                if (adjx === endPos.x && adjy === endPos.y) {
                  previousCoordinateRecursive(adjx, adjy);
                  return;
                }
                q.push({ x: adjx, y: adjy });
                visited[adjy][adjx] = true;
                updateCellStatus(adjx, adjy, CELL_STATUS.VISITED);
        
              }
            }
          }
        }
        `,
        saved: () =>
          localStorage.getItem(
            LOCAL_STORAGE_KEYS.GRID_EDITOR_CODE[
              PROGRAMMING_LANGUAGE_NAME.JAVASCRIPT
            ]
          ) ||
          PROGRAMMING_LANGUAGES[
            PROGRAMMING_LANGUAGE_NAME.JAVASCRIPT
          ].code.grid.default(),
      },
    },
    template: {
      graph: (mainCode) => `process.stdin.on('data', data => {
      const params = JSON.parse(data);
      const {nodes, edges} = params;
      const actions = [];
      const updateEdgeStatus = (id, status) => {
          actions.push({id, status, type: "edge"})
      }
      const updateNodeStatus = (id, status) => {
          actions.push({id, status, type: "node"})
      }
      ${mainCode}
      main(nodes, edges, updateEdgeStatus, updateNodeStatus)
      console.log(JSON.stringify(actions));
    })`,
      grid: (mainCode) => `process.stdin.on('data', data => {
    const params = JSON.parse(data);
    const {grid, startPos, endPos} = params;
    const actions = [];
   
    const updateCellStatus = (x, y, status) => {
        actions.push({x, y, status})
    }
    ${mainCode}
    main(grid, updateCellStatus, startPos, endPos)
    console.log(JSON.stringify(actions));
   
  })`,
    },
  },
  [PROGRAMMING_LANGUAGE_NAME.PYTHON]: {
    id: 71,
    name: "python",
    code: {
      graph: {
        default: () => `NODE_STATUS = {
  'DEFAULT': "default",
  'VISITED': "visited",
  'DISTANCE_CALCULATED': "distanceCalculated",
  'START': "start",
  'END': "end",
  'PATH': "path"
}
EDGE_STATUS = {
  'DEFAULT': "default",
  'PATH': "path",
}

#this is the function where you should put your code. This will automatically be run so you dont have to call it
def main(nodes, edges, updateEdgeStatus, updateNodeStatus):
"""
  nodes: 
  a dictionary with the nodes. nodes[nodeId] = {connectedEdges: [edgeId], status: NODE_STATUS}

  edges:
  a dictionary with the edges. edges[edgeId] = {weight: number, from: nodeId, to: nodeId, status: EDGE_STATUS}

  updateNodeStatus: 
  function that updates a node: updateNodeStatus = function(nodeId: number, status: NODE_STATUS)

  updateEdgeStatus: 
  function that updates an edge: updateEdgeStatus = function(edgeId: number, status: EDGE_STATUS)
"""
    `,

        saved: () =>
          localStorage.getItem(
            LOCAL_STORAGE_KEYS.GRAPH_EDITOR_CODE[
              PROGRAMMING_LANGUAGE_NAME.PYTHON
            ]
          ) ||
          PROGRAMMING_LANGUAGES[
            PROGRAMMING_LANGUAGE_NAME.PYTHON
          ].code.default(),
      },
      grid: {
        default: () => `CELL_STATUS = {
  "DEFAULT": "default",
  "WALL": "wall",
  "VISITED": "visited",
  "FINDER": "finder",
  "TARGET": "target",
  "PATH": "path",
  "DISTANCE_CALCULATED": "distanceCalculated",

};
        
#this is the function where you should put your code. This will automatically be run so you dont have to call it
def main(grid, updateCellStatus, startPos, endPos):
  """
  grid:
  the grid before the code is being run. Note that this is not a reference to the grid, this is a copy. grid[y][x] = {weight: number, status: CELL_STATUS}
    
  updateCellStatus: 
  function that updates the grid. updateCellStatus = function(x: number, y: number, status: CELL_STATUS)
    
  startPos: 
  coordinate for the finder before the code is being run. startPos: {x: number, y: number}
    
  endPos: 
  coordinate for the target before the code is being run. endPos: {x: number, y: number}
  """
      
      `,

        saved: () =>
          localStorage.getItem(
            LOCAL_STORAGE_KEYS.GRID_EDITOR_CODE[
              PROGRAMMING_LANGUAGE_NAME.PYTHON
            ]
          ) ||
          PROGRAMMING_LANGUAGES[
            PROGRAMMING_LANGUAGE_NAME.PYTHON
          ].code.grid.default(),
      },
    },
    template: {
      graph: (mainCode) =>
        `import json
import sys
data = ""
for line in sys.stdin:
   data = line
  
params = json.loads(data)
NODE_STATUS = {'DEFAULT': "default",
            'VISITED': "visited",
            'DISTANCE_CALCULATED': "distanceCalculated",
            'START': "start",
            'END': "end",
            'PATH': "path"}
EDGE_STATUS = {
            'DEFAULT': "default",
            'PATH': "path",
            }
actions = []
def updateEdgeStatus(id, status):
                 actions.append({"id": id, "status": status, "type": "edge"})
def updateNodeStatus(id, status):
                 actions.append({"id": id, "status": status, "type": "node"})
${mainCode}
main(params["nodes"], params["edges"], updateEdgeStatus, updateNodeStatus)
print(json.dumps(actions))`,
      grid: (mainCode) => `import json
import sys
data = ""
for line in sys.stdin:
   data = line
  
params = json.loads(data)
CELL_STATUS = {
  "DEFAULT": "default",
  "WALL": "wall",
  "VISITED": "visited",
  "FINDER": "finder",
  "TARGET": "target",
  "PATH": "path",
  "DISTANCE_CALCULATED": "distanceCalculated",
};


actions = []
def updateCellStatus(x,y, status):
                 actions.append({"x": x,  "y": y,"status": status})

${mainCode}
main(params["grid"], updateCellStatus, params["startPos"], params["endPos"])
print(json.dumps(actions))`,
    },
  },
});
