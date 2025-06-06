import React from "react";

const LoadingSpinner = ({ size = "medium", message = "Loading..." }) => {
  // Define size classes
  let sizeClasses = "h-8 w-8"; // Default medium size

  if (size === "small") {
    sizeClasses = "h-6 w-6";
  } else if (size === "large") {
    sizeClasses = "h-12 w-12";
  } else if (size === "xl") {
    sizeClasses = "h-16 w-16";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses} animate-spin rounded-full border-t-2 border-b-2 border-blue-500`}
      ></div>
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
