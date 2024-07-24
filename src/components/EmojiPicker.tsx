import React from "react";
import Picker from "emoji-picker-react";

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
        <PopoverTrigger className="hover:animate-spin-slow cursor-pointer bg-black/60 hover:bg-black/80 rounded-full p-1 text-xl">
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="p-0
          border-none
        "
        >
          <Picker onEmojiClick={onClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
