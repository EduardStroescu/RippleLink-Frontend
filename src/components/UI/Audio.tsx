import { PropsWithoutRef } from "react";
import MediaPreviewDialog from "../MediaPreviewDialog";

export function AudioComponent(
  props: PropsWithoutRef<JSX.IntrinsicElements["audio"]>
) {
  return (
    <MediaPreviewDialog
      content={
        <audio
          controls
          className="w-full h-full object-cover rounded-md"
          {...props}
        />
      }
      className="group w-full"
    >
      <audio controls className="rounded-md" {...props} />
    </MediaPreviewDialog>
  );
}
