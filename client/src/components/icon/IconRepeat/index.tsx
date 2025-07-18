import React from "react";

type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};

export const IconRepeat = ({
  width = "18px",
  height = "18px",
  color = "white",
}: IconProps) => {
  return (
    <svg
      fill={color}
      height={height}
      width={width}
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 512 512"
      xmlSpace="preserve"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth={0} />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g>
          {" "}
          <g>
            {" "}
            <polygon points="462.452,255.997 462.452,363.355 120.348,363.355 120.348,267.733 0,388.139 120.348,508.517 120.348,412.903 512,412.903 512,255.997 " />{" "}
          </g>{" "}
        </g>{" "}
        <g>
          {" "}
          <g>
            {" "}
            <polygon points="512,123.861 391.652,3.483 391.652,99.097 0,99.097 0,255.997 49.548,255.997 49.548,148.645 391.652,148.645 391.652,244.267 " />{" "}
          </g>{" "}
        </g>{" "}
      </g>
    </svg>
  );
};
