import { MuiThemeProvider } from "@material-ui/core";
import "./App.css";
import { MainScreen } from "./screens";
import theme from "./theme";
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div
        style={{
          backgroundColor: "rgb(10 25 41)",
          position: "absolute",
          flex: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <Routes>
          <Route path="/" element={<MainScreen />} />
        </Routes>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
