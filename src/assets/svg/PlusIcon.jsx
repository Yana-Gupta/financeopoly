import * as React from "react";
const SVGComponent = (props) => (
  <svg
    className="w-[40px] h-[40px] text-gray-800 dark:text-white"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M5 12h14m-7 7V5"
    />
  </svg>
);
export default SVGComponent;
