import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { FileComponent } from "./ui";

export function MediaComponent({
  file,
  ...props
}: {
  file: string;
  props?: JSX.IntrinsicElements["video"];
}) {
  const MediaContent = () => (
    <video
      controls
      src={file}
      className="w-fit h-fit object-contain rounded-md"
      {...props}
    />
  );
  return (
    <MediaPreviewDialog
      className="group w-full h-full"
      contentClassName="w-fit h-fit"
      content={<MediaContent />}
    >
      <FileComponent
        fileName={file}
        className="w-full h-full max-w-none min-w-0 max-h-[95px] rounded-md m-0"
      />
    </MediaPreviewDialog>
  );
}
