import Picker, { TenorImage, Theme } from "gif-picker-react";
import React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

interface GifPickerProps {
  children: React.ReactNode;
  getValue?: (gif: string) => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ children, getValue }) => {
  const onGifClick = (selectedGif: TenorImage) => {
    if (getValue) getValue(selectedGif.url);
  };
  return (
    <Popover>
      <PopoverTrigger
        title="Pick a GIF"
        aria-label="Pick a GIF"
        className="hover:scale-110 transition-all ease-in-out cursor-pointer group"
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={25}
        className="p-0 border-none w-full mx-2"
      >
        <Picker
          width="min(max(100%, 20vw), 95vw)"
          theme={Theme.DARK}
          tenorApiKey={import.meta.env.VITE_TENOR_KEY!}
          onGifClick={onGifClick}
        />
      </PopoverContent>
    </Popover>
  );
};
