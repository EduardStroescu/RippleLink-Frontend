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

interface CustomDialogTriggerProps {
  header?: string;
  content?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  children: React.ReactNode;
  description?: string;
  className?: string;
  contentClassName?: string;
}

export const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = ({
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
        className={clsx(
          "w-[90%] border-[#282637] border-[1px]",
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
