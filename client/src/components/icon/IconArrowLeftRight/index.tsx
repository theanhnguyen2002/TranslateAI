import React from "react";
type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};
export const IconArrowLeftRight = (props: IconProps) => {
  const { width = "18px", height = "18px", color = "white" } = props;
  return (
    <>
      <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.4">
          <path
            d="M20.5002 14.9902L15.4902 20.0102"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 14.9902H20.5"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M3.5 9.01023L8.51 3.99023"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20.5 9.00977H3.5"
          stroke="#292D32"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
};
