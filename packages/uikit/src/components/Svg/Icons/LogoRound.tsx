import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 96 96" {...props}>
      <circle cx="48" cy="48" r="48" fill="#3B82F6" />
      <text
        x="48"
        y="48"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="23"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        Flow
      </text>
    </Svg>
  );
};

export default Icon;
