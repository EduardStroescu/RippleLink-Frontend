import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/UI/Dialog";
import { useAppStore } from "@/stores/useAppStore";

interface CallDialogProps {
  header?: string;
  content?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  description?: string;
  className?: string;
}

const CallDialog: React.FC<CallDialogProps> = ({ content }) => {
  const incomingCalls = useAppStore((state) => state.incomingCalls);
  const [open, setOpen] = useState(!!incomingCalls.length);

  const contentWithProps = content
    ? React.cloneElement(content, { setOpen })
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        closeButtonEnabled={false}
        className="block max-w-xs
        border-none bg-transparent shadow-none outline-none
      "
      >
        {contentWithProps}
      </DialogContent>
    </Dialog>
  );
};

export default CallDialog;
