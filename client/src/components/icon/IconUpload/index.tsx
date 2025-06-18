import React from "react";
type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};
export const IconUpload = (props: IconProps) => {
  const { width = "18px", height = "18px", color = "#ffff" } = props;
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="ionicon"
        viewBox="0 0 512 512"
        width={width}
        height={height}
      >
        <path
          d="M320 367.79h76c55 0 100-29.21 100-83.6s-53-81.47-96-83.6c-8.89-85.06-71-136.8-144-136.8-69 0-113.44 45.79-128 91.2-60 5.7-112 43.88-112 106.4s54 106.4 120 106.4h56"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <path
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
          d="M320 255.79l-64-64-64 64M256 448.21V207.79"
        />
      </svg>
    </>
  );
};
