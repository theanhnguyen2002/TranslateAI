import React from "react";

type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};

export const IconCopy2 = ({ width = "18px", height = "18px", color = "white" }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="ionicon"
      viewBox="0 0 512 512"
      width={width}
      height={height}
    >
      <rect
        x={128}
        y={128}
        width={336}
        height={336}
        rx={57}
        ry={57}
        fill="none"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={32}
      />
      <path
        d="M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={32}
      />
    </svg>
  );
};
