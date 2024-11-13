import { cn } from "@/lib/utils";
import { forwardRef, Ref, HTMLProps } from "react";

type VideoProps = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
} & HTMLProps<HTMLVideoElement>;

export const VideoComponent = forwardRef<HTMLVideoElement, VideoProps>(
  ({ setOpen: _setOpen, className, ...props }, ref: Ref<HTMLVideoElement>) => {
    return (
      <video
        ref={ref}
        playsInline
        controls
        className={cn(
          "w-full h-full object-contain aspect-square rounded-md",
          className
        )}
        {...props}
      />
    );
  }
);
