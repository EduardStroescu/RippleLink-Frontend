import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useCallStore } from "@/stores/useCallStore";

interface CallDialogProps {
  header?: string;
  content?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    open?: boolean;
  }>;
  description?: string;
  className?: string;
}

const CallDialog: React.FC<CallDialogProps> = ({
  content,
  header,
  description,
}) => {
  const incomingCalls = useCallStore((state) => state.incomingCalls);
  const [open, setOpen] = useState(!!incomingCalls.length);

  useEffect(() => {
    setOpen(!!incomingCalls.length);
  }, [incomingCalls.length]);

  const contentWithProps = content
    ? React.cloneElement(content, { setOpen, open })
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        closeButtonEnabled={false}
        className="block max-w-sm
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

export default CallDialog;
