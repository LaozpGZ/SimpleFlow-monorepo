import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="48" fill="#3B82F6" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="24"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        Flow
      </text>
    </Svg>
  );
};

export default Icon;
