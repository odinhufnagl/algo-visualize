import React from "react";
import { SPACING } from "../../constants";
const Spacer = ({ spacing, direction = "vertical" }) => {
  return (
    <div
      style={
        direction === "vertical"
          ? { height: SPACING[spacing] || SPACING.medium, width: "100%" }
          : { height: "100%", width: SPACING[spacing] || SPACING.medium }
      }
    />
  );
};

export default Spacer;
