import { PropsWithoutRef } from "react";
import MediaPreviewDialog from "../MediaPreviewDialog";
import { cn } from "@/lib/utils";

interface FullscreenImageProps {
  className?: string;
  props: PropsWithoutRef<JSX.IntrinsicElements["img"]>;
}

export function FullscreenImage({ className, ...props }: FullscreenImageProps) {
  const ImageContent = () => (
    <img className="w-full h-full object-cover rounded-md" {...props} />
  );
  return (
    <MediaPreviewDialog content={<ImageContent />} className="group">
      <img
        className={cn(
          "rounded-xl aspect-auto object-cover p-2 cursor-pointer",
          className
        )}
        {...props}
      />
    </MediaPreviewDialog>
  );
}
