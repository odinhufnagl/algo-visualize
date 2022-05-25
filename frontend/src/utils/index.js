export const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const copy = (elem) => elem && JSON.parse(JSON.stringify(elem));

export const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

export const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

export const str2obj = (str) => {
  str = str.replaceAll("'", '"').replace(/([a-zA-Z]+):/g, '"$1":');
  return JSON.parse(str);
};

export const AsyncFunction = Object.getPrototypeOf(
  async function () {}
).constructor;

export const getLastArrayInString = (input) => {
  let stack = [];
  let firstEncounter = false;
  let result = [];

  for (let i = input.length - 1; i >= 0; i--) {
    const char = input[i];
    if (char === "[") {
      stack.pop();
    }
    if (firstEncounter && stack.length === 0) {
      break;
    }
    if (firstEncounter) {
      result = char + result;
    }
    if (char === "]") {
      firstEncounter = true;
      stack.push("]");
    }
  }
  console.log("result", result);

  return str2obj("[" + result + "]");
};

export const getStringExceptLastArray = (input) => {
  let stack = [];
  let firstEncounter = false;
  let result = [];

  let bracketIndexOpening = "";
  let bracketIndexClosing = "";

  for (let i = input.length - 1; i >= 0; i--) {
    const char = input[i];
    if (char === "[") {
      bracketIndexClosing = i;
      stack.pop();
    }
    if (firstEncounter && stack.length === 0) {
      break;
    }
    if (firstEncounter) {
      result = char + result;
    }
    if (char === "]") {
      if (!firstEncounter) {
        bracketIndexOpening = i;
      }
      firstEncounter = true;
      stack.push("]");
    }
  }
  return (
    input.substring(0, bracketIndexClosing) +
    input.substring(bracketIndexOpening + 1, input.length)
  );
};
