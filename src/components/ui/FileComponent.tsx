import { PropsWithoutRef } from "react";

import { FileIcon } from "@/components/Icons";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

export function FileComponent({
  fileName,
  className,
  href,
  ...props
}: { fileName?: string; className?: string } & PropsWithoutRef<
  JSX.IntrinsicElements["a"]
>) {
  return (
    <a
      href={href}
      className={cn(
        "relative max-w-[130px] min-w-[130px] overflow-hidden p-2 flex flex-col items-center gap-1 bg-black/70 rounded-md group/file",
        href === "placeholder" ? "pointer-events-none" : "pointer-events-auto",
        className
      )}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {href === "placeholder" && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm h-full rounded-md aspect-square object-cover",
            className
          )}
        >
          <Loader />
        </div>
      )}
      <FileIcon />
      <div
        className={`w-full text-xs flex flex-col justify-center ${href === "placeholder" ? "scale-0" : "transition-transform duration-300 scale-100"} `}
      >
        <p className="text-center">File Name:</p>
        <p className="text-cyan-500 truncate text-center">
          {fileName || "N/A"}
        </p>
      </div>
    </a>
  );
}
