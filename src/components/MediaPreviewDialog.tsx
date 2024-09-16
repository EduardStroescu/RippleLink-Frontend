import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import clsx from "clsx";
import { cn } from "@/lib/utils";

interface MediaPreviewDialogProps {
  header?: string;
  content?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  children: React.ReactNode;
  description?: string;
  className?: string;
  contentClassName?: string;
}

export const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  header,
  content,
  children,
  description,
  className,
  contentClassName,
}) => {
  const [open, setOpen] = useState(false);

  const contentWithProps = content
    ? React.cloneElement(content, { setOpen })
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={clsx("", className)}>{children}</DialogTrigger>
      <DialogContent
        closeButtonEnabled={false}
        className={cn(
          "block w-fit md:w-fit max-w-[80dvw] max-h-[80dvh] p-0 border-none bg-transparent shadow-none outline-none",
          contentClassName
        )}
      >
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {contentWithProps}
      </DialogContent>
    </Dialog>
  );
};
