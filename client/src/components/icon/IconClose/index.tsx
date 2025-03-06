import React from "react";
type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};
export const IconClose = (props: IconProps) => {
  const { width = "18px", height = "18px", color = "#ffff" } = props;
  return (
    <>
      <svg
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        className="ionicon"
        viewBox="0 0 512 512"
      >
        <path
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
          d="M368 368L144 144M368 144L144 368"
        />
      </svg>
    </>
  );
};
