import { MediaPreviewDialog } from "../MediaPreviewDialog";
import { cn } from "@/lib/utils";

interface FullscreenImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export function FullscreenImage({
  className,
  width,
  ...props
}: FullscreenImageProps) {
  const ImageContent = () => (
    <img
      className="w-full h-full object-contain aspect-square rounded-md"
      {...props}
    />
  );
  return (
    <div>
      <MediaPreviewDialog content={<ImageContent />} className="group">
        <img
          className={cn(
            "rounded-md aspect-square object-cover cursor-pointer py-1",
            className
          )}
          width={width}
          {...props}
        />
      </MediaPreviewDialog>
    </div>
  );
}
