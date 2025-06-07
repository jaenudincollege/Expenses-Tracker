import React from "react";
import { Link } from "react-router-dom";
// import { DownloadIcon, PlusIcon } from '@heroicons/react/solid'; // Assuming you're using Heroicons - commented out for now if not installed

// Placeholder icons if Heroicons are not available or setup yet
const DownloadIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const MobileActionBar = ({
  onDownloadCSV,
  addLinkTo,
  addLinkText,
  isDownloadDisabled,
}) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center shadow-lg z-50">
      <button
        onClick={onDownloadCSV}
        disabled={isDownloadDisabled}
        className={`flex flex-col items-center justify-center text-xs px-3 py-2 rounded-md transition-colors
                    ${
                      isDownloadDisabled
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-blue-600 hover:bg-blue-50 active:bg-blue-100"
                    }`}
      >
        <DownloadIcon className="h-5 w-5 mb-0.5" />
        <span className="whitespace-nowrap">Download</span>
      </button>
      {addLinkTo && addLinkText && (
        <Link
          to={addLinkTo}
          className="flex flex-col items-center justify-center text-xs text-green-600 hover:bg-green-50 active:bg-green-100 px-3 py-2 rounded-md transition-colors"
        >
          <PlusIcon className="h-5 w-5 mb-0.5" />
          <span className="whitespace-nowrap">{addLinkText}</span>
        </Link>
      )}
    </div>
  );
};

export default MobileActionBar;
