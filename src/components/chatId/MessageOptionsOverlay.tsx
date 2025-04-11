import React, { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

interface MessageOptionsOverlayProps {
  content?: React.ReactElement<{
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  }>;
  portalInto?: Element | null;
  children: React.ReactNode;
}

export const MessageOptionsOverlay: React.FC<MessageOptionsOverlayProps> = ({
  content,
  portalInto,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const contentWithProps = content
    ? React.cloneElement(content, { setOpen })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="w-[40px] h-[35px] absolute z-[10] justify-end py-1 px-1.5 -right-1 -top-1 invisible pointer-events-none group-hover/message:visible flex bg-message-gradient">
        <PopoverTrigger
          title="Options"
          aria-label="Options"
          className="cursor-pointer group rotate-180 h-fit group-hover/message:pointer-events-auto"
        >
          {children}
        </PopoverTrigger>
      </div>
      <PopoverContent
        container={portalInto}
        align="end"
        side="top"
        className="p-0 border-none w-auto"
      >
        {contentWithProps}
      </PopoverContent>
    </Popover>
  );
};
