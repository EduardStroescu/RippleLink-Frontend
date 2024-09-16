import { PropsWithoutRef } from "react";
import { FileIcon } from "../Icons";
import { cn } from "@/lib/utils";

export function FileComponent({
  fileName,
  className,
  ...props
}: { fileName: string; className?: string } & PropsWithoutRef<
  JSX.IntrinsicElements["a"]
>) {
  return (
    <a
      className={cn(
        "max-w-[130px] min-w-[130px] overflow-hidden p-2 m-2 flex flex-col items-center gap-1 bg-black/70 rounded-md",
        className
      )}
      {...props}
    >
      <FileIcon />
      <div className="w-full text-xs flex flex-col justify-center">
        <p className="text-center">File Name:</p>
        <p className="text-cyan-500 truncate">
          {fileName.split("/").pop() || "File"}
        </p>
      </div>
    </a>
  );
}
