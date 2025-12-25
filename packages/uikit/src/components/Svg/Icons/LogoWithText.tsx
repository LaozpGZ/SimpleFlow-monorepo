import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";
import { vars } from "../../../css/vars.css";

const Logo: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 400 100" {...props}>
      <circle cx="50" cy="50" r="45" fill="#3B82F6" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="22"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        Flow
      </text>
      <text
        x="240"
        y="58"
        textAnchor="middle"
        dominantBaseline="central"
        fill={vars.colors.contrast}
        fontSize="40"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        SimpleFlow
      </text>
    </Svg>
  );
};

export default Logo;
