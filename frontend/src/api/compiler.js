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
  "X-RapidAPI-Key": "84471de5fdmsh1782d389243083ap1af00bjsne39c996a1c6a",
};

const compileCode = async (code, input, languageId) => {
  try {
    let res = await fetch(URL_POST_SUBMISSION, {
      headers,
      method: "POST",
      body: JSON.stringify(body(code, input, languageId)),
    });
    res = await res.json();
    res = await fetch(URL_GET_SUBMISSION(res.token), {
      headers,
      method: "GET",
    });
    res = await res.json();

    return res.stderr
      ? { output: atob(res.stderr), isError: true }
      : { output: atob(res.stdout), isError: false };
  } catch (e) {
    console.log("e", e);
  }
};

export default compileCode;
