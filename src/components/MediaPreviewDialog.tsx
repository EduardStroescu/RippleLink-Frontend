import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog";
import clsx from "clsx";

interface MediaPreviewDialogProps {
  header?: string;
  content?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  header,
  content,
  children,
  description,
  className,
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
        className="block
        border-none bg-transparent shadow-none outline-none
      "
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

export default MediaPreviewDialog;
