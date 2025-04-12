import clsx from "clsx";
import React, { ComponentPropsWithoutRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

interface CustomDialogTriggerProps
  extends ComponentPropsWithoutRef<typeof DialogTrigger> {
  header?: string;
  dialogContent?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  children: React.ReactNode;
  description?: string;
  className?: string;
  contentClassName?: string;
}

export const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = ({
  header,
  dialogContent,
  children,
  description,
  className,
  contentClassName,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const contentWithProps = dialogContent
    ? React.cloneElement(dialogContent, { setOpen })
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={clsx("", className)} {...props}>
        {children}
      </DialogTrigger>
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
