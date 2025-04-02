export function ErrorComponent() {
  return (
    <div className="flex items-center h-full justify-center z-50 col-span-12">
      <div className="text-white bg-black/60 p-4 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 8v4m0 4h.01M21 5.63a9 9 0 11-12.728 12.728A9 9 0 0121.364 5.636z"
            />
          </svg>
          <h2 className="text-xl font-semibold">Error</h2>
        </div>
        <p className="mt-2 text-sm">
          Something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
}
