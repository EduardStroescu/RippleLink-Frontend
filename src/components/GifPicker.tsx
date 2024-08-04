import React from "react";
import Picker, { Theme } from "gif-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";

interface GifPickerProps {
  children: React.ReactNode;
  getValue?: (gif: string) => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ children, getValue }) => {
  const onGifClick = (selectedGif: any) => {
    if (getValue) getValue(selectedGif.url);
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="hover:scale-110 transition-all ease-in-out cursor-pointer group">
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="p-0 absolute bottom-14 -right-6
          border-none
        "
        >
          <Picker
            theme={Theme.DARK}
            tenorApiKey={import.meta.env.VITE_TENOR_KEY!}
            onGifClick={onGifClick}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
