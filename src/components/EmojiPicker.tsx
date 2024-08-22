import React from "react";
import Picker, { Theme } from "emoji-picker-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";

interface EmojiPickerProps {
  children: React.ReactNode;
  getValue?: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  children,
  getValue,
}) => {
  const onClick = (selectedEmoji) => {
    if (getValue) getValue(selectedEmoji.emoji);
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="group text-[25px] origin-center hover:animate-spin-slow cursor-pointer">
          {children}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={25}
          className="p-0
          border-none mx-2
        "
        >
          <Picker
            onEmojiClick={onClick}
            theme={Theme.DARK}
            width="min(max(100%, 25vw), 95vw)"
            height="min(max(450px, 30vh), 80vh)"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
