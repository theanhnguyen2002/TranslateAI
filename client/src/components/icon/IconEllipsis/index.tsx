import React from "react";
type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};
export const IconEllipsis = (props: IconProps) => {
  const { width = "18px", height = "18px", color = "white" } = props;
  return (
    <>
      <svg fill={color} width={width} height={height} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17.5" cy={12} r="1.5" />
        <circle cx={12} cy={12} r="1.5" />
        <circle cx="6.5" cy={12} r="1.5" />
      </svg>
    </>
  );
};
