import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";
import { vars } from "../../../css/vars.css";

const Logo: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 280 48" {...props}>
      {/* S icon */}
      <circle cx="24" cy="24" r="22" fill="#1FC7D4" />
      <path
        d="M16 18C16 15.79 17.79 14 20 14H28C30.21 14 32 15.79 32 18C32 20.21 30.21 22 28 22H20C17.79 22 16 23.79 16 26C16 28.21 17.79 30 20 30H28C30.21 30 32 31.79 32 34"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* SimpleFlow text */}
      <text
        x="56"
        y="32"
        fill={vars.colors.contrast}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="24"
        fontWeight="bold"
      >
        SimpleFlow
      </text>
    </Svg>
  );
};

export default Logo;
