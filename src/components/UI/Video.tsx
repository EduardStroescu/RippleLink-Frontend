import { PropsWithoutRef } from "react";

export function VideoComponent(
  props: PropsWithoutRef<JSX.IntrinsicElements["video"]>
) {
  return (
    <video
      controls
      className="w-full h-full object-cover rounded-md"
      {...props}
    />
  );
}
