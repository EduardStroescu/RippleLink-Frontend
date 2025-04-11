import { EditIcon, TrashIcon } from "@/components/Icons";
import { Separator } from "@/components/ui/Separator";

export function MessageOptionsOverlayContent({
  ableToEditMessage,
  ableToDeleteMessage,
  handleDelete,
  handleStartEditing,
}) {
  return (
    <div className="flex flex-col bg-black/60 backdrop-blur rounded border-slate-600 border-[1px] text-xs">
      <button
        title="Delete Message"
        aria-label="Delete Message"
        className={`${ableToDeleteMessage ? "group" : ""} flex gap-1 items-center px-6 py-1.5 disabled:text-slate-500 h-fit`}
        disabled={!ableToDeleteMessage}
        onClick={handleDelete}
      >
        <TrashIcon className="w-[15px] h-[15px]" />
        <span className="group-hover:text-cyan-400 transition-color duration-300 w-full">
          Delete
        </span>
      </button>
      <Separator className="h-[0.5px]" />
      <button
        title="Edit Message"
        aria-label="Edit Message"
        className={`${ableToEditMessage ? "group" : ""} flex gap-1 items-center px-6 py-1.5 disabled:text-slate-500 h-fit`}
        disabled={!ableToEditMessage}
        onClick={handleStartEditing}
      >
        <EditIcon className="w-[15px] h-[15px]" />
        <span className="group-hover:text-cyan-400 transition-color duration-300 w-full">
          Edit
        </span>
      </button>
    </div>
  );
}
