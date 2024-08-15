import { forwardRef, Ref, HTMLProps } from "react";

type VideoProps = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
} & HTMLProps<HTMLVideoElement>;

export const VideoComponent = forwardRef<HTMLVideoElement, VideoProps>(
  ({ setOpen, ...props }, ref: Ref<HTMLVideoElement>) => {
    return (
      <video
        ref={ref}
        controls
        className="w-full h-full object-cover rounded-md"
        {...props}
      />
    );
  }
);
