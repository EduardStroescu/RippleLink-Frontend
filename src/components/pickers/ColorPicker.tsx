import React from "react";
import { RgbaColor, RgbaColorPicker } from "react-colorful";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

interface ColorPickerProps {
  children: React.ReactNode;
  color: RgbaColor | undefined;
  onChange: (color: RgbaColor) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  children,
  color,
  onChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="p-0 border-none shadow-none w-full h-full">
        <RgbaColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};
