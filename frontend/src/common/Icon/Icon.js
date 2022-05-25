import { makeStyles } from "@material-ui/core";
import * as React from "react";
import {
  AiFillBackward,
  AiFillDelete,
  AiOutlineDelete,
  AiOutlineInfoCircle,
  AiOutlinePlus,
} from "react-icons/ai";
import {
  BsEraser,
  BsEraserFill,
  BsFillPauseFill,
  BsFillPlayFill,
} from "react-icons/bs";
import { FaRandom } from "react-icons/fa";
import { IoMdFlag } from "react-icons/io";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowUpSLine,
  RiHandbagFill,
  RiHandbagLine,
} from "react-icons/ri";
import { SiSpeedtest } from "react-icons/si";
import { VscDebugRestart } from "react-icons/vsc";

const ICON_SIZE = Object.freeze({
  small: 15,
  medium: 20,
  large: 30,
});

const renderIcon = (icon, styles, style, className) => {
  switch (icon) {
    case "eraser":
      return (
        <BsEraser
          className={[styles.icon, className].join(" ")}
          style={style}
        ></BsEraser>
      );
    case "eraserFill":
      return (
        <BsEraserFill
          className={[styles.icon, className].join(" ")}
          style={style}
        ></BsEraserFill>
      );
    case "delete":
      return (
        <AiOutlineDelete
          className={[styles.icon, className].join(" ")}
          style={style}
        ></AiOutlineDelete>
      );
    case "deleteFill":
      return (
        <AiFillDelete
          className={[styles.icon, className].join(" ")}
          style={style}
        ></AiFillDelete>
      );
    case "target":
      return (
        <IoMdFlag
          className={[styles.icon, className].join(" ")}
          style={style}
        ></IoMdFlag>
      );
    case "plus":
      return (
        <AiOutlinePlus
          className={[styles.icon, className].join(" ")}
          style={style}
        ></AiOutlinePlus>
      );
    case "restart":
      return (
        <VscDebugRestart
          className={[styles.icon, className].join(" ")}
          style={style}
        ></VscDebugRestart>
      );
    case "arrowLeft":
      return (
        <RiArrowLeftSLine
          className={[styles.icon, className].join(" ")}
          style={style}
        ></RiArrowLeftSLine>
      );
    case "arrowRight":
      return (
        <RiArrowRightSLine
          className={[styles.icon, className].join(" ")}
          style={style}
        ></RiArrowRightSLine>
      );
    case "arrowUp":
      return (
        <RiArrowUpSLine
          className={[styles.icon, className].join(" ")}
          style={style}
        ></RiArrowUpSLine>
      );
    case "arrowDown":
      return (
        <RiArrowDownSLine
          className={[styles.icon, className].join(" ")}
          style={style}
        ></RiArrowDownSLine>
      );
    case "rewind":
      return (
        <AiFillBackward
          className={[styles.icon, className].join(" ")}
          style={style}
        ></AiFillBackward>
      );
    case "play":
      return (
        <BsFillPlayFill
          className={[styles.icon, className].join(" ")}
          style={style}
        ></BsFillPlayFill>
      );
    case "pause":
      return (
        <BsFillPauseFill
          className={[styles.icon, className].join(" ")}
          style={style}
        ></BsFillPauseFill>
      );
    case "random":
      return (
        <FaRandom
          className={[styles.icon, className].join(" ")}
          style={style}
        ></FaRandom>
      );
    case "speed":
      return (
        <SiSpeedtest
          className={[styles.icon, className].join(" ")}
          style={style}
        ></SiSpeedtest>
      );
    case "weight":
      return (
        <RiHandbagLine
          className={[styles.icon, className].join(" ")}
          style={style}
        />
      );
    case "weightFill":
      return (
        <RiHandbagFill
          className={[styles.icon, className].join(" ")}
          style={style}
        />
      );
    case "info":
      return (
        <AiOutlineInfoCircle
          className={[styles.icon, className].join(" ")}
          style={style}
        ></AiOutlineInfoCircle>
      );
    default:
      return <div></div>;
  }
};

const Icon = ({ icon, isMarked, isMarkedIcon, iconSize, style, className }) => {
  const styles = useStyles({ iconSize: ICON_SIZE[iconSize] });
  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      {renderIcon(isMarked ? isMarkedIcon : icon, styles, style, className)}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: (props) => props.iconSize,
    marginRight: 4,
    color: "white",
  },
}));

export default Icon;
