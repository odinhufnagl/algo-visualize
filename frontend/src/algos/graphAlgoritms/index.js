import { compileCode } from "../../api";
import { PROGRAMMING_LANGUAGES } from "../../constants";
import { NODE_STATUS } from "../../constants/graph";
import {
  getLastArrayInString,
  getStringExceptLastArray,
  sleep,
} from "../../utils";

export const graphAlgoritms = async (
  mainCode,
  speedRef,
  maxSpeed,
  exitVisualizationRef,
  nodes,
  edges,
  setNodes,
  setEdges,
  setOutputValue,
  languageName,
  setLoading
) => {
  const delay = async () => {
    await sleep(maxSpeed - speedRef.current);
  };

  const runActions = async (actions) => {
    for (let i = 0; i < actions.length; i++) {
      if (exitVisualizationRef.current) return;
      //each action has an id, meaning a nodeId/edgeId, status meaning nodeStatus/edgeStatus, and type, meaning if it is a node that is being updated or an edge
      const { id, status, type } = actions[i];
      if (type === "node") {
        const nodesCopy = { ...nodes };
        if (!nodesCopy[id]) {
          continue;
        }
        if (
          status === NODE_STATUS.VISITED &&
          nodesCopy[id].status === NODE_STATUS.END
        ) {
          nodesCopy[id].status = NODE_STATUS.END_VISITED;
        }
        nodesCopy[id].status = status;
        setNodes(nodesCopy);
      }
      if (type === "edge") {
        const edgesCopy = { ...edges };
        if (!edgesCopy[id]) {
          continue;
        }
        edgesCopy[id].status = status;
        setEdges(edgesCopy);
      }
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

  const params = { nodes, edges };
  console.log("nodes here", nodes);
  const { output, isError } = await compileCode(
    languageObject.template.graph(mainCode),
    params,
    languageObject.id
  );
  setLoading(false);

  //the output given to us from the API is the output the code gave us. This means output that the user put in the code + the output the template gave
  //these two needs to be separated, the first one shoule be shown in outputValue. The other one should be used to run actions, meaning to visualize.
  setOutputValue(isError ? output : getStringExceptLastArray(output));
  await runActions(!isError && getLastArrayInString(output));
};
