import { PropsWithoutRef } from "react";

import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

interface AudioComponentProps
  extends PropsWithoutRef<JSX.IntrinsicElements["audio"]> {
  className?: string;
  src: string | undefined;
}

export function AudioComponent({
  className,
  src,
  ...props
}: AudioComponentProps) {
  return (
    <div className="group w-full py-2 relative">
      {src === "placeholder" && (
        <div
          className={cn(
            "absolute z-[2] max-w-full inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-md",
            className
          )}
        >
          <Loader />
        </div>
      )}
      <audio
        src={src}
        controls
        className={cn("max-w-full", className)}
        {...props}
      />
    </div>
  );
}
