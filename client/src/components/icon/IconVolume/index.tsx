import React from "react";
type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};
export const IconVolume = (props: IconProps) => {
  const { width = "18px", height = "18px", color = "white" } = props;
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
          d="M157.65 192H88a8 8 0 00-8 8v112a8 8 0 008 8h69.65a16 16 0 0110.14 3.63l91.47 75a8 8 0 0012.74-6.46V119.83a8 8 0 00-12.74-6.44l-91.47 75a16 16 0 01-10.14 3.61zM352 320c9.74-19.41 16-40.81 16-64 0-23.51-6-44.4-16-64M400 368c19.48-34 32-64 32-112s-12-77.7-32-112"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
        />
      </svg>
    </>
  );
};
