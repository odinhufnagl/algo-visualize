const URL =
  "https://us-central1-algo-visualize-347210.cloudfunctions.net/function-1";

/*const body = (code, input, languageId) => ({
    language_id: languageId,
    source_code: code,
    stdin: JSON.stringify(input),
});*/

const headers = {
  "Access-Control-Allow-Origin": true,
  "Content-Type": "application/json",
};

const getHeightMapWeights = async (heightMap, numCols, numRows) => {
  let res = await fetch(URL, {
    headers,
    method: "POST",
    body: JSON.stringify({ image: heightMap, numRows, numCols }),
  });

  res = await res.json();

  return res;
};

export default getHeightMapWeights;
