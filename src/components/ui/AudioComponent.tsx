import { PropsWithoutRef } from "react";
import { MediaPreviewDialog } from "../MediaPreviewDialog";

export function AudioComponent(
  props: PropsWithoutRef<JSX.IntrinsicElements["audio"]>
) {
  return (
    <MediaPreviewDialog
      className="group w-full py-2"
      content={
        <audio
          controls
          className="w-full h-full object-cover rounded-md"
          {...props}
        />
      }
    >
      <audio controls className="max-w-full" {...props} />
    </MediaPreviewDialog>
  );
}
