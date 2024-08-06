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
  const onClick = (selectedEmoji: any) => {
    if (getValue) getValue(selectedEmoji.emoji);
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="text-[25px] origin-center hover:animate-spin-slow cursor-pointer">
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="p-0 absolute bottom-16 -left-[4.5rem]
          border-none
        "
        >
          <Picker onEmojiClick={onClick} theme={Theme.DARK} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
