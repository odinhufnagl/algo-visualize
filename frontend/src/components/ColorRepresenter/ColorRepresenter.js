import { makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { Spacer } from "../../common";

const ColorRepresenter = ({ color, text }) => {
  const styles = useStyles({ color });
  return (
    <div className={styles.container}>
      <div className={styles.colorContainer}></div>
      <Spacer direction="horizontal" spacing="small" />
      <Typography className={styles.text}>{text}</Typography>
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  colorContainer: {
    width: 30,
    height: 30,
    backgroundColor: (props) => props.color,
    borderRadius: 5,
  },
  text: {
    color: "white",
    fontWeight: 500,
  },
});

export default ColorRepresenter;
