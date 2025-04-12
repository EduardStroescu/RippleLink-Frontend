import { FileComponent } from "@/components/ui/FileComponent";
import { MediaPreviewDialog } from "@/components/ui/MediaPreviewDialog";

const MediaContent = ({ file, ...props }: { file: string }) => (
  <video
    controls
    src={file}
    className="w-fit h-fit object-contain rounded-md"
    {...props}
  />
);

export function MediaComponent({
  file,
  ...props
}: {
  file: string;
  props?: JSX.IntrinsicElements["video"];
}) {
  const fileName = file?.split("/").pop();

  return (
    <MediaPreviewDialog
      className={`group w-full h-full ${fileName === "placeholder" ? "pointer-events-none" : "pointer-events-auto"}`}
      contentClassName="w-fit h-fit"
      content={<MediaContent file={file} {...props} />}
    >
      <FileComponent
        fileName={fileName}
        href={fileName === "placeholder" ? fileName : undefined}
        className="w-full h-full max-w-none min-w-0 max-h-[95px] rounded-md m-0"
      />
    </MediaPreviewDialog>
  );
}
