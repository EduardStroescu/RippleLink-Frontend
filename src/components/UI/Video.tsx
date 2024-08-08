import { forwardRef, Ref, HTMLProps } from "react";

type VideoProps = HTMLProps<HTMLVideoElement>;

export const VideoComponent = forwardRef<HTMLVideoElement, VideoProps>(
  (props, ref: Ref<HTMLVideoElement>) => {
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
