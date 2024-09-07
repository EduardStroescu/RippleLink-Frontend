export function MessagesLoadingIndicator({ shouldDisplay }) {
  return (
    <div
      className={`${shouldDisplay ? "opacity-100" : "opacity-0"} absolute top-20 left-0 right-0 flex justify-center items-center pointer-events-none`}
    >
      <button className="bg-black/40 py-2 w-[40%] rounded-full backdrop-blur animate-pulse">
        Loading...
      </button>
    </div>
  );
}
