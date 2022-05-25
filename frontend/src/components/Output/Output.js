import { makeStyles } from "@material-ui/core";
import MonacoEditor, { loader } from "@monaco-editor/react";
import React, { useRef } from "react";
import ActivityIndicator from "react-activity-indicator";
import "react-activity-indicator/src/activityindicator.css";

//component that shows the output from the code
const Output = ({ value, onChange, loading }) => {
  const styles = useStyles();
  const editorRef = useRef();
  const monacoRef = useRef();

  loader.init().then((monaco) => {
    monaco.editor.defineTheme("my-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0a1929",
      },
    });
  });

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  if (loading) {
    return (
      <ActivityIndicator
        color="rgb(10 25 41)"
        activeColor="white"
        borderWidth={0}
      />
    );
  }

  return (
    <div className={styles.container}>
      <MonacoEditor
        height="100%"
        value={value}
        onChange={onChange}
        theme="my-theme"
        options={{
          formatOnType: true,
          formatOnPaste: true,
          automaticLayout: true,
          autoIndent: true,
          fontSize: "13px",
          readOnly: true,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
  },
}));

export default Output;
