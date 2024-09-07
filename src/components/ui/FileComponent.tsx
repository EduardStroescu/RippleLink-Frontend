import { PropsWithoutRef } from "react";
import { FileIcon } from "../Icons";

export function FileComponent({
  fileName,
  ...props
}: { fileName: string } & PropsWithoutRef<JSX.IntrinsicElements["a"]>) {
  return (
    <a
      className="max-w-[130px] min-w-[130px] overflow-hidden p-2 m-2 flex flex-col items-center gap-1 bg-black/70 rounded"
      {...props}
    >
      <FileIcon />
      <div className="w-full text-xs flex flex-col justify-center">
        <p>File Name:</p>
        <p className="text-cyan-500 truncate">
          {fileName.split("/").pop() || "File"}
        </p>
      </div>
    </a>
  );
}
