import { createTheme } from "@material-ui/core";

const theme = createTheme({
  palette: {
    primary: {
      backgroundColor: "rgb(10 25 41)",
      main: "rgb(0 127 255)",
      grey: "#dbdbdb",
      background: "rgb(10 25 41)",
      border: "rgb(24 42 58)",
      grid: {
        border: "#878787",
        wall: "tomato",
        visited: "green",
        path: "blue",
        distanceCalculated: "grey",
      },
      graph: {
        start: "green",
        end: "red",
        visited: "green",
        distanceCalculated: "grey",
        path: "blue",
      },
    },
  },

  spacing: 3,
  typography: {
    h1: {
      fontWeight: 600,
      fontSize: 39,
    },
    h2: {
      fontWeight: 500,
      fontSize: 29,
    },
    h3: {
      fontWeight: 600,
      fontSize: 24,
    },
    h4: {
      fontWeight: 600,
      fontSize: 18,
    },
    h5: {
      fontWeight: 700,
      fontSize: 14,
    },
    h6: {
      fontWeight: 600,
      fontSize: 14,
    },
    body1: {
      fontWeight: 400,
      fontSize: 16,
    },

    body2: {
      fontSize: 12,
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: 14,

      textTransform: "none",
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: 14,
    },
    overline: {
      fontWeight: 500,
    },
    fontFamily: "Inter",
  },
});

export default theme;
