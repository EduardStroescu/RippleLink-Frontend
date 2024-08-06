import { PropsWithoutRef } from "react";
import MediaPreviewDialog from "../MediaPreviewDialog";

export function FullscreenImage(
  props: PropsWithoutRef<JSX.IntrinsicElements["img"]>
) {
  const ImageContent = () => (
    <img className="w-full h-full object-cover rounded-md" {...props} />
  );
  return (
    <MediaPreviewDialog content={<ImageContent />} className="group w-full">
      <img
        className="rounded-xl aspect-auto object-cover p-2 cursor-pointer"
        {...props}
      />
    </MediaPreviewDialog>
  );
}
