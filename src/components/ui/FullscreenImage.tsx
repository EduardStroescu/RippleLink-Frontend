import { Loader } from "@/components/ui/Loader";
import { MediaPreviewDialog } from "@/components/ui/MediaPreviewDialog";
import { cn } from "@/lib/utils";

interface FullscreenImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  contentClassName?: string;
}

export function FullscreenImage({
  className,
  contentClassName,
  width,
  src,
  ...props
}: FullscreenImageProps) {
  const ImageContent = () => (
    <img
      src={src}
      className="w-full h-full object-contain rounded-md max-w-fit max-h-[80dvh]"
      {...props}
    />
  );

  return (
    <MediaPreviewDialog
      content={<ImageContent />}
      className={cn(
        "group relative",
        src === "placeholder" ? "pointer-events-none" : "pointer-events-auto",
        className
      )}
    >
      {src === "placeholder" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-md object-cover">
          <Loader />
        </div>
      )}
      <img
        src={src !== "placeholder" ? src : "/placeholder.jpg"}
        className={cn(
          "rounded-md aspect-square object-cover cursor-pointer",
          contentClassName
        )}
        width={width}
        {...props}
      />
    </MediaPreviewDialog>
  );
}
