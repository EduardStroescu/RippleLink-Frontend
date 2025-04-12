import { forwardRef, HTMLProps, Ref } from "react";

import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

type VideoProps = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  contentClassName?: string;
} & HTMLProps<HTMLVideoElement>;

export const VideoComponent = forwardRef<HTMLVideoElement, VideoProps>(
  (
    { setOpen: _setOpen, className, contentClassName, src, ...props },
    ref: Ref<HTMLVideoElement>
  ) => {
    return (
      <div className={cn("relative", className)}>
        {src === "placeholder" && (
          <div className="absolute z-[2] max-w-full inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-md">
            <Loader />
          </div>
        )}
        <video
          ref={ref}
          playsInline
          src={src}
          controls
          className={cn(
            "w-full h-full object-contain rounded-md",
            contentClassName
          )}
          {...props}
        />
      </div>
    );
  }
);
