import * as React from "react";
import { Avatar, Button as MUIButton, makeStyles } from "@material-ui/core";
import { Icon } from "..";

const BUTTON_TYPES = Object.freeze({
  SECONDARY: "secondary",
  THIRD: "third",
  FOURTH: "fourth",
});

const getButtonStyle = (type, styles) => {
  if (!type) {
    return styles.primaryButton;
  }
  return {
    [BUTTON_TYPES.SECONDARY]: styles.secondaryButton,
    [BUTTON_TYPES.THIRD]: styles.thirdButton,
    [BUTTON_TYPES.FOURTH]: styles.fourthButton,
  }[type];
};

const ConditionalWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;
const Button = ({
  title,
  type,
  icon,
  fullWidth = true,
  isMarked,
  isMarkedIcon,
  isMarkedText,
  onClick,
  iconSize,
  style,
  disabled,
  circular,
  className,
  iconStyle,
  ...props
}) => {
  const styles = useStyles();

  return (
    <ConditionalWrapper
      condition={circular}
      wrapper={(children) => <Avatar>{children}</Avatar>}
    >
      <ConditionalWrapper
        condition={!fullWidth}
        wrapper={(children) => (
          <div style={{ display: "none" }}>{children}</div>
        )}
      >
        <MUIButton
          disabled={disabled}
          className={[getButtonStyle(type, styles), className].join(" ")}
          style={{
            ...style,
            textTransform: "none",
          }}
          {...props}
          onClick={onClick}
        >
          {icon && (
            <Icon
              style={iconStyle}
              isMarked={isMarked}
              isMarkedIcon={isMarkedIcon}
              icon={icon}
              iconSize={iconSize}
            />
          )}

          {title}
        </MUIButton>
      </ConditionalWrapper>
    </ConditionalWrapper>
  );
};

const useStyles = makeStyles((theme) => ({
  primaryButton: {
    backgroundColor: theme.palette.primary.main,
    color: "white",
    borderRadius: 10,
    fontSize: 18,
  },
  secondaryButton: {
    color: "white",
    fontSize: 15,
  },
  thirdButton: {},
  fourthButton: {},
}));

export default Button;
