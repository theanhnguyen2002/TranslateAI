import React from "react";
type IconProps = {
  width?: string;
  height?: string;
};
export const IconMenu = (props: IconProps) => {
  const { width = "18px", height = "18px" } = props;
  return (
    <>
      <svg
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        className="ionicon text-white"
        viewBox="0 0 512 512"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth={48}
          d="M88 152h336M88 256h336M88 360h336"
        ></path>
      </svg>
    </>
  );
};
