import { makeStyles } from "@material-ui/core";
import MonacoEditor, { loader } from "@monaco-editor/react";
import React, { memo, useEffect, useRef, useState } from "react";
import { Button, Dropdown, Spacer } from "../../common";
import { sleep } from "../../utils";

//takes care of the main editor that user writes code in. Props are mostly configurations for the editor such as language and templates, and also the code.
//It is here that we are given the choices to update language, template etcetera. Therefore the functions such as "setLanguage" is passed as props
//The editor has all the buttons for pausing, running, etcetera
//the callbacks however, aka what should happen when the buttons is being clicked, is handled by parent and is passed down in props
const Editor = ({
  language,
  code,
  onChange,
  setLanguage,
  languages,
  handlePlay,
  handleRewind,
  handleRestart,
  isPlayButtonDisabled,
  isRestartButtonDisabled,
  isRewindButtonDisabled,
  template,
  setTemplate,
  templates,
}) => {
  const styles = useStyles();
  const editorRef = useRef();
  const monacoRef = useRef();
  const [editor, setEditor] = useState();

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

  //formats the code
  useEffect(() => {
    (async () => {
      await sleep(1000);
      editorRef.current?.trigger("editor", "editor.action.formatDocument");
    })();
  }, [editor, template, language]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setEditor(editor);
  }

  return (
    <div className={styles.container}>
      <div
        style={{
          width: "100%",
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Dropdown
            options={languages}
            value={language}
            onChange={setLanguage}
          />
          <Spacer direction="horizontal" spacing="large" />
          <Dropdown
            options={templates}
            value={template}
            onChange={setTemplate}
          />
        </div>
        <div>
          <Button
            type="secondary"
            icon="play"
            onClick={handlePlay}
            disabled={isPlayButtonDisabled}
            iconSize="large"
            iconStyle={{ color: "#0ff216" }}
          />
          <Button
            type="secondary"
            icon="rewind"
            onClick={handleRewind}
            disabled={isRewindButtonDisabled}
            iconSize="medium"
          />
          <Button
            type="secondary"
            icon="restart"
            onClick={handleRestart}
            disabled={isRestartButtonDisabled}
            iconSize="medium"
          />
        </div>
      </div>

      <Spacer spacing="large" />

      <MonacoEditor
        language={language.value}
        height="100%"
        value={code}
        onChange={onChange}
        theme="my-theme"
        options={{
          formatOnType: true,
          formatOnPaste: true,
          automaticLayout: true,
          autoIndent: true,
          fontSize: "13px",
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
    alignItems: "flex-start",
    flexDirection: "column",
  },
}));

export default memo(Editor);
