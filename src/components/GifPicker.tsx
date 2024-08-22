import React from "react";
import Picker, { Theme } from "gif-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";

interface GifPickerProps {
  children: React.ReactNode;
  getValue?: (gif: string) => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ children, getValue }) => {
  const onGifClick = (selectedGif) => {
    if (getValue) getValue(selectedGif.url);
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="hover:scale-110 transition-all ease-in-out cursor-pointer group">
          {children}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={25}
          className="p-0
          border-none w-full mx-2
        "
        >
          <Picker
            width="min(max(100%, 20vw), 95vw)"
            theme={Theme.DARK}
            tenorApiKey={import.meta.env.VITE_TENOR_KEY!}
            onGifClick={onGifClick}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
