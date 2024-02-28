const URL_POST_SUBMISSION = "https://judge0-ce.p.rapidapi.com/submissions";
const URL_GET_SUBMISSION = (token) =>
  `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`;

const body = (code, input, languageId) => ({
  language_id: languageId,
  source_code: code,
  stdin: JSON.stringify(input),
});

const headers = {
  "content-type": "application/json",
  "Content-Type": "application/json",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "X-RapidAPI-Key": "6ac33dcf1dmsh4e10a5c608d2587p12611ajsna8b2a44d27b4",
};

const compileCode = async (code, input, languageId) => {
  try {
    console.log("papap");
    let res = await fetch(URL_POST_SUBMISSION, {
      headers,
      method: "POST",
      body: JSON.stringify(body(code, input, languageId)),
    });
    res = await res.json();
    console.log("lulul", res);
    let inQueue = true;
    let tries = 0;
    while (inQueue && tries < 10) {
      tries++;
      res = await fetch(URL_GET_SUBMISSION(res.token), {
        headers,
        method: "GET",
      });
      res = await res.json();
      if (res.status.id === 3) {
        inQueue = false;
      }
    }
    console.log("lalla", res);

    return res.stderr
      ? { output: atob(res.stderr), isError: true }
      : { output: atob(res.stdout), isError: false };
  } catch (e) {
    console.log("e", e);
  }
};

export default compileCode;
