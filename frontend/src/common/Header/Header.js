import { makeStyles, Typography } from "@material-ui/core";
import * as React from "react";
import { useNavigate } from "react-router";

const Header = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.root}>
      <div>
        <Typography
          variant="h2"
          className={styles.title}
          onClick={() => navigate("/")}
        >
          algoVisualize
        </Typography>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: theme.palette.primary.border,
    justifyContent: "space-between",
    display: "flex",
  },
  title: {
    color: theme.palette.primary.main,
  },
}));

export default Header;
