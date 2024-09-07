import { forwardRef, Ref, HTMLProps } from "react";

type VideoProps = {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
} & HTMLProps<HTMLVideoElement>;

export const VideoComponent = forwardRef<HTMLVideoElement, VideoProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ setOpen, ...props }, ref: Ref<HTMLVideoElement>) => {
    return (
      <video
        ref={ref}
        playsInline
        controls
        className="w-full h-full object-cover rounded-md"
        {...props}
      />
    );
  }
);
