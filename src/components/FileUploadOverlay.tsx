import React, { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

interface FileUploadOverlayProps {
  content?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  children: React.ReactNode;
}

export const FileUploadOverlay: React.FC<FileUploadOverlayProps> = ({
  content,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const contentWithProps = content
    ? React.cloneElement(content, { setOpen })
    : null;

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          title="Add File(s)"
          aria-label="Add File(s)"
          className="cursor-pointer group"
        >
          {children}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="top"
          sideOffset={25}
          className="p-0 border-none w-auto"
        >
          {contentWithProps}
        </PopoverContent>
      </Popover>
    </div>
  );
};
